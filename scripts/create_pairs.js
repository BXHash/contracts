

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');




async function ensurePair(factory,tokenA,tokenB){
      var pairAddr=await factory.getPair(tokenA,tokenB);
      if("0x0000000000000000000000000000000000000000"==pairAddr){
        pairAddr=await factory.createPair(tokenA,tokenB);
        console.log("create new pair: (%s,%s)=>%s",tokenA,tokenB,pairAddr)
      }else{
         console.log("get exist pair: (%s,%s)=>%s",tokenA,tokenB,pairAddr)
      }
  

  }
  



async function main() {

  const accounts = await ethers.getSigners();
  const addrs =  hre.network.config.bxh.address;

  const UniswapV2Factory = await hre.ethers.getContractFactory("UniswapV2Factory");
  const factory = await UniswapV2Factory.attach(addrs.uniswap.factory);
  
  await ensurePair(factory,addrs.usdt,addrs.husd);
  await ensurePair(factory,addrs.hbtc,addrs.husd);
  await ensurePair(factory,addrs.heth,addrs.husd);
  await ensurePair(factory,addrs.wht,addrs.husd);
  await ensurePair(factory,addrs.hbtc,addrs.wht);
  await ensurePair(factory,addrs.heth,addrs.wht);

  await ensurePair(factory,addrs.hltc,addrs.husd);
  await ensurePair(factory,addrs.hdot,addrs.husd);

  await ensurePair(factory,addrs.bxh,addrs.usdt);
  await ensurePair(factory,addrs.bxh,addrs.husd);
  await ensurePair(factory,addrs.bxh,addrs.wht);

  


  
  

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
