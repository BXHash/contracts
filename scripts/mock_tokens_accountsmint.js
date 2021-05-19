

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
const web3 = require('web3');


async function main() {

const accounts = await ethers.getSigners();
 // for (const account of accounts) {
 //     // const balance = await ethers.provider.getBalance(account.address);

 //    // console.log(account.address+",balance="+balance);
 //  }
  const addrs =  hre.network.config.bxh.address;
  const ERC20Template = await hre.ethers.getContractFactory("ERC20Template");
  const usdt = await ERC20Template.attach(addrs.usdt);
  console.log("USDT attached to:", usdt.address);

  const HUSD = await hre.ethers.getContractFactory("HRC20HUSD");
  const husd = await HUSD.attach(addrs.husd);
  console.log("HUSD attached to: %s,%d", husd.address, await husd.decimals());

  const hbtc = await ERC20Template.attach(addrs.hbtc);
  console.log("HBTC attached to:", hbtc.address);
  var amount = web3.utils.toWei('100','ether');

  for(var i=0;i<10;i++){
    await usdt.mint(accounts[i].address,amount);
    console.log("balanceOf:"+accounts[i].address+":"+(await usdt.balanceOf(accounts[i].address)).toString(10));
  }


  for(var i=0;i<10;i++){
    await hbtc.mint(accounts[i].address,amount);
    console.log("balanceOf:"+accounts[i].address+":"+(await hbtc.balanceOf(accounts[i].address)).toString(10));
  }

  const eth = await ERC20Template.attach(addrs.heth);
  console.log("HETH attached to:", eth.address);
  for(var i=0;i<10;i++){
    await eth.mint(accounts[i].address,amount);
    console.log("balanceOf:"+accounts[i].address+":"+(await eth.balanceOf(accounts[i].address)).toString(10));
  }

  const hltc = await ERC20Template.attach(addrs.hltc);
  console.log("HLTC attached to:", hltc.address);
  for(var i=0;i<10;i++){
    await hltc.mint(accounts[i].address,amount);
    console.log("balanceOf:"+accounts[i].address+":"+(await hltc.balanceOf(accounts[i].address)).toString(10));
  }


  const hdot = await ERC20Template.attach(addrs.hdot);
  console.log("HDOT attached to:", hdot.address);

  for(var i=0;i<10;i++){
    await hdot.mint(accounts[i].address,amount);
    console.log("balanceOf:"+accounts[i].address+":"+(await hdot.balanceOf(accounts[i].address)).toString(10));
  }

  const WHT = await hre.ethers.getContractFactory("WHT");
  const wht = await WHT.attach(addrs.wht);
  console.log("WHT attached to:", wht.address);

  for(var i=0;i<10;i++){
    // await hltc.mint(accounts[i].address,amount);
    console.log("balanceOf:"+accounts[i].address+":"+(await ethers.provider.getBalance(accounts[i].address)).toString(10));
  }





}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
