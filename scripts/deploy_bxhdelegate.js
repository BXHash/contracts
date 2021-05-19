

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');
const web3 = require('web3');




async function main() {

  const feeAdrr = hre.network.config.bxh.address.fee;
  console.log("fee to :",feeAdrr);

  const addrs =  hre.network.config.bxh.address;


  const accounts = await ethers.getSigners();
 

  const BXHLPDelegate = await hre.ethers.getContractFactory("BXHLPDelegate");
  const deLP = await BXHLPDelegate.deploy("0x6BFe4BE4B1A8BFd0154EEe153936aaCcdc886cD7",addrs.bxhpool,69,"0x56146B129017940D06D8e235c02285A3d05D6B7C");
  
  await deLP.deployed();
  console.log("deLP deployed to: ",deLP.address);

  await deLP.transferOwnership("0x56146B129017940D06D8e235c02285A3d05D6B7C");

  console.log("ownership : ",deLP.owner());


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
