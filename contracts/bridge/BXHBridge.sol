// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/utils/Pausable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/math/SafeMath.sol";

import "./OperatorSet.sol";
import '../uniswapv2/libraries/TransferHelper.sol';

contract BXHBridge is  OperatorSet, Pausable {

    using SafeMath for uint256;

    
    
    string public constant name = "BXHBridge";

    event LockRequest(address indexed from,address indexed tokenAddr,uint chainID, address indexed toAddr,uint256 value);

    event FeeAddrChanged(address indexed newAddr);

    event FeeChanged(uint256 indexed newvalue);
    
    address public feeAddr;
    uint256 public feePerTx;

    constructor(address _feeAddr,uint256 _feePerTx,address  _emergencyAddress)public{
        feeAddr = _feeAddr;
        feePerTx = _feePerTx;
        emergencyAddress = _emergencyAddress;
    }

    function changeFeeAddr(address _feeAddr) public onlyOwner{
        feeAddr = _feeAddr;
        emit FeeAddrChanged(feeAddr);
    }

    function changeFeePerTx(uint256 _feePerTx) public onlyOwner{
        feePerTx = _feePerTx;
        emit FeeChanged(feePerTx);
    }

    function lock(address _tokenAddr,uint _toChainID, address _toAddr, uint256 _amount) public {
        require(_toAddr!=address(0x0),"address error");
        require(ERC20(_tokenAddr).balanceOf(msg.sender)>=_amount,"Not Enough Balance");
        require(_amount>feePerTx,"Not Enough Balance for fee");
        uint256 amount = _amount;
        uint256 feeAmount = amount.mul(feePerTx).div(10000);
        amount = amount.sub(feeAmount);
        TransferHelper.safeTransferFrom(_tokenAddr,msg.sender,feeAddr,feeAmount);
        TransferHelper.safeTransferFrom(_tokenAddr,msg.sender,address(this),amount);
        emit LockRequest(msg.sender,_tokenAddr,_toChainID,_toAddr,_amount);

    }

    address public emergencyAddress;

    function setEmergencyAddress(address _newAddress) public onlyOwner {
        require(_newAddress != address(0), "Is zero address");
        emergencyAddress = _newAddress;
    }

    function emergencyWithdraw(address _token) public onlyOperator {
        require(IERC20(_token).balanceOf(address(this)) > 0, "Insufficient contract balance");
        IERC20(_token).transfer(emergencyAddress, IERC20(_token).balanceOf(address(this)));
    }


    

}