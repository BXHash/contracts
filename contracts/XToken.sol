
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

contract XToken is DelegateERC20,Ownable{

    EnumerableSet.AddressSet private whiteList;
 
    using EnumerableSet for EnumerableSet.AddressSet;
    EnumerableSet.AddressSet private _minters;


    constructor() public ERC20("BXH xDepth Token", "xBXH") {

    }

    function mint(address _to, uint256 _amount) external onlyMinter   returns (bool) {
        _mint(_to, _amount);
        return true;
    }

    
    function burn(address _from,uint256 _amount) external onlyMinter   returns (bool) {
        _burn(_from, _amount);
        return true;
    }

    function transfer(address recipient, uint256 amount) public virtual override returns (bool) {
        require(whiteList.contains(_msgSender()),'transfer not permit');
        _transfer(_msgSender(), recipient, amount);
        return true;
    }

    function transferFrom(address sender, address recipient, uint256 amount) public virtual override returns (bool) {
        require(whiteList.contains(_msgSender()),'transfer not permit');
        _transfer(sender, recipient, amount);
        _approve(sender, _msgSender(), allowance(sender,_msgSender()).sub(amount, "ERC20: transfer amount exceeds allowance"));
        return true;
    }
    function addWhiteAddress(address who) public onlyOwner {
        whiteList.add(who);
    }

    function remoteWhiteAddress(address who) public onlyOwner {
        whiteList.remove(who);
    }
    
    function addMinter(address _addMinter) public onlyOwner returns (bool) {
        require(_addMinter != address(0), "BXHToken: _addMinter is the zero address");
        return EnumerableSet.add(_minters, _addMinter);
    }

    function delMinter(address _delMinter) public onlyOwner returns (bool) {
        require(_delMinter != address(0), "BXHToken: _delMinter is the zero address");
        return EnumerableSet.remove(_minters, _delMinter);
    }

    function getMinterLength() public view returns (uint256) {
        return EnumerableSet.length(_minters);
    }

    function isMinter(address account) public view returns (bool) {
        return EnumerableSet.contains(_minters, account);
    }

    function getMinter(uint256 _index) public view onlyOwner returns (address){
        require(_index <= getMinterLength() - 1, "BXHToken: index out of bounds");
        return EnumerableSet.at(_minters, _index);
    }

    // modifier for mint function
    modifier onlyMinter() {
        require(isMinter(msg.sender), "caller is not the minter");
        _;
    }

}
