

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');





async function main() {

  const addrs =  hre.network.config.bxh.address;

  const accounts = await ethers.getSigners();
  const BXHPool = await hre.ethers.getContractFactory("BXHPool");
  const bxhpool = await BXHPool.attach(addrs.bxhpool);

  console.log("BXHPool attached to:", bxhpool.address);

  const owner = await bxhpool.owner();

  // await bxhpool.transferOwnership("0xdEa9d2E81c9bb73c890A822F65118a3651c258D5");


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
