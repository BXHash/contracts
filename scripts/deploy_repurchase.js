

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');





async function main() {

  const addrs =  hre.network.config.bxh.address;

  const accounts = await ethers.getSigners();

  console.log("deploy account=",accounts[0].address);
  const Repurchase = await hre.ethers.getContractFactory("Repurchase");
  
  const repurchase = await Repurchase.deploy(1000,"0x56146B129017940D06D8e235c02285A3d05D6B7C");

    // console.log("deploying account=",repurchase);

  await repurchase.deployed();
  console.log("Repurchase deployed to:", repurchase.address);
  

  const owner = await repurchase.owner();

  // await repurchase.transferOwnership(addrs.owner);


  // const newowner = await repurchase.owner();


  // console.log("repurchase owner transfer from:%s to %s", owner,newowner);

  await repurchase.addCaller(accounts[0].address);




}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
