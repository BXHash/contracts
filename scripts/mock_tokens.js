

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");



async function main() {

const accounts = await ethers.getSigners();
 // for (const account of accounts) {
 //     // const balance = await ethers.provider.getBalance(account.address);

 //    // console.log(account.address+",balance="+balance);
 //  }
  
  const ERC20Template = await hre.ethers.getContractFactory("ERC20Template");
  const usdt = await ERC20Template.deploy(accounts[0].address,accounts[0].address,"Heco-Peg USDT Token","USDT",18);
  await usdt.deployed();
  console.log("USDT deployed to:", usdt.address);

  const HUSD = await hre.ethers.getContractFactory("HRC20HUSD");

  const husd = await HUSD.deploy("Heco-Peg HUSD Token","HUSD",8);

  await husd.deployed();
  console.log("HUSD deployed to: %s ,%d", husd.address, await husd.decimals());


  const hbtc = await ERC20Template.deploy(accounts[0].address,accounts[0].address,"Heco-Peg HBTC Token","HBTC",18);
  await hbtc.deployed();
  console.log("HBTC deployed to:", hbtc.address);

  const eth = await ERC20Template.deploy(accounts[0].address,accounts[0].address,"Heco-Peg ETH Token","ETH",18);
  await eth.deployed();
  console.log("HETH deployed to:", eth.address);

  const hltc = await ERC20Template.deploy(accounts[0].address,accounts[0].address,"Heco-Peg HLTC Token","HLTC",18);
  await hltc.deployed();
  console.log("HLTC deployed to:", hltc.address);

  const WHT = await hre.ethers.getContractFactory("WHT");
  const wht = await WHT.deploy();
  await wht.deployed();
  console.log("WHT deployed to:", wht.address);

  const hdot = await ERC20Template.deploy(accounts[0].address,accounts[0].address,"Heco-Peg HDOT Token","HDOT",18);
  await hdot.deployed();
  console.log("HDOT deployed to:", hdot.address);



}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
