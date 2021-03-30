

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');





async function main() {

  const addrs =  hre.network.config.bxh.address;

  const accounts = await ethers.getSigners();
  const RaiseDAO = await hre.ethers.getContractFactory("RaiseDAO");
  const raiseDao = await RaiseDAO.deploy();  

  await raiseDao.deployed();
  console.log("RaiseDAO deployed to:", raiseDao.address);

  var provider = ethers.provider;
  var blockNumber = await provider.getBlockNumber();

  console.log("current blocknumber=",blockNumber);
  // raiseDao.initialize(addrs.usdt,hdot,)  

  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
