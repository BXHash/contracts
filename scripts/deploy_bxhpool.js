

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');

const web3 = require('web3');




async function main() {

  const addrs =  hre.network.config.bxh.address;

  const accounts = await ethers.getSigners();
  const BXH = await hre.ethers.getContractFactory("BXHToken");
  const bxh = await BXH.attach(addrs.bxh);
  Assert.equal("BXH",await bxh.symbol(),"BXH Contract Attach Error");
  console.log("BXH attached to:", bxh.address);


  const BXHPool = await hre.ethers.getContractFactory("BXHPool");
  var amount = web3.utils.toWei('42','ether');
  const bxhpool = await BXHPool.deploy(bxh.address,amount,3196000,970);
  await bxhpool.deployed();
  console.log("BXHPool deployed to:", bxhpool.address);
  ;
  
  await bxhpool.transferOwnership(addrs.owner);

  const newowner = await bxhpool.owner();

  console.log("BXHPool owner transfer from:%s to %s", owner,newowner);


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
