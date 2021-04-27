

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');


const web3 = require('web3');


async function main() {

  const addrs =  hre.network.config.bxh.address;
  var provider = ethers.provider;
  const accounts = await ethers.getSigners();
  const StarMaking = await hre.ethers.getContractFactory("StarMaking");
  // const raiseDao = await RaiseDAO.attach(addrs.raiseDao);  

  // console.log("RaiseDAO attach to:", raiseDao.address);

  const ERC20Template = await hre.ethers.getContractFactory("ERC20Template");

  const bxh = await ERC20Template.deploy(accounts[0].address,accounts[0].address,"Heco-Peg HBTC Token","bxh",18);
  await bxh.deployed();

  console.log("bxh deployed to:", bxh.address);

  const star = await StarMaking.deploy(accounts[0].address,bxh.address);  
  await star.deployed();
  console.log("StarMaking deployed to:", star.address);
  await star.addCaller(accounts[0].address);

  var projectAddrs = [];
  var projectNum = 10;
  for(var i=0;i<accounts.length;i++){
      await bxh.mint(accounts[i].address,web3.utils.toWei('10000','wei'));
      // await bxh.connect(accounts[i]).approve(star,web3.utils.toWei('10000','ether'));
  }

  for(var i=0;i<accounts.length;i++){
      console.log("bxh [%s],balance:%s ",accounts[i].address,(await bxh.balanceOf(accounts[i].address)).toString(10));
      await bxh.connect(accounts[i]).approve(star.address,web3.utils.toWei('10000','ether'));
  }


  console.log("create token project")

  for(var i=0;i<projectNum;i++){
      const testToken = await ERC20Template.deploy(accounts[0].address,accounts[0].address,"Heco-Peg HBTC Token","p"+i,18);
      await testToken.deployed(accounts[0].address,bxh);
      await projectAddrs.push(testToken.address);
      console.log("testToken "+i+" deployed to:", testToken.address);
  }
  // test deposit
  //wait for deposit begin
  var waitForBlock =async function(checkBlock,message){
    blockNumber = await provider.getBlockNumber();
    while(blockNumber<=checkBlock-1){
        await bxh.approve(star.address,web3.utils.toWei('10000000','ether'));
        if(blockNumber%10==0)
        {
          console.log("waiting for "+message+":current="+blockNumber+",checkBlock="+checkBlock);
        }
        blockNumber = await provider.getBlockNumber();
    }
  }
  //init phase
  var phaseId = 1000;

  blockNumber = await provider.getBlockNumber();

  var blockStart = blockNumber+100;
  var blockEnd = blockStart+100;
  var blockLocked = blockEnd + 10;

  console.log("add phase "+phaseId+",start="+blockStart+",end="+blockEnd+",locked="+blockLocked+",currentblock="+blockNumber);
  await star.addPhase(phaseId,blockStart,blockEnd,blockLocked);

  blockNumber = await provider.getBlockNumber();
  console.log("add phase ok : ",blockNumber);


  await star.addPhaseProjects(phaseId,projectAddrs);
  console.log("add phase project ok : ",blockNumber);

  var projectCount =await star.projectCount(phaseId);
  console.log("projectCount : ",projectCount);


  await waitForBlock(blockStart,"vote");
  
  var depositAmounts =[] ;

  for(var i=0;i<accounts.length;i++)
  { 
      var voteAmount = web3.utils.toWei('1'+i*1,'wei');
      console.log("try to vote %s amount=%d",accounts[i].address,voteAmount);
      await star.connect(accounts[i]).userVoteProject(phaseId,projectAddrs[i%projectAddrs.length],voteAmount);
  }

  for(var i=0;i<projectNum;i++){
     var voteInfo =await star.projectVoteInfo(phaseId,i);
      console.log("sorted:%d,%s,%s",i,voteInfo.addr,voteInfo.voteAmount.toString(10));
  }

  console.log("withdraw.try")
  for(var i=0;i<accounts.length;i++)
  { 
    try{
        await star.connect(accounts[i]).userWithdraw(phaseId);
    }catch(e){
      console.log("withdraw failed;",e)
    }
    
      // var voteAmount = web3.utils.toWei('1'+i*1,'ether');
      // console.log("try to vote %s amount=%d",accounts[i].address,voteAmount);
      
  }



  await waitForBlock(blockLocked,"withdraw");

  console.log("withdraw")
  for(var i=0;i<accounts.length;i++)
  { 
      // var voteAmount = web3.utils.toWei('1'+i*1,'ether');
      // console.log("try to vote %s amount=%d",accounts[i].address,voteAmount);
      await star.connect(accounts[i]).userWithdraw(phaseId);
  }
  
  for(var i=0;i<accounts.length;i++){
      console.log("bxh [%s],balance:%s ",accounts[i].address,(await bxh.balanceOf(accounts[i].address)).toString(10));
  }

console.log("withdraw.try")
  for(var i=0;i<accounts.length;i++)
  { 
    try{
        await star.connect(accounts[i]).userWithdraw(phaseId);
    }catch(e){
      console.log("withdraw failed;",e)
    }
      // var voteAmount = web3.utils.toWei('1'+i*1,'ether');
      // console.log("try to vote %s amount=%d",accounts[i].address,voteAmount);
      
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
