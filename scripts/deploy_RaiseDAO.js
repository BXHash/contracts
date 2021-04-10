

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

  await raiseDao.transferOwnership("0x56146B129017940D06D8e235c02285A3d05D6B7C");

   blockNumber = await provider.getBlockNumber();
   blockNumber = await provider.getBlockNumber();
   blockNumber = await provider.getBlockNumber();

  const newowner = await raiseDao.owner();

  console.log("RaiseDAO owner transfer from:%s to %s", newowner);

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
