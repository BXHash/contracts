

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');





async function main() {

  const addrs =  hre.network.config.bxh.address;

  const accounts = await ethers.getSigners();
  const BXH = await hre.ethers.getContractFactory("BXHToken");
  const bxh = await BXH.attach(addrs.bxh);
  Assert.equal("BXH",await bxh.symbol(),"BXH Contract Attach Error");
  console.log("BXH deployed to:", bxh.address);


  const BXHPool = await hre.ethers.getContractFactory("BXHPool");
  const bxhpool = await BXHPool.deploy(bxh.address,42,0,970);
  await bxhpool.deployed();
  console.log("BXHPool deployed to:", bxhpool.address);
  ;

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
