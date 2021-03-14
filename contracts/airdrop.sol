// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/IERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

library TransferHelper {
    function safeApprove(address token, address to, uint value) internal {
        // bytes4(keccak256(bytes('approve(address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x095ea7b3, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: APPROVE_FAILED');
    }

    function safeTransfer(address token, address to, uint value) internal {
        // bytes4(keccak256(bytes('transfer(address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0xa9059cbb, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FAILED');
    }

    function safeTransferFrom(address token, address from, address to, uint value) internal {
        // bytes4(keccak256(bytes('transferFrom(address,address,uint256)')));
        (bool success, bytes memory data) = token.call(abi.encodeWithSelector(0x23b872dd, from, to, value));
        require(success && (data.length == 0 || abi.decode(data, (bool))), 'TransferHelper: TRANSFER_FROM_FAILED');
    }
}

contract Airdrop is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    struct UserInfo {
        uint256 amount;
        uint256 rewardDebt;
    }

    struct PeriodInfo {
        uint256 startBlock;
        uint256 endBlock;
        uint256 price;
        uint256 rewardPerUser;
        uint256 totalReward;
        uint256 totalAlloc;
    }

    address public usdt;
    address public bxh;

    // Info of each pool.
    PeriodInfo[] public peroidInfo;
    // Info of each user that tokens.
    mapping(uint256 => mapping(address => UserInfo)) public userInfo;

    // Total allocation points. Must be the sum of all allocation points in all pools.
    uint256 public totalAllocAmount = 0;
    uint256 public totalRewardAmount = 0;
    uint256 public currentPeroid = 0;

    event Withdraw(address indexed user, uint256 indexed pid, uint256 amount);

    event EmergencyWithdraw(address indexed user, uint256 indexed pid, uint256 amount);

    constructor(
        address _usdt,
        address _bxh
    ) public {
        usdt = _usdt;
        bxh = _bxh;
    }

    function peroidLength() external view returns (uint256) {
        return peroidInfo.length;
    }

    function newAirdrop(uint256 _startBlock,uint256 _endBlock,uint256 _price,uint256 _rewardPerUser,uint256 _totalReward) public onlyOwner {
        //require(block.number > endBlock && _startBlock >= endBlock, "Not finished");

        TransferHelper.safeTransferFrom(address(bxh), msg.sender, address(this), _totalReward);

        currentPeroid = peroidInfo.length;

        peroidInfo.push(PeriodInfo({
            startBlock : _startBlock,
            endBlock : _endBlock,
            price : _price,
            rewardPerUser: _rewardPerUser,
            totalReward: _totalReward,
            totalAlloc: 0
        }));

    }

    // Deposit USDT tokens to withdraw bxh;
    function withdraw() public {
        
        require(currentPeroid < peroidInfo.length,"No AirDrops");

        PeriodInfo storage peroid = peroidInfo[currentPeroid];
        require(block.number >= peroid.startBlock,"Not Started");
        require(block.number <= peroid.endBlock,"AirDrop Peroid Ended");
        require(peroid.totalAlloc.add(peroid.rewardPerUser)<peroid.totalReward,"AirDrop AllocAmount exeed MaxAmount");

        UserInfo storage user = userInfo[currentPeroid][msg.sender];
        require(user.amount == 0, "User already fetch");

        TransferHelper.safeTransferFrom(usdt,msg.sender,address(this),peroid.price);

        peroid.totalAlloc=peroid.totalAlloc.add(peroid.rewardPerUser);

        user.amount = peroid.rewardPerUser;
        user.rewardDebt = peroid.rewardPerUser;

        TransferHelper.safeTransfer(bxh,address(msg.sender), user.amount);
        emit Withdraw(msg.sender, currentPeroid, user.amount);
    }

    



}
