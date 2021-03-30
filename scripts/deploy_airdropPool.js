

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');





async function main() {

  const addrs =  hre.network.config.bxh.address;

  const accounts = await ethers.getSigners();
  const BXH = await hre.ethers.getContractFactory("BXHToken");
  const bxh = await BXH.attach(addrs.bxh);
  Assert.equal("BXH",await bxh.symbol(),"BXH Contract Attach Error");
  console.log("BXH attached to:", bxh.address);


  const AirdropPool = await hre.ethers.getContractFactory("AirdropPool");
  const airdropPool = await AirdropPool.deploy(bxh.address,28800);
  await airdropPool.deployed();
  console.log("AirdropPool deployed to:", airdropPool.address);
  ;

  await airdropPool.transferOwnership(addrs.owner);

  const newowner = await airdropPool.owner();

  console.log("AirdropPool owner transfer to %s", newowner);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
