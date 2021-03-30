// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';
import "@openzeppelin/contracts/access/Ownable.sol";


contract TeamTimeLock is Ownable{
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public token;
    uint256 public blockReward;  // Monthly rewards are fixed
    uint256 public startBlock;
    uint256 public endBlock;
    uint256 public rewardDept;  // Rewards already withdrawn
    //address public beneficiary;
    string public introduce;
    uint256 public maxReward;

    // Info of each user.
    struct UserInfo {
        uint256 amount;     // How many LP tokens the user has provided.
        uint256 rewardDebt; // Reward debt.
    }

    mapping(address => UserInfo) userInfos;
    uint256 public totalShare;
    bool public paused;

    event WithDraw(address indexed operator, address indexed to, uint256 amount);

    constructor(
        address _token,
        uint256 _maxReward,
        uint256 _startBlock,
        uint256 _endBlock,
        string memory _introduce
    ) public {
        require(_maxReward > 0, "TimeLock: _maxReward is zero");
        token = IERC20(_token);
        maxReward = _maxReward.mul(1e18);
        blockReward = maxReward.div(_endBlock.sub(_startBlock));
        startBlock = _startBlock;
        endBlock = _endBlock;
        rewardDept = 0;
        introduce = _introduce;
        paused = true;
    }

    function initParams(uint256 _maxReward,
        uint256 _startBlock,
        uint256 _endBlock) public onlyOwner {
        require(paused == true, "Benifit has been started");

        maxReward = _maxReward.mul(1e18);
        blockReward = maxReward.div(_endBlock.sub(_startBlock));
        startBlock = _startBlock;
        endBlock = _endBlock;
        rewardDept = 0;

    }


    modifier notPause() {
        require(paused == false, "Benifit has been suspended");
        _;
    }


    function setPause() public onlyOwner {
        paused = !paused;
    }

    function addUser(address addr,uint256 amount) public onlyOwner{
        require(paused,"benefit is running");

        UserInfo storage user = userInfos[addr];
        user.amount = user.amount.add(amount);
        totalShare = totalShare.add(amount);

    }

    function removeUser(address addr,uint256 amount) public onlyOwner{
        require(paused,"benefit is running");
        UserInfo storage user = userInfos[addr];
        require(user.amount > 0 , "user not beneficiary");
        totalShare = totalShare.sub(amount);
        user.amount = user.amount.sub(amount);
    }

    function getBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }


    function getCurrentUserReward(address addr) public notPause view returns (uint256) {
        uint256 reward = getReward(addr,block.number);
        
        if(reward <= token.balanceOf(address(this))){
            return reward;
        }

        return token.balanceOf(address(this));

    }

    

    function getTotalReward(uint256 blocknumber) public notPause view returns (uint256) {
        if (blocknumber <= startBlock) {
            return 0;
        }
        
        uint256 totalReward= blocknumber.sub(startBlock).mul(blockReward);
        if(totalReward >= maxReward ){
            return maxReward;
        }
        return totalReward;
    }


    function getReward(address addr,uint256 blocknumber) public notPause view returns (uint256) {

        UserInfo storage user = userInfos[addr];
        if(user.amount==0){
            return 0;
        }
        uint256 totalReward=getTotalReward(blocknumber);
        uint256 reward = totalReward.mul(user.amount).div(totalShare).sub(user.rewardDebt);
        return reward;
    }



    function withDraw(address beneficiary) notPause external  {
        UserInfo storage user = userInfos[beneficiary];
        if(user.amount > 0){   
            uint256 reward = getCurrentUserReward(beneficiary);
            require(reward > 0, "TimeLock: no reward");
            user.rewardDebt = user.rewardDebt.add(reward);
            token.safeTransfer(beneficiary, reward);
            emit WithDraw(msg.sender, beneficiary, reward);
        }
    }


}
