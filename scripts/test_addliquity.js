

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');





async function main() {

  const feeAdrr = hre.network.config.bxh.address.fee;
  console.log("fee to :",feeAdrr);

  const addrs =  hre.network.config.bxh.address;


  const accounts = await ethers.getSigners();

 
  const HUSD = await hre.ethers.getContractFactory("HRC20HUSD");

  const husd = await HUSD.attach(addrs.husd);

  console.log("HUSD attached to:", husd.address);

  const balance = await husd.balanceOf(accounts[0].address);

  console.log("HUSD.balance=:",balance);



  const balance1 = await husd.balanceOf(accounts[1].address);

  console.log("HUSD.balance1=:",balance1);



const UniswapV2Factory = await hre.ethers.getContractFactory("UniswapV2Factory");
  // const factory = await UniswapV2Factory.deploy(feeAdrr);
  // await factory.deployed();

  const factory = await UniswapV2Factory.attach(addrs.uniswap.factory);

  console.log("factory attached to:", factory.address);

  const pairCodeHash = await factory.pairCodeHash();

  console.log("factory pairCodeHash is:",pairCodeHash);
  
  const ERC20Template = await hre.ethers.getContractFactory("ERC20Template");

  const wht = await ERC20Template.attach(hre.network.config.bxh.address.wht);
  Assert.equal("WHT",await wht.symbol());
  console.log("WHT attached to:", wht.address);


  const UniswapV2Router02 = await hre.ethers.getContractFactory("UniswapV2Router02");
  const router = await UniswapV2Router02.attach(addrs.uniswap.router);
  console.log("router attached to:", router.address);


  const pair = await router.getETHPair(husd.address);

  console.log("pair is:", pair);


  await husd.approve(pair,0x10000);


  const allowu = await husd.allowance(accounts[0].address,pair);
  console.log("allowu is:", allowu);


var bal = await husd.balanceOf(pair);

  console.log("HUSD.pair=:",bal);


  await husd.transfer(pair,1);


   bal = await husd.balanceOf(pair);

  console.log("HUSD.pair2=:",bal);



  const vtf = await husd.transferFrom(accounts[0].address,pair,2);
console.log("transferFrom is:", vv);  

  console.log("HUSD.pair3=:",await husd.balanceOf(accounts[1].address));


  await wht.approve(pair,0x10000);

  const allowht = await wht.allowance(accounts[0].address,pair);
  console.log("allowu is:", allowht);


  const liquid = await router.addLiquidityETH(husd.address,100,100,100,accounts[0].address,1616074467,{value:1,from:accounts[0].address});

  console.log("liquid=",JSON.stringify(liquid));


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
