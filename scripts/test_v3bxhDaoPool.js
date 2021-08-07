

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');


const web3 = require('web3');


async function main() {

  const addrs =  hre.network.config.bxh.address;

  const accounts = await ethers.getSigners();

  const ERC20Template = await hre.ethers.getContractFactory("ERC20Template");

  const dtoken = await ERC20Template.deploy(accounts[0].address,accounts[0].address,"deposit token","DToken",18);
  await dtoken.deployed();
  console.log("dtoken deployed to:", dtoken.address);

  const bonusToken = await ERC20Template.deploy(accounts[0].address,accounts[0].address,"BonusToken","USDT",18);
  await bonusToken.deployed();
  console.log("bonusToken deployed to:", bonusToken.address);

  var provider = ethers.provider;

  const BXHDAOPoolV3 = await hre.ethers.getContractFactory("BXHDAOPoolV3");


  for(var i=0;i<10;i++)
  { 
    await dtoken.mint(accounts[i%(accounts.length)].address,web3.utils.toWei('100','ether'));
  }
  await bonusToken.mint(accounts[0].address,web3.utils.toWei('10000000','ether'));

  var outbalances =async function(){
    for(var i=0;i<accounts.length;i++)
    { 
      console.log("dtoken.balance %s amount=%d",accounts[i].address,(await dtoken.balanceOf(accounts[i].address)).toString());    
    }
  }

  await outbalances();
  var blockNumber = await provider.getBlockNumber();
  console.log("current blocknumber=",blockNumber);

  var startBlock = blockNumber + 100;
  const pool = await BXHDAOPoolV3.deploy(dtoken.address,bonusToken.address,startBlock,100,50);
  await pool.deployed();
  console.log("pool deployed to:", pool.address);

  for(var i=0;i<accounts.length;i++)
  { 
    await dtoken.connect(accounts[i]).approve(pool.address,web3.utils.toWei('100','ether'));
  }

  await bonusToken.approve(pool.address,web3.utils.toWei('10000000','ether'));

  var blockNumber = await provider.getBlockNumber();
  var startBlock = blockNumber + 10;

  await pool.setStartBlock(startBlock);

  var waitForBlock =async function(checkBlock,message){
    blockNumber = await provider.getBlockNumber();
    while(blockNumber<=checkBlock-1){
        await bonusToken.approve(pool.address,web3.utils.toWei('100','ether'));
        if(blockNumber%10==0)
        {
          console.log("waiting for "+message+":current="+blockNumber+",checkBlock="+checkBlock);
        }
        blockNumber = await provider.getBlockNumber();
    }
  }

  await pool.connect(accounts[0]).deposit(web3.utils.toWei('100','wei'),accounts[11].address);

  console.log("pool.dtoken.balance  amount=%d",(await dtoken.balanceOf(pool.address)).toString());    
  

  
  //init
  await pool.addRewards(web3.utils.toWei('100000','wei'));
  await waitForBlock(startBlock+10,"wait for start");

  blockNumber = await provider.getBlockNumber();

  console.log("pool.startBlock=%d,endblock=%d,rewardsPerBlocks=%s,blockNumber=%s",(await pool.rewardsStartBlock()).toString(10)
  ,(await pool.rewardsEndBlock()).toString(10),(await pool.rewardsPerBlocks()).toString(10),
  blockNumber.toString(10));    

  console.log("pool.getBlockReward at %d amount=%d",startBlock,(await pool.getBlockReward(startBlock+1)).toString(10));    

  // await waitForBlock(startBlock+100,"wait for start");

  // await pool.update();
  // await pool.addRewards(web3.utils.toWei('100000','wei'));
  await waitForBlock(startBlock+5,"wait for start");
  await pool.connect(accounts[1]).deposit(web3.utils.toWei('100','wei'),accounts[12].address);
  await pool.addRewards(web3.utils.toWei('100000','wei'));
  console.log("pool. bonus token.balance =%d,rewardsPerBlocks=%s,accRewards=%s,accRewardsPerShare=%s",
  (await bonusToken.balanceOf(pool.address)).toString(10),(await pool.rewardsPerBlocks()).toString(10)
  ,(await pool.accRewards()).toString(10),(await pool.accRewardsPerShare()).toString(10)); 

  await waitForBlock(startBlock+10,"wait for start");
  await pool.connect(accounts[1]).deposit(web3.utils.toWei('200','wei'),accounts[12].address);
  await waitForBlock(startBlock+20,"wait for start");
  await pool.connect(accounts[1]).deposit(web3.utils.toWei('300','wei'),accounts[12].address);


  
  console.log("userInfo %s amount=%s,dbalance=%s",accounts[1].address,JSON.stringify(await pool.userInfo(accounts[1].address)),(await dtoken.balanceOf(accounts[12].address)).toString(10)); 

  await pool.connect(accounts[1]).withdraw(web3.utils.toWei('50','wei'),accounts[12].address,10);

  console.log("userInfo %s amount=%s,dbalance=%s",accounts[1].address,JSON.stringify(await pool.userInfo(accounts[1].address)),(await dtoken.balanceOf(accounts[12].address)).toString(10)); 

  await waitForBlock(startBlock+60,"wait for start");
  await pool.connect(accounts[1]).withdraw(web3.utils.toWei('150','wei'),accounts[12].address,10);
  console.log("userInfo %s amount=%s,dbalance=%s",accounts[1].address,JSON.stringify(await pool.userInfo(accounts[1].address)),(await dtoken.balanceOf(accounts[12].address)).toString(10)); 

  await waitForBlock(startBlock+62,"wait for start");
  await pool.connect(accounts[1]).withdraw(web3.utils.toWei('150','wei'),accounts[12].address,10);
  console.log("userInfo %s amount=%s,dbalance=%s",accounts[1].address,JSON.stringify(await pool.userInfo(accounts[1].address)),(await dtoken.balanceOf(accounts[12].address)).toString(10)); 

  // await waitForBlock(startBlock+50,"wait for start");
  await pool.connect(accounts[1]).emergencyWithdraw(10);
  console.log("userInfo %s amount=%s,dbalance=%s",accounts[1].address,JSON.stringify(await pool.userInfo(accounts[1].address)),(await dtoken.balanceOf(accounts[12].address)).toString(10)); 

  await waitForBlock(startBlock+90,"wait for start");
  await pool.connect(accounts[1]).emergencyWithdraw(10);
  console.log("userInfo %s amount=%s,dbalance=%s",accounts[1].address,JSON.stringify(await pool.userInfo(accounts[1].address)),(await dtoken.balanceOf(accounts[12].address)).toString(10)); 

  // // await waitForBlock(startBlock+100,"wait for end");
  // console.log("pendingRewards %s amount=%d",accounts[0].address,(await pool.pendingRewards(accounts[0].address)).toString()); 
  // console.log("pendingRewards %s amount=%d",accounts[1].address,(await pool.pendingRewards(accounts[1].address)).toString()); 
  
  // // await pool.deposit(0,accounts[11].address);


  // await waitForBlock(startBlock+200,"wait for start");
  
  // await pool.connect(accounts[0]).deposit(0,accounts[11].address);
  // await pool.connect(accounts[1]).deposit(0,accounts[12].address);

  // console.log("pendingRewards.end %s amount=%d",accounts[0].address,(await pool.pendingRewards(accounts[0].address)).toString()); 
  // console.log("pendingRewards.end %s amount=%d",accounts[1].address,(await pool.pendingRewards(accounts[1].address)).toString()); 
  
  // console.log("btoken.balance %s amount=%d",accounts[11].address,(await bonusToken.balanceOf(accounts[11].address)).toString());    
  // console.log("btoken.balance %s amount=%d",accounts[12].address,(await bonusToken.balanceOf(accounts[12].address)).toString());    

  // await pool.addRewards(web3.utils.toWei('100000','wei'));
  // await waitForBlock(startBlock+210,"wait for start");

  // await pool.connect(accounts[1]).withdraw(web3.utils.toWei('50','wei'),accounts[12].address,10);

  // await waitForBlock(startBlock+330,"wait for start");

  // console.log("pendingRewards.end %s amount=%d",accounts[0].address,(await pool.pendingRewards(accounts[0].address)).toString()); 
  // console.log("pendingRewards.end %s amount=%d",accounts[1].address,(await pool.pendingRewards(accounts[1].address)).toString()); 

  // await pool.addRewards(web3.utils.toWei('100000','wei'));
  // await pool.addRewards(web3.utils.toWei('100000','wei'));
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
