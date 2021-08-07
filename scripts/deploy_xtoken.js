

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');





async function main() {

  const feeAdrr = hre.network.config.bxh.address.fee;
  console.log("fee to :",feeAdrr);

  const addrs =  hre.network.config.bxh.address;

  const accounts = await ethers.getSigners();

  console.log("deploy account: " + accounts[0].address);
  const XToken = await hre.ethers.getContractFactory("XToken");
  const xtoken = await XToken.deploy();
  await xtoken.deployed();
  // const bxh = await BXH.attach(addrs.bxh);
  console.log("XToken deployed to:", xtoken.address);

  // const owner = await bxh.owner();

  // await bxh.transferOwnership(addrs.owner);

  // await bxh.owner();
  // const newowner = await bxh.owner();
  // console.log("BXH owner transfer from:%s to %s", owner,newowner);


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
