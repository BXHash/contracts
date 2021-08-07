
// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "./DelegateERC20.sol";
import "./XToken.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BXHDAOPool is Ownable{
    
    struct UnlockRequest {
        uint256 amount;
        uint256 unlockTimestamp;
    }
    
    struct UserInfo {
        uint256 amount;     
        uint256 lastRewardedEpoch;
    }
    
    struct SharesAndRewardsInfo {
        uint256 activeShares;     
        uint256 pendingSharesToAdd;
        uint256 pendingSharesToReduce;
        uint256 rewards;
        uint256 claimedRewards;
        uint256 lastUpdatedEpochFlag;
    }
    
    uint256 public epochLength;
    
    uint256 public startTime;
    
    uint256 public lockingLength;
    
    SharesAndRewardsInfo public sharesAndRewardsInfo;
    
    mapping(address => UserInfo) public userInfo;
    
    mapping(address => UnlockRequest[]) public userUnlockRequests;
    
    ERC20 public BonusToken;
    
    ERC20 public dToken;
    
    XToken public xToken;
    
    constructor(address xAddress,address dAddress,address bAddress,uint256 _startTime) public {
        epochLength = 30 days; 
        xToken = XToken(xAddress);
        dToken = ERC20(dAddress);
        BonusToken = ERC20(bAddress);
        lockingLength = 7 days; 
        startTime = _startTime;
    }

    function setStartTime(uint256 _startTime) public onlyOwner {
        startTime = _startTime;
    }

    function setLockingParams(uint256 _epochLength,uint256 _lockingLength) public onlyOwner {
        epochLength = _epochLength;
        lockingLength = _lockingLength;
    }
    

    function _relock(uint256 index) private {
        UserInfo storage user = userInfo[msg.sender];
        UnlockRequest[] storage reqs = userUnlockRequests[msg.sender];
        user.amount = SafeMath.add(user.amount, reqs[index].amount);
        sharesAndRewardsInfo.pendingSharesToAdd = SafeMath.add(sharesAndRewardsInfo.pendingSharesToAdd, reqs[index].amount) ;
        require(xToken.mint(msg.sender, reqs[index].amount), "stake mint failed");
        
        _deleteRequestAt(index);
    }
    
    function _deleteRequestAt(uint256 index) private {
        UnlockRequest[] storage reqs = userUnlockRequests[msg.sender];
        for (uint256 i = index; i < reqs.length - 1; i++) {
            reqs[i] = reqs[i + 1];
        }
        reqs.pop();
    }

    function _claim(address _user) private {
        UserInfo storage user = userInfo[_user];
        uint256 rewards = pendingReward(_user);
        if (rewards > 0) {
            sharesAndRewardsInfo.claimedRewards = SafeMath.add(sharesAndRewardsInfo.claimedRewards, rewards);
            require(BonusToken.transfer(_user, rewards), "_claim transfer failed");
        }
        user.lastRewardedEpoch = currentEpoch();
    }

    function _updateSharesAndRewardsInfo() private {
        if (sharesAndRewardsInfo.lastUpdatedEpochFlag < currentEpoch()) {
            sharesAndRewardsInfo.activeShares = 
                SafeMath.sub(
                    SafeMath.add(sharesAndRewardsInfo.activeShares, sharesAndRewardsInfo.pendingSharesToAdd),
                    sharesAndRewardsInfo.pendingSharesToReduce
                );
            sharesAndRewardsInfo.pendingSharesToAdd = 0;
            sharesAndRewardsInfo.pendingSharesToReduce = 0;
            sharesAndRewardsInfo.rewards = BonusToken.balanceOf(address(this));
            sharesAndRewardsInfo.lastUpdatedEpochFlag = currentEpoch();
            sharesAndRewardsInfo.claimedRewards = 0;
        }
    }

    function shareAmount() public view returns(uint256) {
        if (sharesAndRewardsInfo.lastUpdatedEpochFlag < currentEpoch()) {
            return SafeMath.sub(
                SafeMath.add(sharesAndRewardsInfo.activeShares, sharesAndRewardsInfo.pendingSharesToAdd),
                sharesAndRewardsInfo.pendingSharesToReduce
            );
        } else {
            return sharesAndRewardsInfo.activeShares;
        }
    }
    
    function rewardsAmount() public view returns(uint256) {
        if (sharesAndRewardsInfo.lastUpdatedEpochFlag < currentEpoch()) {
            return BonusToken.balanceOf(address(this));
        } else {
            return sharesAndRewardsInfo.rewards;
        }
    }
    
    function currentEpoch() public view returns(uint256) {
        if (block.timestamp < startTime) return 0;
        uint256 period = SafeMath.sub(block.timestamp, startTime);
        return SafeMath.div(period, epochLength);
    }

    function pendingReward(address who) public view returns (uint256) {
        if (currentEpoch() == 0) return 0;
        
        UserInfo storage user = userInfo[who];
        uint256 totalAmount = shareAmount();
        if (totalAmount != 0 && user.lastRewardedEpoch < currentEpoch()) {
            uint256 BonusTokenBalance = BonusToken.balanceOf(address(this));
            uint256 myRewardsAmount = SafeMath.div(SafeMath.mul(user.amount, rewardsAmount()), totalAmount);
            // If rewards is larger than BonusToken Balance, then all BonusToken will be the rewards.
            // But it is unlikely BonusTokenBalance be less than myRewardsAmount.
            return BonusTokenBalance < myRewardsAmount ? BonusTokenBalance : myRewardsAmount;
        } else {
            return 0;
        }
    }
    
    function _unlockingAmount(address who) public view returns (uint256) {
        UnlockRequest[] memory reqs = userUnlockRequests[who];
        uint256 sum = 0;
        for (uint256 i = 0; i < reqs.length; i++) {
            sum += reqs[i].amount;
        }
        return sum;
    }

    function lockRequestCount(address who) public view returns (uint256) {
        return userUnlockRequests[who].length;
    }
    
    function unlockableAmount(address who) public view returns (uint256) {
        UserInfo memory user = userInfo[who];
        if (user.amount <= xToken.balanceOf(who)) {
            return user.amount;
        } else {
            return xToken.balanceOf(who);
        }
    }
    
    function unstakableAmount(address who) public view returns (uint256) {
        UnlockRequest[] memory reqs = userUnlockRequests[who];
        uint256 sum = 0;
        for (uint256 i = 0; i < reqs.length; i++) {
            if (block.timestamp - reqs[i].unlockTimestamp > lockingLength) {
                sum += reqs[i].amount;
            }
        }
        return sum;
    }
    
    function claimedRewards() public view returns (uint256) {
        if (sharesAndRewardsInfo.lastUpdatedEpochFlag < currentEpoch()) {
            return 0;
        } else {
            return sharesAndRewardsInfo.claimedRewards;
        }
    }
    
    function donateBonusToken(uint256 amount) public {
        _updateSharesAndRewardsInfo();
        require(BonusToken.transferFrom(msg.sender, address(this), amount), "donateBonusToken transferFrom failed");
    }
    
    function stake(uint256 _amount) public {
        require(_amount > 0);
        _updateSharesAndRewardsInfo();
        _claim(msg.sender);
        
        UserInfo storage user = userInfo[msg.sender];
        require(dToken.transferFrom(msg.sender, address(this), _amount), "stake transferFrom failed");
        user.amount = SafeMath.add(user.amount, _amount) ;
        sharesAndRewardsInfo.pendingSharesToAdd = SafeMath.add(sharesAndRewardsInfo.pendingSharesToAdd, _amount);
        require(xToken.mint(msg.sender, _amount), "stake mint failed");
    }
    
    function unlock(uint256 _amount) public {
        require(unlockableAmount(msg.sender) >= _amount, "unlock over unlockableAmount");
        
        _updateSharesAndRewardsInfo();
        _claim(msg.sender);
        
        sharesAndRewardsInfo.pendingSharesToReduce = SafeMath.add(sharesAndRewardsInfo.pendingSharesToReduce, _amount);
        UserInfo storage user = userInfo[msg.sender];
        user.amount = SafeMath.sub(user.amount, _amount);
        userUnlockRequests[msg.sender].push(UnlockRequest({
            amount: _amount,
            unlockTimestamp: block.timestamp
        }));
        require(xToken.burn(msg.sender, _amount), "unlock burn failed");
    }
    
    function relock(uint256 index) public {
        _updateSharesAndRewardsInfo();
        _claim(msg.sender);

        _relock(index);
    }
    
    function relockAll() public {
        _updateSharesAndRewardsInfo();
        _claim(msg.sender);

        uint256 reqsN = userUnlockRequests[msg.sender].length;
        for (uint256 i = reqsN - 1; i > 0; i--) {
            _relock(i);
        }
        _relock(0);
    }

    function unStake() public {
        _updateSharesAndRewardsInfo();
        _claim(msg.sender);

        UnlockRequest[] storage reqs = userUnlockRequests[msg.sender];
        uint256 amount = unstakableAmount(msg.sender);
        require(amount != 0, "no available deposit token");
        dToken.transfer(msg.sender, amount);
        for (uint256 iPlusOne = reqs.length; iPlusOne > 0; iPlusOne--) {
            uint256 i = iPlusOne - 1;
            if (block.timestamp - reqs[i].unlockTimestamp > lockingLength) {
                _deleteRequestAt(i);
            }
        }
    }

    function claim(address _user) public {
        _updateSharesAndRewardsInfo();
        _claim(_user);
    }
    
}