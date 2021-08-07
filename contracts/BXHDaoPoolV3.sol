// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/utils/Context.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/AccessControl.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract BXHDAOPoolV3 is Ownable{
    
    using SafeERC20 for IERC20;
    using SafeMath for uint256;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
        uint256 lockCount;
        uint256 unlockIdx;
    }

    struct LockInfo{
        uint256 amount;
        uint256 lockStartBlock;
        uint256 lockEndBlock;
    }
    
    mapping(address => UserInfo) public userInfo;
    mapping(address => mapping(uint256=>LockInfo)) public userLockInfo;
    
    
    IERC20 public dToken;

    IERC20 public BonusToken;
    
    uint256 public epochLength; //864000
    uint256 public userLockLength;//864000
    uint256 public rewardsPerBlocks;
    uint256 public rewardsStartBlock;
    uint256 public rewardsEndBlock;
    uint256 public accRewardsPerShare;//
    uint256 public accRewards;//
    uint256 public totalRewards;//
    uint256 public totalAmount;

    uint256 public lastRewardBlock;

    event Deposit(address indexed user,  uint256 amount);
    event Withdraw(address indexed user, uint256 amount);
    event EmergencyWithdraw(address indexed user, uint256 amount);

    
    constructor(address dAddress,address bAddress,uint256 _startBlock,uint256 _epochLength,uint256 _userLockLength) public {
        dToken = IERC20(dAddress);
        BonusToken = IERC20(bAddress);
        rewardsStartBlock = _startBlock;
        rewardsEndBlock = _startBlock.add(epochLength);
        epochLength = _epochLength;
        userLockLength = _userLockLength;
    }

    function setStartBlock(uint256 _startBlock) external onlyOwner{
        require(_startBlock>block.number,'startblock?');
        rewardsStartBlock = _startBlock;
        rewardsEndBlock = _startBlock.add(epochLength);
    }

    
    function setEpochLength(uint256 blockCount) external onlyOwner{
        require(blockCount>0,'pending epoch');
        require(block.number>rewardsEndBlock,' epoch end?');
        epochLength = blockCount;
    }
    function setUserLockLength(uint256 _userLockLength) external onlyOwner{
        require(_userLockLength>0,'lock length?');
        userLockLength = _userLockLength;
    }

    function getBlockReward(uint256 _lastRewardBlock) public view returns (uint256 blockReward) {
        if(_lastRewardBlock<rewardsStartBlock)
        {
            _lastRewardBlock=rewardsStartBlock;
        }
        
        require(block.number>=_lastRewardBlock,'reward not started');
        if(block.number>=rewardsEndBlock){
            if(_lastRewardBlock>rewardsEndBlock)
            {
                blockReward = 0;
            }
            else{
                blockReward = (rewardsEndBlock.sub(_lastRewardBlock)).mul(rewardsPerBlocks);
            }
        }else{
            blockReward = (block.number.sub(_lastRewardBlock)).mul(rewardsPerBlocks);
        }
    }

    function update() public {
        if(block.number<rewardsStartBlock)
        {
            return;
        }
        if(lastRewardBlock>=block.number){
            return;
        }
        uint256 lpSupply = dToken.balanceOf(address(this));
      
        if (lpSupply == 0) {
            lastRewardBlock = block.number;
            return;
        }

        uint256 blockReward = getBlockReward(lastRewardBlock);
        if (blockReward <= 0) {
            return;
        }

        accRewards = accRewards.add(blockReward);
        accRewardsPerShare = accRewardsPerShare.add(blockReward.mul(1e12).div(lpSupply));
        lastRewardBlock = block.number;
        
        
    }
    function addRewards(uint256 amount) public {
        update();
        BonusToken.safeTransferFrom(msg.sender, address(this), amount);
        rewardsPerBlocks = totalRewards.sub(accRewards).add(amount).div(epochLength);
        totalRewards = totalRewards.add(amount);
        if(block.number>rewardsStartBlock)
        {
            rewardsEndBlock = block.number.add(epochLength);
        }else{
            rewardsEndBlock = rewardsStartBlock.add(epochLength);
        }
        // rewardsPerBlocks = rewardsPerBlocks.add(amount.div(epochLength));
    }


    function deposit(uint256 _amount,address _to) external {
        update();

        address _user = msg.sender;
        UserInfo storage user = userInfo[_user];
        
        if (user.amount > 0) {
            uint256 pendingBlockAmount = user.amount.mul(accRewardsPerShare).div(1e12).sub(user.rewardDebt);
            if (pendingBlockAmount > 0) {
                safeTransfer(_to, pendingAmount);
            }
        }
        if (_amount > 0) {
            dToken.safeTransferFrom(_user, address(this), _amount);
            user.amount = user.amount.add(_amount);
            totalAmount=totalAmount.add(_amount);
            LockInfo storage lockInfo = userLockInfo[_user][user.lockCount];
            lockInfo.amount = _amount;
            lockInfo.lockStartBlock = block.number;
            lockInfo.lockEndBlock = block.number.add(userLockLength);
            user.lockCount = user.lockCount.add(1);
        }
        user.rewardDebt = user.amount.mul(accRewardsPerShare).div(1e12);
        
        emit Deposit(_user, _amount);
    }
   
    function pendingRewards(address _user) public view returns (uint256){
        UserInfo storage user = userInfo[_user];
        uint256 lpSupply = dToken.balanceOf(address(this));
        uint256 accPerShare = accRewardsPerShare;
        if (user.amount > 0) {
            if (block.number > lastRewardBlock) {
                uint256 blockReward = getBlockReward(lastRewardBlock);
                accPerShare = accPerShare.add(blockReward.mul(1e12).div(lpSupply));
                return user.amount.mul(accPerShare).div(1e12).sub(user.rewardDebt);
            }
            if (block.number == lastRewardBlock) {
                return user.amount.mul(accPerShare).div(1e12).sub(user.rewardDebt);
            }
        }
        return 0;
    }
    
    function withdraw(uint256 _amount,address _to,uint256 maxloop) external returns (uint256 unlockAmount) {
        address _user = msg.sender;
        UserInfo storage user = userInfo[_user];
        require(user.amount >= _amount, "withdraw: not good");
        update();
        uint256 pendingAmount = user.amount.mul(accRewardsPerShare).div(1e12).sub(user.rewardDebt);
        if (pendingAmount > 0) {
            safeTransfer(_to, pendingAmount);
        }
        
        if (_amount > 0) {
            uint256 blocknumber = block.number;
            for(uint i=0; i<maxloop ;i++){
                //max maxloop for gas saving
                LockInfo storage lockInfo = userLockInfo[_user][user.unlockIdx];
                if(blocknumber<lockInfo.lockEndBlock||lockInfo.lockEndBlock==0){
                    break;
                }
                if(lockInfo.amount>=_amount){
                    unlockAmount = unlockAmount.add(_amount);
                    lockInfo.amount = lockInfo.amount.sub(_amount);
                    _amount = 0;
                    break;
                }else{
                    unlockAmount = unlockAmount.add(lockInfo.amount);
                    _amount = _amount.sub(lockInfo.amount);
                    lockInfo.amount = 0;
                    user.unlockIdx = user.unlockIdx.add(1);
                }
            }
            if(unlockAmount>0)
            {
                user.amount = user.amount.sub(unlockAmount);
                totalAmount=totalAmount.sub(unlockAmount);
                dToken.safeTransfer(_to, unlockAmount);
            }
        }
        user.rewardDebt = user.amount.mul(accRewardsPerShare).div(1e12);
        emit Withdraw(_user, unlockAmount);
    }

     function emergencyWithdraw(uint256 maxloop) external returns(uint256 unlockAmount){
        UserInfo storage user = userInfo[msg.sender];
        uint256 _amount = user.amount;
        uint256 blocknumber = block.number;
        for(uint i=0; i<maxloop ;i++){
            //max maxloop for gas saving
            LockInfo storage lockInfo = userLockInfo[msg.sender][user.unlockIdx];
            if(blocknumber<lockInfo.lockEndBlock||lockInfo.lockEndBlock==0){
                break;
            }
            if(lockInfo.amount>=_amount){
                unlockAmount = unlockAmount.add(_amount);
                lockInfo.amount = lockInfo.amount.sub(_amount);
                _amount = 0;
                break;
            }else{
                unlockAmount = unlockAmount.add(lockInfo.amount);
                _amount = _amount.sub(lockInfo.amount);
                lockInfo.amount = 0;
                user.unlockIdx = user.unlockIdx.add(1);
            }
        }
        if(unlockAmount>0){
            user.amount = user.amount.sub(unlockAmount);
            // user.rewardDebt = 0;
            user.rewardDebt = user.amount.mul(accRewardsPerShare).div(1e12);
            totalAmount=totalAmount.sub(unlockAmount);
            dToken.safeTransfer(msg.sender, unlockAmount);
            emit EmergencyWithdraw(msg.sender, unlockAmount);
        }
    }
    function sweepBonus(address _to)external onlyOwner{
        require(totalAmount==0,'user has deposit');
        uint256 lpSupply = dToken.balanceOf(address(this));
        if(lpSupply>0){
            dToken.safeTransfer(_to, lpSupply);
        }
        uint256 bonus = BonusToken.balanceOf(address(this));
        if(bonus>0){
            safeTransfer(_to,bonus);
        }

    }

    // Safe bonus transfer function, just in case if rounding error causes pool to not have enough BXHs.
    function safeTransfer(address _to, uint256 _amount) internal {
        uint256 bal = BonusToken.balanceOf(address(this));
        if (_amount > bal) {
            BonusToken.transfer(_to, bal);
        } else {
            BonusToken.transfer(_to, _amount);
        }
    }

}