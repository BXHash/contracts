

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


  const BXHDao = await hre.ethers.getContractFactory("BXHDao");
;
  const bxhDao = await BXHDao.deploy("BXH-USDT-LP-7",201600,"0x8611a52e8AC5E10651DF7C4b58F42536f0bd2e7E","0x56146B129017940D06D8e235c02285A3d05D6B7C","0x56146B129017940D06D8e235c02285A3d05D6B7C");
  await bxhDao.deployed();
  console.log("BXHDao deployed to:", bxhDao.address);
  


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });