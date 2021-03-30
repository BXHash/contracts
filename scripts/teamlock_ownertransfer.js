

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
  const investTeamLock = await TeamTimeLock.attach(addrs.investTeamLock);
  console.log("investTeamLock attached to:", investTeamLock.address);
  await investTeamLock.transferOwnership(addrs.owner);
   

  const marketTeamLock = await TeamTimeLock.attach(addrs.marketTeamLock);
  console.log("marketTeamLock attached to:", marketTeamLock.address);
  await marketTeamLock.transferOwnership(addrs.owner);

  const devTeamLock = await TeamTimeLock.attach(addrs.devTeamLock);
  console.log("devTeamLock attached to:", devTeamLock.address);
  await devTeamLock.transferOwnership(addrs.owner);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
