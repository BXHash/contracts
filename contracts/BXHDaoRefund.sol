// SPDX-License-Identifier: MIT
pragma solidity ^0.6.0;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";

import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/ReentrancyGuard.sol";

contract BXHDaoRefund is  Ownable,ReentrancyGuard {
    using SafeERC20 for IERC20;
    using Address for address;
    using SafeMath for uint256;

    address public depositToken;
    address public daoToken;
    bool    public paused = false;

    event TokenRefund(address indexed from,address indexed to, uint256 value);
    address public emergencyAddress;
  
    constructor(
        address _depositToken,
        address _daoToken,address _emergencyAddress)public {
        depositToken = _depositToken;
        daoToken = _daoToken;
        emergencyAddress = _emergencyAddress;
    }

   modifier onlyHuman {
        require(msg.sender == tx.origin);
        _;
    }
    // from dao token to depositToken;
    function switchToken(address to,uint256 amount) public payable nonReentrant onlyHuman whenNotPaused{
        require(IERC20(daoToken).balanceOf(msg.sender)>=amount,"not enough dao amount");
        require(IERC20(depositToken).balanceOf(address(this))>=amount,"not enough deposit Token");

        uint256 _before = IERC20(daoToken).balanceOf(address(this));
        IERC20(daoToken).safeTransferFrom(msg.sender, address(this), amount);
        uint256 _after = IERC20(daoToken).balanceOf(address(this));
        uint256 shares = _after.sub(_before);
        IERC20(depositToken).safeTransfer(to, shares);

        emit TokenRefund(msg.sender,to,shares);

    }

    modifier whenNotPaused() {
        require(!paused, "Pausable: paused");
        _;
    }


    function setEmergencyAddress(address _newAddress) public onlyOwner {
        require(_newAddress != address(0), "Is zero address");
        emergencyAddress = _newAddress;
    }

     function togglePause(bool _paused) public onlyOwner {
        paused = _paused;
    }


    function emergencyWithdraw(address _token) public onlyOwner {
        require(IERC20(_token).balanceOf(address(this)) > 0, "Insufficient contract balance");
        IERC20(_token).transfer(emergencyAddress, IERC20(_token).balanceOf(address(this)));
    }

}