

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');


const web3 = require('web3');


async function main() {

  const addrs =  hre.network.config.bxh.address;

  const accounts = await ethers.getSigners();

  var provider = ethers.provider;

  const BXHDAOPoolV3 = await hre.ethers.getContractFactory("BXHDAOPoolV3");


  const pool = await BXHDAOPoolV3.deploy(addrs.bxh,addrs.usdt,6649690,3600,3600);
  await pool.deployed();
  console.log("pool deployed to:", pool.address);

  await pool.transferOwnership("0x56146B129017940D06D8e235c02285A3d05D6B7C");


  // await pool.addRewards(web3.utils.toWei('100000','wei'));
  // await pool.addRewards(web3.utils.toWei('100000','wei'));
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
