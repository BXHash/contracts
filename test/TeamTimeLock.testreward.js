
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
      this.accounts = await ethers.getSigners();
  })


  it("investTeamLock max 30000000", async function () {
      
      for(var i=0;i<=24;i+=2){
          var blocknumer = i*30*24*1200+1;//month
          var totalReward = await this.investTeamLock.getTotalReward(blocknumer);
          var reward0 = await this.investTeamLock.getReward(this.accounts[0].address,blocknumer);
          var reward1 = await this.investTeamLock.getReward(this.accounts[1].address,blocknumer);
          var reward2 = await this.investTeamLock.getReward(this.accounts[2].address,blocknumer);
          console.log("investTeamLock:"+i+",totalReward="+totalReward/1e18+"["+reward0/1e18+","+reward1/1e18+","+reward2/1e18+"]");
      }
  })
  

  it("marketTeamLock max 45000000", async function () {
      for(var i=0;i<=24;i+=2){
          var blocknumer = i*30*24*1200+1;//month
          var totalReward = await this.marketTeamLock.getTotalReward(blocknumer);
          var reward0 = await this.marketTeamLock.getReward(this.accounts[0].address,blocknumer);
          var reward1 = await this.marketTeamLock.getReward(this.accounts[1].address,blocknumer);
          var reward2 = await this.marketTeamLock.getReward(this.accounts[2].address,blocknumer);
          console.log("marketTeamLock:"+i+",totalReward="+totalReward/1e18+"["+reward0/1e18+","+reward1/1e18+","+reward2/1e18+"]");
      }
  })
  

  it("devTeamLock max 100000000", async function () {
      for(var i=0;i<=48;i+=2){
          var blocknumer = i*30*24*1200+1;//month
          var totalReward = await this.devTeamLock.getTotalReward(blocknumer);
          var reward0 = await this.devTeamLock.getReward(this.accounts[0].address,blocknumer);
          var reward1 = await this.devTeamLock.getReward(this.accounts[1].address,blocknumer);
          var reward2 = await this.devTeamLock.getReward(this.accounts[2].address,blocknumer);
          console.log("devTeamLock:"+i+",totalReward="+totalReward/1e18+"["+reward0/1e18+","+reward1/1e18+","+reward2/1e18+"]");

      }
  })
  
  
})
