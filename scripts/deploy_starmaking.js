

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');


const web3 = require('web3');


async function main() {

  const addrs =  hre.network.config.bxh.address;
  var provider = ethers.provider;
  const accounts = await ethers.getSigners();
  const StarMaking = await hre.ethers.getContractFactory("StarMaking");

  const BXH = await hre.ethers.getContractFactory("BXHToken");
  const bxh = await BXH.attach(addrs.bxh);
  Assert.equal("BXH",await bxh.symbol(),"BXH Contract Attach Error");
  console.log("BXH attached to:", bxh.address);

  const star = await StarMaking.deploy(addrs.admin,bxh.address);  
  await star.deployed();
  console.log("StarMaking deployed to:", star.address);
  const owner = await star.owner();
  
  await star.transferOwnership(addrs.admin);
  

  await star.owner();
  const newowner = await star.owner();
  
    console.log("StarMaking owner transfer from:%s to %s", owner,newowner);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
