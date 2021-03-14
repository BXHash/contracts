

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');





async function main() {

  const addrs =  hre.network.config.bxh.address;

  const accounts = await ethers.getSigners();
  const BXH = await hre.ethers.getContractFactory("BXHToken");
  const bxh = await BXH.attach(addrs.bxh);
  Assert.equal("BXH",await bxh.symbol(),"BXH Contract Attach Error");
  console.log("BXH Attach to:", bxh.address);


  const TeamTimeLock = await hre.ethers.getContractFactory("TeamTimeLock");
  // console.log("reward=",3000*10000*10e18/20736000);
  const investTeamLock = await TeamTimeLock.deploy(bxh.address,
    3000*10000,
    0,20736000,"investor");
  await investTeamLock.deployed();
  console.log("investTeamLock deployed to:", investTeamLock.address);
  await investTeamLock.addUser(accounts[0].address,20);
  await investTeamLock.addUser(accounts[1].address,30);
  await investTeamLock.addUser(accounts[2].address,50);
  await investTeamLock.setPause();
   

  const marketTeamLock = await TeamTimeLock.deploy(bxh.address,
    4500*10000,
    0,20736000,"market");
  await marketTeamLock.deployed();
  console.log("marketTeamLock deployed to:", marketTeamLock.address);

 await marketTeamLock.addUser(accounts[0].address,30);
  await marketTeamLock.addUser(accounts[1].address,30);
  await marketTeamLock.addUser(accounts[2].address,40);
  await marketTeamLock.setPause();

// console.log("reward=",3000*10000*10e18/20736000);
  const devTeamLock = await TeamTimeLock.deploy(bxh.address,
    10000*10000,
    0,20736000*2,"dev");
  await devTeamLock.deployed();
  console.log("devTeamLock deployed to:", devTeamLock.address);

  await devTeamLock.addUser(accounts[0].address,10);
  await devTeamLock.addUser(accounts[1].address,10);
  await devTeamLock.addUser(accounts[2].address,10);
  await devTeamLock.setPause();


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
