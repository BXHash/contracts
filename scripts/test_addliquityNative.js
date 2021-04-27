

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');



const web3 = require('web3');

async function main() {

  const feeAdrr = hre.network.config.bxh.address.fee;
  console.log("fee to :",feeAdrr);

  const addrs =  hre.network.config.bxh.address;

  const accounts = await ethers.getSigners();
 
  const WHT = await hre.ethers.getContractFactory("WHT");

  const wht = await WHT.attach(addrs.wht);

  console.log("WHT attached to:", wht.address);

  var balance = await wht.balanceOf(accounts[0].address);

  console.log("HT.balance=:",(await ethers.provider.getBalance(accounts[0].address)).toString(10));

  console.log("WHT.balance=:",balance);

  const HUSD = await hre.ethers.getContractFactory("HRC20HUSD");

  const husd = await HUSD.attach(addrs.husd);

  console.log("HUSD attached to:", husd.address);

  var balance1 = await husd.balanceOf(accounts[0].address);

  console.log("HUSD.balance=:",balance1);

  // await husd.issue(accounts[0].address,0x10000000000);

  // var balance1 = await husd.balanceOf(accounts[0].address);

  // console.log("HUSD.balance=:",balance1);


  // const balance1 = await husd.balanceOf(accounts[1].address);

  // console.log("HUSD.balance1=:",balance1);



  const UniswapV2Factory = await hre.ethers.getContractFactory("UniswapV2Factory");
  const factory = await UniswapV2Factory.attach(addrs.uniswap.factory);

  console.log("factory attached to:", factory.address);
  
  // const pairCodeHash = await factory.pairCodeHash();

  // console.log("factory pairCodeHash is:",pairCodeHash);
  
  // const ERC20Template = await hre.ethers.getContractFactory("ERC20Template");

  // const wht = await ERC20Template.attach(hre.network.config.bxh.address.wht);
  // Assert.equal("WHT",await wht.symbol());
  // console.log("WHT attached to:", wht.address);


  const UniswapV2Router02 = await hre.ethers.getContractFactory("UniswapV2Router02");
  const router = await UniswapV2Router02.attach(addrs.uniswap.router);
  console.log("router attached to:", router.address);

  const pair = await router.getHTPair(husd.address);

  console.log("pair is:", pair);
  console.log("factory.getpair is:", await factory.getPair(wht.address,husd.address));

  console.log("pair.getHTReservers is:", await router.getHTReservers(husd.address));


  const allowu = await husd.allowance(accounts[0].address,router.address);
  console.log("allowu is:", allowu);


  const allowht = await wht.allowance(accounts[0].address,router.address);
  console.log("allowht is:", allowht);


  const liquid = await router.addLiquidityHT(husd.address,10000,10000,10000,accounts[0].address,1629575097,{value:10000,from:accounts[0].address});

  console.log("liquid=",JSON.stringify(liquid));

  console.log("pair.getHTReservers is:", await router.getHTReservers(husd.address));

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
