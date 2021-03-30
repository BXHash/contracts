// SPDX-License-Identifier: MIT
pragma solidity ^0.6.12;
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/token/ERC20/SafeERC20.sol";
import "@openzeppelin/contracts/utils/EnumerableSet.sol";
import './interfaces/IBXH.sol';
import './uniswapv2/interfaces/IUniswapV2Pair.sol';
import "./DelegateERC20.sol";

contract Repurchase is Ownable {
    using SafeMath for uint256;
    using SafeERC20 for IERC20;

    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private _caller;

    address public constant USDT = 0xa71EdC38d189767582C38A3145b5873052c3e47a;
    address public constant BXH = 0xcBD6Cb9243d8e3381Fea611EF023e17D1B7AeDF0;
    address public constant BXH_USDT = 0x8611a52e8AC5E10651DF7C4b58F42536f0bd2e7E;
    address public constant blackHoleAddress = 0x456D9eFa4f8039De66C8fD4a6d22953D33C6977d;
    address public constant DAOAddress = 0x0Ef67c16904Af312796560dF80E60581C43C4e24;
    address public emergencyAddress;
    uint256 public amountIn;

    constructor (uint256 _amount, address _emergencyAddress) public {
        require(_amount > 0, "Amount must be greater than zero");
        require(_emergencyAddress != address(0), "Is zero address");
        amountIn = _amount;
        emergencyAddress = _emergencyAddress;
    }

    function setAmountIn(uint256 _newIn) public onlyOwner {
        amountIn = _newIn;
    }

    function setEmergencyAddress(address _newAddress) public onlyOwner {
        require(_newAddress != address(0), "Is zero address");
        emergencyAddress = _newAddress;
    }

    function addCaller(address _newCaller) public onlyOwner returns (bool) {
        require(_newCaller != address(0), "NewCaller is the zero address");
        return EnumerableSet.add(_caller, _newCaller);
    }

    function delCaller(address _delCaller) public onlyOwner returns (bool) {
        require(_delCaller != address(0), "DelCaller is the zero address");
        return EnumerableSet.remove(_caller, _delCaller);
    }

    function getCallerLength() public view returns (uint256) {
        return EnumerableSet.length(_caller);
    }

    function isCaller(address _call) public view returns (bool) {
        return EnumerableSet.contains(_caller, _call);
    }

    function getCaller(uint256 _index) public view returns (address){
        require(_index <= getCallerLength() - 1, "index out of bounds");
        return EnumerableSet.at(_caller, _index);
    }
    function swapV() external view returns (uint256 amountOut){
        
        // require(IERC20(USDT).balanceOf(address(this)) >= amountIn, "Insufficient contract balance");
        uint256 amountHalf = amountIn.div(2);
        {
            (uint256 reserve0, uint256 reserve1,) = IUniswapV2Pair(BXH_USDT).getReserves();
            uint256 amountInWithFee = amountHalf.mul(997);
            amountOut = amountHalf.mul(997).mul(reserve0) / reserve1.mul(1000).add(amountInWithFee);
            //IERC20(USDT).safeTransfer(BXH_USDT, amountHalf);
            // IUniswapV2Pair(BXH_USDT).swap(amountOut, 0, blackHoleAddress, new bytes(0));
        }
    }

    function swap() external onlyCaller returns (uint256 amountOut){
        require(IERC20(USDT).balanceOf(address(this)) >= amountIn, "Insufficient contract balance");
        uint256 amountHalf = amountIn.div(2);
        {
            (uint256 reserve0, uint256 reserve1,) = IUniswapV2Pair(BXH_USDT).getReserves();
            uint256 amountInWithFee = amountHalf.mul(997);
            amountOut = amountHalf.mul(997).mul(reserve1) / reserve0.mul(1000).add(amountInWithFee);
            IERC20(USDT).safeTransfer(BXH_USDT, amountHalf);
            IUniswapV2Pair(BXH_USDT).swap(0, amountOut, blackHoleAddress, new bytes(0));
        }

        {
            (uint256 reserve0, uint256 reserve1,) = IUniswapV2Pair(BXH_USDT).getReserves();
            uint256 amountInWithFee = amountHalf.mul(997);
            amountOut = amountHalf.mul(997).mul(reserve1) / reserve0.mul(1000).add(amountInWithFee);
            IERC20(USDT).safeTransfer(BXH_USDT, amountHalf);
            IUniswapV2Pair(BXH_USDT).swap(0, amountOut, DAOAddress, new bytes(0));
    
        }

    }

    modifier onlyCaller() {
        require(isCaller(msg.sender), "Not the caller");
        _;
    }

    function emergencyWithdraw(address _token) public onlyOwner {
        require(IERC20(_token).balanceOf(address(this)) > 0, "Insufficient contract balance");
        IERC20(_token).transfer(emergencyAddress, IERC20(_token).balanceOf(address(this)));
    }
}