

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



  const XToken = await hre.ethers.getContractFactory("XToken");
  
  const xtoken = await XToken.attach(addrs.xtoken);


  const BXHDAOPool = await hre.ethers.getContractFactory("BXHDAOPool");
  
  
  const bxhDaoPool = await BXHDAOPool.deploy(xtoken.address,bxh.address,addrs.usdt,1625486400);
  await bxhDaoPool.deployed();
  console.log("BXHDAOPool deployed to:", bxhDaoPool.address);
  
  await bxhDaoPool.transferOwnership("0x56146B129017940D06D8e235c02285A3d05D6B7C");

  // await xtoken.transferOwnership("0x56146B129017940D06D8e235c02285A3d05D6B7C");


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
