

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


  const TeamTimeLock = await hre.ethers.getContractFactory("TeamTimeLock");
  // console.log("reward=",3000*10000*10e18/20736000);
  const investTeamLock = await TeamTimeLock.deploy(accounts[1].address,bxh.address,
    3000*10000,
    0,20736000,"investor");
  await investTeamLock.deployed();
  console.log("investTeamLock deployed to:", investTeamLock.address);
  ;
  
  const marketTeamLock = await TeamTimeLock.deploy(accounts[2].address,bxh.address,
    4500*10000,
    0,20736000,"market");
  await marketTeamLock.deployed();
  console.log("marketTeamLock deployed to:", marketTeamLock.address);

// console.log("reward=",3000*10000*10e18/20736000);
  const devTeamLock = await TeamTimeLock.deploy(accounts[3].address,bxh.address,
    10000*10000,
    0,20736000*2,"dev");
  await devTeamLock.deployed();
  console.log("devTeamLock deployed to:", devTeamLock.address);


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
