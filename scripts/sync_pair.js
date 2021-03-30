

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

  const UniswapV2Pair = await hre.ethers.getContractFactory("UniswapV2Pair");
  const pair = await UniswapV2Pair.attach("0x4eb54a306bbed8540e1751260f7e6402b56c860c");
  
  var syncresult = await pair.sync();


  console.log("syncresult:",syncresult);


  
  

}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
