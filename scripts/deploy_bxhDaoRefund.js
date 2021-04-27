

const hre = require("hardhat");
require("@nomiclabs/hardhat-waffle");
var Assert = require('assert');

const web3 = require('web3');




async function main() {

  const addrs =  hre.network.config.bxh.address;

  const accounts = await ethers.getSigners();
  const BXH = await hre.ethers.getContractFactory("BXHToken");
  const bxh = await BXH.attach(addrs.bxh);
  Assert.equal("BXH",await bxh.symbol(),"BXH Contract Attach Error");
  console.log("BXH attached to:", bxh.address);


  const BXHDaoRefund = await hre.ethers.getContractFactory("BXHDaoRefund");
;
  const bxhDaoRefund = await BXHDaoRefund.deploy(bxh.address,"0x569Ef8E5EbEF3D6807aA9Faf232FAb5272CE65D4",addrs.admin1);
  await bxhDaoRefund.deployed();
  console.log("BXHDaoRefund deployed to:", bxhDaoRefund.address);
  
  await bxhDaoRefund.transferOwnership(addrs.admin1);

  var newowner = await bxhDaoRefund.owner();
  newowner = await bxhDaoRefund.owner();
  console.log("BXHDaoRefund owner to  to:", newowner);


}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });
