

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');


const web3 = require('web3');


async function main() {

  const addrs =  hre.network.config.bxh.address;

  const accounts = await ethers.getSigners();
  const RaiseDAO = await hre.ethers.getContractFactory("RaiseDAO");
  // const raiseDao = await RaiseDAO.attach(addrs.raiseDao);  

  // console.log("RaiseDAO attach to:", raiseDao.address);
  const raiseDao = await RaiseDAO.deploy();  
  await raiseDao.deployed();
  console.log("RaiseDAO deployed to:", raiseDao.address);

  const ERC20Template = await hre.ethers.getContractFactory("ERC20Template");

  const lpToken = await ERC20Template.deploy(accounts[0].address,accounts[0].address,"Heco-Peg HBTC Token","LPSwap",18);
  await lpToken.deployed();
  console.log("lpToken deployed to:", lpToken.address);

  const offeringToken = await ERC20Template.deploy(accounts[0].address,accounts[0].address,"offeringToken","OFT",18);
  await offeringToken.deployed();
  console.log("HETH deployed to:", offeringToken.address);

  
  var provider = ethers.provider;

  var offeringAmount = 100000;
  var raisingAmount = 1000;


  await offeringToken.mint(accounts[0].address,offeringAmount*1000);

  for(var i=0;i<accounts.length;i++)
  { 
    await lpToken.mint(accounts[i%(accounts.length)].address,web3.utils.toWei('100','ether'));
    await lpToken.connect(accounts[i]).approve(raiseDao.address,web3.utils.toWei('100','ether'));
    // await new Promise(r => setTimeout(r, 2000));
    // console.log("current blocknumber=",blockNumber);
  }
  var blockNumber = await provider.getBlockNumber();
  console.log("current blocknumber=",blockNumber);
  for(var i=0;i<accounts.length;i++){
    console.log("account:%s, lpToken=%d,offeringToken=%d",accounts[i].address,await lpToken.balanceOf(accounts[i].address),await offeringToken.balanceOf(accounts[i].address));
  }



  var startBlock = blockNumber + 100;
  var endBlock = startBlock + 100;

  //init
  await raiseDao.initialize(lpToken.address,offeringToken.address,startBlock,endBlock,offeringAmount,raisingAmount);
  console.log("inititok, startblock=%s,endblock=%d",startBlock,endBlock);

  //add peroid
  var i=0;
  var loop = 10;
  var release_start = endBlock + 10;
  var releaseAmounts = [];
  for(var i=0;i<loop;i++){
    // releaseAmounts[i] = offeringAmount/loop;
  }
  releaseAmounts[0] = 8000;
  releaseAmounts[1] = 1000;
  releaseAmounts[2] = 1000;

  var total_releast_start = release_start;

  for(var i=0;i<releaseAmounts.length;i++){
      var release_end = release_start + 100;
      var release_amount = releaseAmounts[i];
      await raiseDao.addReleasePeroid(release_start,release_end,release_amount);
      var releaseInfo = await raiseDao.getReleaseInfo(i)
      console.log("releaseInfo[start=%s,end=%s,perBlock=%s,amount=%s,lastAmount=%s",
            releaseInfo._startBlock.toString(),
            releaseInfo._endBlock.toString(),
            releaseInfo._releasePerBlock.toString(),
            releaseInfo._releaseAmount.toString(),
            releaseInfo._lastTotalAmount.toString());

      release_start = release_end + 1;

  }
  var total_release_end = release_end;
  //test block

  var testBlock = total_releast_start+ 100 + 2;

  var testRU = await raiseDao.getReleaseUpdate(testBlock);//1010
  console.log("releaseUpdate,testi=%d:amount=%s,id=%s",testBlock,testRU._releaseAmountUpdated.toString(),testRU._releaseIdUpdate.toString())
  
  var testBlock = release_end - 11;

  var testRU = await raiseDao.getReleaseUpdate(testBlock);
  console.log("releaseUpdate,testi=%d:amount=%s,id=%s",testBlock,testRU._releaseAmountUpdated.toString(),testRU._releaseIdUpdate.toString())

  // test deposit
  //wait for deposit begin
  var waitForBlock =async function(checkBlock,message){
    blockNumber = await provider.getBlockNumber();
    while(blockNumber<=checkBlock-1){
        await lpToken.approve(raiseDao.address,web3.utils.toWei('100','ether'));
        if(blockNumber%10==0)
        {
          console.log("waiting for "+message+":current="+blockNumber+",checkBlock="+checkBlock);
        }
        blockNumber = await provider.getBlockNumber();
    }
  }

  await waitForBlock(startBlock,"deposit");
  
  var depositAmounts =[] ;

  for(var i=0;i<accounts.length;i++)
  { 
    depositAmounts [i] = raisingAmount/accounts.length;
  }

  for(var i=0;i<accounts.length;i++){
    console.log("try to deposit %s amount=%d",accounts[i].address,depositAmounts[i]);
    await raiseDao.connect(accounts[i]).deposit(depositAmounts[i]);
  }

  console.log("total lptoken = ",(await lpToken.balanceOf(raiseDao.address)).toString());

  await  offeringToken.connect(accounts[0]).transfer(raiseDao.address,offeringAmount*3);

  console.log("total offeringToken = ",(await offeringToken.balanceOf(raiseDao.address)).toString());

  await waitForBlock(total_releast_start,"harvest" );

  // await raiseDao.connect(accounts[0]).harvest();
  
  for(var i=0;i<accounts.length;i++)
  { 
    blockNumber = await provider.getBlockNumber();
    await raiseDao.connect(accounts[i]).harvest();
      
    console.log("get balance %s amount=%d,blocknumber=%d",accounts[i].address,(await offeringToken.balanceOf(accounts[i].address)).toString(),blockNumber-total_releast_start+1);    

  }
  // raiseDao.initialize(addrs.usdt,hdot,)  

  blockNumber = await provider.getBlockNumber();
  await waitForBlock(blockNumber + 100,"harvest p1" );

  // await raiseDao.connect(accounts[0]).harvest();
  
  for(var i=0;i<accounts.length;i++)
  { 
    blockNumber = await provider.getBlockNumber();
    await raiseDao.connect(accounts[i]).harvest();
    
    console.log("get balance %s amount=%d,blocknumber=%d",accounts[i].address,(await offeringToken.balanceOf(accounts[i].address)).toString(),blockNumber-total_releast_start+1);    
  }

  await waitForBlock(total_release_end,"harvest end" );

  // await raiseDao.connect(accounts[0]).harvest();
  
  for(var i=0;i<accounts.length;i++)
  { 
    blockNumber = await provider.getBlockNumber();
    await raiseDao.connect(accounts[i]).harvest();
    
    console.log("get balance %s amount=%d,blocknumber=%d",accounts[i].address,(await offeringToken.balanceOf(accounts[i].address)).toString(),blockNumber-total_releast_start+1);    
  }
  
  await waitForBlock(total_release_end+30,"harvest again" );
  for(var i=0;i<accounts.length;i++)
  { 
    blockNumber = await provider.getBlockNumber();
    await raiseDao.connect(accounts[i]).harvest();
    
    console.log("get balance %s amount=%d,blocknumber=%d",accounts[i].address,(await offeringToken.balanceOf(accounts[i].address)).toString(),blockNumber-total_releast_start+1);    
  }

  var lpLeft =  await lpToken.balanceOf(raiseDao.address);
  var offeringLeft =  await offeringToken.balanceOf(raiseDao.address);
  console.log("token Left:lp=%s,offer=%s",lpLeft.toString(),offeringLeft.toString())
  raiseDao.finalWithdraw(lpLeft,offeringLeft);
  
  blockNumber = await provider.getBlockNumber();
  await waitForBlock(blockNumber+30,"finalwithdraw" );
  var lpLeft =  await lpToken.balanceOf(raiseDao.address);
  var offeringLeft =  await offeringToken.balanceOf(raiseDao.address);
  console.log("token Left.after final withdraw:lp=%s,offer=%s",lpLeft.toString(),offeringLeft.toString())
  // raiseDao.finalWithdraw();
  
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
