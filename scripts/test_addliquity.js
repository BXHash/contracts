

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');
const web3 = require('web3');




async function main() {

  const feeAdrr = hre.network.config.bxh.address.fee;
  console.log("fee to :",feeAdrr);

  const addrs =  hre.network.config.bxh.address;


  const accounts = await ethers.getSigners();
 
  const ERC20Template = await hre.ethers.getContractFactory("ERC20Template");
  const usdt = await ERC20Template.attach(addrs.usdt);
  console.log("USDT attached to: ", usdt.address, await usdt.name());

  const hbtc = await ERC20Template.attach(addrs.hbtc);
  console.log("HBTC attached to: ", hbtc.address, await hbtc.name());

  const WHT = await hre.ethers.getContractFactory("WHT");
  const wht = await WHT.attach(addrs.wht);
  console.log("WHT attached to:", wht.address,await wht.name());


  const UniswapV2Factory = await hre.ethers.getContractFactory("UniswapV2Factory");
  const factory = await UniswapV2Factory.attach(addrs.uniswap.factory);
  console.log("factory attached to:", factory.address);
  const pairCodeHash = await factory.pairCodeHash();
  console.log("factory pairCodeHash is:",pairCodeHash);
  

  const UniswapV2Router02 = await hre.ethers.getContractFactory("UniswapV2Router02");
  const router = await UniswapV2Router02.attach(addrs.uniswap.router);
  console.log("router attached to:", router.address);

 var amount = web3.utils.toWei('100','ether');

  // for(var i=0;i<10;i++){
  //   await usdt.mint(accounts[i].address,amount);
  //   console.log("balanceOf:"+accounts[i].address+":"+(await usdt.balanceOf(accounts[i].address)).toString(10));
  // }
  var pairAddr = await factory.getPair(usdt.address,hbtc.address);

  const UniswapV2Pair = await hre.ethers.getContractFactory("UniswapV2Pair");

  var pair = UniswapV2Pair.attach(pairAddr);
  console.log("pair is:", pair.address);


  for(var i=0;i<10;i++){
      await hbtc.connect(accounts[i]).approve(router.address,amount);
      await wht.connect(accounts[i]).approve(router.address,amount);
      await usdt.connect(accounts[i]).approve(router.address,amount);
      await pair.connect(accounts[i]).approve(router.address,amount);
      const allowbtc = await hbtc.allowance(accounts[i].address,router.address);
      const allowht = await wht.allowance(accounts[i].address,router.address);
      const allowusdt = await usdt.allowance(accounts[i].address,router.address);

      // console.log("allow:"+accounts[i].address+" is:"+allowbtc.toString(10)+","+allowht.toString(10)+","+allowusdt.toString(10));
  }
  
  console.log("fee to: ",await factory.feeTo(),accounts[11].address);
  var baseA = 1000000;
  // var add = await usdt.transferFrom(accounts[0].address,pair.address,1);
  // await router.addLiquidity(usdt.address,hbtc.address,50000*baseA,baseA,0,0,accounts[0].address,1621911939);
  var add = await router.connect(accounts[2]).addLiquidity(usdt.address,hbtc.address,50000*baseA,baseA,0,0,accounts[2].address,1621911939);
  // // var add = await router.quote(50000*baseA,) 
  var reserves = await pair.getReserves();
  console.log("reserves:",reserves._reserve0.toString(10),reserves._reserve1.toString(10));
  // var swap = await router.connect(accounts[3]).swapExactTokensForTokens(110000,2,[usdt.address,hbtc.address],accounts[3].address,1621911939);
  // var swap = await router.connect(accounts[3]).swapExactTokensForTokens(110000,2,[usdt.address,hbtc.address],accounts[3].address,1621911939);
  // var swap = await router.connect(accounts[3]).swapExactTokensForTokens(110000,2,[usdt.address,hbtc.address],accounts[3].address,1621911939);

  var reserves = await pair.getReserves();
  console.log("reserves:",reserves._reserve0.toString(10),reserves._reserve1.toString(10));


  var liquid=(await pair.balanceOf(accounts[2].address));
  console.log("liquid=",liquid.toString(10))

  await pair.sync();
  // await pair.skim(accounts[6].address);

  // liquid = 100;
  // var remove = await router.connect(accounts[2]).removeLiquidity(usdt.address,hbtc.address,liquid,0,0,accounts[17].address,1621911939);
  // console.log("swap.tx:",swap);

  console.log("balance:: usdt.pair.bal=%s,hbtc.pair.bal=%s,usdt.user.bal=%s,hbtc.user.bal=%s,lp=%s",
    (await usdt.balanceOf(pairAddr)).toString(10),
    (await hbtc.balanceOf(pairAddr)).toString(10),
    (await usdt.balanceOf(accounts[0].address)).toString(10),
    (await hbtc.balanceOf(accounts[0].address)).toString(10),
    (await pair.balanceOf(accounts[2].address)).toString(10)
    );

  console.log("fee.balance:: usdt=%s,hbtc=%s,lp=%s",
    (await usdt.balanceOf(accounts[11].address)).toString(10),
    (await hbtc.balanceOf(accounts[11].address)).toString(10),
    (await pair.balanceOf(accounts[11].address)).toString(10)
    );

  console.log("rm.balance:: usdt=%s,hbtc=%s,lp=%s",
    (await usdt.balanceOf(accounts[17].address)).toString(10),
    (await hbtc.balanceOf(accounts[17].address)).toString(10),
    (await pair.balanceOf(accounts[17].address)).toString(10)
    );

  const BXHPool = await hre.ethers.getContractFactory("BXHPool");
  var amount = web3.utils.toWei('100','ether');
  // const bxhpool = await BXHPool.deploy(bxh.address,amount,3196000,970);

  var provider = ethers.provider;
  var blocknumber = await provider.getBlockNumber();
  
  // const bxhpool = await BXHPool.deploy(bxh.address,amount,blocknumber,970);
  // await bxhpool.deployed();
  const bxhpool = await BXHPool.attach(addrs.bxhpool);

  await bxhpool.add(100,pair.address,true);

  const BXH = await hre.ethers.getContractFactory("BXHToken");
  const bxh = await BXH.attach(addrs.bxh);
  Assert.equal("BXH",await bxh.symbol(),"BXH Contract Attach Error");
  console.log("BXH attached to:", bxh.address);


    if(true){

      
    

  const BXHLPDelegate = await hre.ethers.getContractFactory("BXHLPDelegate");
  const deLP = await BXHLPDelegate.deploy(pair.address,bxhpool.address,0,accounts[18].address);
  
  await deLP.deployed();
  console.log("deLP deployed to: ",deLP.address);

  // const deLP = BXHLPDelegate.attach(addrs.delp);
  // console.log("deLP attach to: ",deLP.address);

  await pair.connect(accounts[2]).approve(deLP.address,amount);
  
  // await deLP.connect(accounts[2]).depositLPToken(liquid);
  console.log("deuser.bxhbalance=",(await bxh.balanceOf(accounts[2].address)).toString(10));
  await deLP.connect(accounts[2]).depositLPToken(liquid);

  var deUserinfo = await deLP.userDelegateInfos(accounts[2].address);

  // await deLP.connect(accounts[2]).withrawLPToken();
  console.log("deuser.lpAmount=",deUserinfo.lpAmount.toString(10));
  console.log("deuser.kLast=",deUserinfo.kLast.toString(10));
  console.log("deuser.lpShared=",deUserinfo.lpShared.toString(10));
  console.log("deuser.bxhbalance=",(await bxh.balanceOf(accounts[2].address)).toString(10));
  //   await husd.transfer(pair,1);
  await router.connect(accounts[3]).swapExactTokensForTokens(110000,2,[usdt.address,hbtc.address],accounts[3].address,1621911939);

  var reward = await deLP.connect(accounts[2]).pendingBXH();
  console.log("reward:",reward.lpReturn.toString(10),reward.bxhReturn.toString(10));

await pair.connect(accounts[2]).approve(deLP.address,amount);

  var reward = await deLP.connect(accounts[2]).pendingBXH();
  console.log("reward:",reward.lpReturn.toString(10),reward.bxhReturn.toString(10));


  console.log("deuser.bxhbalance=",(await bxh.balanceOf(accounts[2].address)).toString(10));

  var v=await deLP.connect(accounts[2]).withrawLPToken();

  var deUserinfo = await deLP.userDelegateInfos(accounts[2].address);
  
  console.log("deuser.lpAmount=",deUserinfo.lpAmount.toString(10));
  console.log("deuser.kLast=",deUserinfo.kLast.toString(10));
  console.log("deuser.lpShared=",deUserinfo.lpShared.toString(10));
  console.log("deuser.bxhbalance=",(await bxh.balanceOf(accounts[2].address)).toString(10));
  //  bal = await husd.balanceOf(pair);

  // console.log("HUSD.pair2=:",bal);


    }

  // const vtf = await husd.transferFrom(accounts[0].address,pair,2);
  // console.log("transferFrom is:", vv);  

  // console.log("HUSD.pair3=:",await husd.balanceOf(accounts[1].address));


  // await wht.approve(pair,0x10000);

  // const allowht = await wht.allowance(accounts[0].address,pair);
  // console.log("allowu is:", allowht);


  // const liquid = await router.addLiquidityETH(husd.address,100,100,100,accounts[0].address,1616074467,{value:1,from:accounts[0].address});

  // console.log("liquid=",JSON.stringify(liquid));


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
