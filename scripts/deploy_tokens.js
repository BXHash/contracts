

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');





async function main() {

  const feeAdrr = hre.network.config.bxh.address.fee;
  console.log("fee to :",feeAdrr);

  const addrs =  hre.network.config.bxh.address;


  const accounts = await ethers.getSigners();
  const BXH = await hre.ethers.getContractFactory("BXHToken");
  const bxh = await BXH.deploy();
  await bxh.deployed();
  console.log("BXH deployed to:", bxh.address);


  const ERC20Template = await hre.ethers.getContractFactory("ERC20Template");

  const usdt = await ERC20Template.attach(addrs.usdt);
  Assert.equal("USDT",await usdt.symbol(),"Contract Attach Error");
  console.log("USDT attached to:", usdt.address);


  const wht = await ERC20Template.attach(hre.network.config.bxh.address.wht);
  Assert.equal("WHT",await wht.symbol());
  console.log("WHT attached to:", wht.address);


  const UniswapV2Factory = await hre.ethers.getContractFactory("UniswapV2Factory");
  const factory = await UniswapV2Factory.deploy(feeAdrr);
  await factory.deployed();
  console.log("factory deployed to:", factory.address);

  await factory.setFeeTo(feeAdrr);



  const UniswapV2Router02 = await hre.ethers.getContractFactory("UniswapV2Router02");
  const router = await UniswapV2Router02.deploy(factory.address,wht.address);
  await router.deployed();
  console.log("router deployed to:", router.address);


  const BXHPool = await hre.ethers.getContractFactory("BXHPool");
  const bxhpool = await BXHPool.deploy(bxh.address,42,0);
  await bxhpool.deployed();
  console.log("BXHPool deployed to:", bxhpool.address);


  const Airdrop = await hre.ethers.getContractFactory("Airdrop");
  const airdrop = await Airdrop.deploy(usdt.address,bxh.address);
  await airdrop.deployed();
  console.log("Airdrop deployed to:", airdrop.address);


  console.log("factory fee to:", await factory.feeTo());

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
