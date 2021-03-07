

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');


async function main() {

const accounts = await ethers.getSigners();
 // for (const account of accounts) {
 //     // const balance = await ethers.provider.getBalance(account.address);

 //    // console.log(account.address+",balance="+balance);
 //  }
  
  const feeAdrr = "0x"+hre.network.config.bxh.address.fee;

  const addrs =  hre.network.config.bxh.address;

  const ERC20Template = await hre.ethers.getContractFactory("ERC20Template");
  const usdt = await ERC20Template.attach(addrs.usdt);
  Assert.equal("USDT",await usdt.symbol(),"Contract Attach Error");
  console.log("USDT attached to:", usdt.address);

  const HUSD = await hre.ethers.getContractFactory("HRC20HUSD");
  const husd = await HUSD.attach(addrs.husd);//HUSD.deploy("Heco-Peg HUSD Token","HUSD",8);
  Assert.equal("HUSD",await husd.symbol());
  console.log("HUSD attached to:%s,%d", husd.address, await husd.decimals());


  const hbtc = await ERC20Template.attach(addrs.hbtc);// ERC20Template.deploy(accounts[0].address,accounts[0].address,"Heco-Peg HBTC Token","HBTC",18);
  Assert.equal("HBTC", await hbtc.symbol());
  console.log("HBTC attached to:", hbtc.address);

  const eth = await ERC20Template.attach(addrs.heth);//ERC20Template.deploy(accounts[0].address,accounts[0].address,"Heco-Peg ETH Token","ETH",18);
  Assert.equal("ETH",await eth.symbol());
  console.log("HETH attached to:", eth.address);

  const hltc = await ERC20Template.attach(addrs.hltc);//ERC20Template.deploy(accounts[0].address,accounts[0].address,"Heco-Peg HLTC Token","HLTC",18);
  Assert.equal("HLTC",await hltc.symbol());
  console.log("HLTC attached to:", hltc.address);

  const WHT = await hre.ethers.getContractFactory("WHT");
  const wht = await WHT.attach(addrs.wht);//
  Assert.equal("WHT" ,await wht.symbol());
  console.log("WHT attached to:", wht.address);

  const hdot = await ERC20Template.attach(addrs.hdot);//ERC20Template.deploy(accounts[0].address,accounts[0].address,"Heco-Peg HDOT Token","HDOT",18);
  Assert.equal("HDOT",await hdot.symbol());
  console.log("HDOT attached to:", hdot.address);


  const BXH = await hre.ethers.getContractFactory("BXHToken");
  const bxh = await BXH.attach(addrs.bxh);
  Assert.equal("BXH", await bxh.symbol());
  console.log("BXH attached to:", bxh.address);

  const UniswapV2Factory = await hre.ethers.getContractFactory("UniswapV2Factory");
  const factory = UniswapV2Factory.attach(addrs.uniswap.factory);
  Assert.notStrictEqual(feeAdrr, await factory.feeToSetter());
  Assert.notStrictEqual(feeAdrr, await factory.feeTo());
  console.log("factory attached to:%s,feeToSettAdrr=%s,feeAdrr=%s", factory.address,feeAdrr,feeAdrr);


  const UniswapV2Router02 = await hre.ethers.getContractFactory("UniswapV2Router02");
  const router = await UniswapV2Router02.attach(addrs.uniswap.router);
  Assert.notStrictEqual(factory.address, await router.factory());
  Assert.notStrictEqual(wht.address, await router.WETH());
  console.log("router attached to:", router.address);

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
