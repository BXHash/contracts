
const { ethers ,network} = require("hardhat")
const { expect } = require("chai")
const { time } = require("./utilities")


describe("TeamTimeLock", function () {
  before(async function () {
    
     const addrs =  network.config.bxh.address;


    this.TeamTimeLock = await ethers.getContractFactory("TeamTimeLock");
    this.investTeamLock = await this.TeamTimeLock.attach(addrs.investTeamLock);
   
    console.log("investTeamLock attach to:", this.investTeamLock.address);


    this.marketTeamLock = await this.TeamTimeLock.attach(addrs.marketTeamLock);
   
    console.log("marketTeamLock attach to:", this.marketTeamLock.address);

    this.devTeamLock = await this.TeamTimeLock.attach(addrs.devTeamLock);
   
    console.log("investTeamLock attach to:", this.devTeamLock.address);


  })

  beforeEach(async function () {

  })


  it("investTeamLock max 30000000", async function () {
      
      for(var i=0;i<=24;i+=2){
          var blocknumer = i*30*24*1200+1;//month
          var reward = await this.investTeamLock.getReward(blocknumer);
          console.log("investTeamLock:"+i+",reward="+reward/1e18);
      }
  })
  

  it("marketTeamLock max 45000000", async function () {
      for(var i=0;i<=24;i+=2){
          var blocknumer = i*30*24*1200+1;//month
          var reward = await this.marketTeamLock.getReward(blocknumer);
          console.log("marketTeamLock:"+i+",reward="+reward/1e18);
      }
  })
  

  it("devTeamLock max 100000000", async function () {
      for(var i=0;i<=48;i+=2){
          var blocknumer = i*30*24*1200+1;//month
          var reward = await this.devTeamLock.getReward(blocknumer);
          console.log("devTeamLock:"+i+",reward="+reward/1e18);
      }
  })
  
  
})
