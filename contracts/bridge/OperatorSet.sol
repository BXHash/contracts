// SPDX-License-Identifier: MIT

pragma solidity ^0.6.12;

import "@openzeppelin/contracts/utils/EnumerableSet.sol";

import "@openzeppelin/contracts/access/Ownable.sol";

contract OperatorSet is Ownable{

    EnumerableSet.AddressSet private opSet;


    constructor() public {
        EnumerableSet.add(opSet,msg.sender);
	}


    modifier onlyOperator() {

        require(EnumerableSet.contains(opSet,msg.sender), "wrong operator");
        _;
    }

    function addOperator(address opaddr) public onlyOwner {
        EnumerableSet.add(opSet,opaddr);
    }

    function operatorCount() public view returns (uint256){
        return EnumerableSet.length(opSet);
    }


    function isOperator(address opaddr) public view returns (bool){
        return EnumerableSet.contains(opSet,opaddr);
    }
    

    function removeOperator(address opaddr) public onlyOwner {
        EnumerableSet.remove(opSet,opaddr);
    }

}
