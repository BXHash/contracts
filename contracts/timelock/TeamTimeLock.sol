// SPDX-License-Identifier: MIT

pragma solidity ^0.6.6;

import '@openzeppelin/contracts/math/SafeMath.sol';
import '@openzeppelin/contracts/token/ERC20/IERC20.sol';
import '@openzeppelin/contracts/token/ERC20/SafeERC20.sol';


contract TeamTimeLock {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    IERC20 public token;
    uint256 public blockReward;  // Monthly rewards are fixed
    uint256 public startBlock;
    uint256 public endBlock;
    uint256 public rewardDept;  // Rewards already withdrawn
    address public beneficiary;
    string public introduce;
    uint256 public maxReward;

    event WithDraw(address indexed operator, address indexed to, uint256 amount);

    constructor(
        address _beneficiary,
        address _token,
        uint256 _maxReward,
        uint256 _startBlock,
        uint256 _endBlock,
        string memory _introduce
    ) public {
        require(_beneficiary != address(0) && _token != address(0), "TimeLock: zero address");
        require(_maxReward > 0, "TimeLock: _maxReward is zero");
        beneficiary = _beneficiary;
        token = IERC20(_token);
        maxReward = _maxReward.mul(1e18);
        blockReward = maxReward.div(_endBlock.sub(_startBlock));
        startBlock = _startBlock;
        endBlock = _endBlock;
        rewardDept = 0;
        introduce = _introduce;
    }


    function getBalance() public view returns (uint256) {
        return token.balanceOf(address(this));
    }

    function getCurrentReward() public view returns (uint256) {
        if(token.balanceOf(address(this))<=0){
            return 0;
        }

        uint256 reward=getReward(block.number);        

        if (reward >= token.balanceOf(address(this))) {
            return token.balanceOf(address(this));
        }
        return reward;


    }
    function getReward(uint256 blocknumber) public view returns (uint256) {
        if (blocknumber <= startBlock) {
            return 0;
        }
        uint256 reward= blocknumber.sub(startBlock).mul(blockReward).sub(rewardDept);
        if(reward >= maxReward ){
            return maxReward;
        }
        return reward;
    }

    function withDraw() external {
        uint256 reward = getCurrentReward();
        require(reward > 0, "TimeLock: no reward");
        rewardDept = rewardDept.add(reward);
        token.safeTransfer(beneficiary, reward);
        emit WithDraw(msg.sender, beneficiary, reward);
    }

    // Update beneficiary address by the previous beneficiary.
    function setBeneficiary(address _newBeneficiary) public {
        require(msg.sender == beneficiary, "Not beneficiary");
        beneficiary = _newBeneficiary;
    }
}
