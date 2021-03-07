const { ethers ,network} = require("hardhat")
const { expect } = require("chai")
const { time } = require("./utilities")


describe("BXHPool", function () {
  before(async function () {
    
     const addrs =  network.config.bxh.address;


    this.BXHPool = await ethers.getContractFactory("BXHPool");
    this.bxhpool = await this.BXHPool.attach(addrs.bxhpool);
    
    console.log("BXHPool attach to:", this.bxhpool.address);

  })

  beforeEach(async function () {

  })

  it("should set loop test state variables", async function () {
      for(var i=0;i<30;i++){
          var blocknumer = i*7*24*1200;
          var peroidreward = await this.bxhpool.rewardV(blocknumer);
          var reward = await this.bxhpool.testBXHBlockRewardV(0,blocknumer);
          console.log(i+",peroid.reward="+peroidreward+".total="+reward);
      }
  })

  
})
