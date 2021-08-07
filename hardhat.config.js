require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html

require("brewchain_provider");

const accounts = {
  mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",
  initialIndex: 8
  // accountsBalance: "990000000000000000000",
}

task("accounts", "Prints the list of accounts", async () => {
  const accounts = await ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

// You need to export an object to set up your config
// Go to https://hardhat.org/config/ to learn more

/**
 * @type import('hardhat/config').HardhatUserConfig
 */
module.exports = {

  solidity: {
    compilers: [
      {
        version: "0.6.12",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
      {
        version: "0.5.17",
        settings: {
          optimizer: {
            enabled: true,
            runs: 200,
          },
        },
      },
    ],
  },
  spdxLicenseIdentifier: {
    overwrite: false,
    runOnCompile: true,
  },
  etherscan: {
    // Your API key for Etherscan
    // Obtain one at https://etherscan.io/
    apiKey:"6IQTZTMD392X2U2SYZBABWDS8KB6D8UD4T"
  },
  defaultNetwork: "local",
  networks: {
    local: {
      url: `http://localhost:8545`,
      accounts,
      bxh:{
         address:{
           fee: "0x8626f6940E2eb28930eFb4CeF49B2d1F2C9C1199",
           usdt:"0x2E0716Bb0c304563A9B6fCfDb0F68853E2726ea9",
           husd:"0x93BC7B91095b858973E09840B9843f80e0D787c8",
           hbtc:"0x6D6d5aB9BC123eA4e158b4DEe3b2FBEcA653d210",
           heth:"0x4ce26bB44E7deca7ac251B9A417fd8fc3C9Ddb7f",
           hltc:"0xbB84aA7b4ccD3578a45BB3090E9c33709E135F1f",
           wht :"0x02894BfC9c0706e79A075034E773665E1DaAc232",
           hdot:"0x9bDfE084d23D3d1275AE961e3FD2E82A4d11Cd89",
           bxh :"0xa0E9406b961393d90D247B690ecAc709364ADA86",
           bxhpool:"0x2De757e2Aade1dEbA57Ee68ca69A5Dc6642551da",
           uniswap:{
             factory:"0xBb032F40F0cF21236314ECB438dC38d06F936ec6",
             router:"0x0a0B85D9Ee736253348f266665845A915b398097",
           },
           delp: "0x9eCdfEDA21F3100466e6695E6f74BBa6EDB19332",
           airdrop:"0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9",
           investTeamLock:"0xc582Bc0317dbb0908203541971a358c44b1F3766",
           marketTeamLock:"0x74Cf9087AD26D541930BaC724B7ab21bA8F00a27",
           devTeamLock:"0xA56F946D6398Dd7d9D4D9B337Cf9E0F68982ca5B",
           raiseDao:"0x98eDDadCfde04dC22a0e62119617e74a6Bc77313",
         }
      }
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      gasPrice: 120 * 1000000000,
      chainId: 1,
    },
    heco:{
      url: `https://http-mainnet.hecochain.com`,
      accounts,
      gasPrice: 20*1000000000,
      chainId: 128,
      loggingEnabled: true,
      blockGasLimit:0x280de80,
      bxh:{
         address:{
           owner:"0xdEa9d2E81c9bb73c890A822F65118a3651c258D5",
           fee: "0xdEa9d2E81c9bb73c890A822F65118a3651c258D5",
           admin: "0xdEa9d2E81c9bb73c890A822F65118a3651c258D5",
           admin1: "0x56146B129017940D06D8e235c02285A3d05D6B7C",
           usdt:"0xa71edc38d189767582c38a3145b5873052c3e47a",
           husd:"0x0298c2b32eae4da002a15f36fdf7615bea3da047",
           hbtc:"0x66a79d23e58475d2738179ca52cd0b41d73f0bea",
           heth:"0x64ff637fb478863b7468bc97d30a5bf3a428a1fd",
           hltc:"0xecb56cf772b5c9a6907fb7d32387da2fcbfb63b4",
           wht :"0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f",
           hdot:"0xa2c49cee16a5e5bdefde931107dc1fae9f7773e3",
           bxh :"0xcBD6Cb9243d8e3381Fea611EF023e17D1B7AeDF0",
           uniswap:{
             factory:"0xB8617E2FC9dbFd51781B8D281b725976E3B43f9d",
             router:"0x00eFB96dBFE641246E961b472C0C3fC472f6a694",
           },
           bxhpool: "0x55bf276e2a2e10AEB62c0Ed37D36585cB24d9cC1",
           airdrop:"0xcA1530D5282C703bf3c73c6A08794020dae8b397",
           airdropPool:"0x0Ef67c16904Af312796560dF80E60581C43C4e24",
           investTeamLock:"0xD7B6192601F6e671E42926797a2462a5b6B7b13d",
           marketTeamLock:"0xee73ae5C86fd78DbFF1e07a6e9e42D4F1EafDeb0",
           devTeamLock:"0x186Dc1ebF9281F98167cfD0A0794B9934587A142",
           raiseDao:"0x98eDDadCfde04dC22a0e62119617e74a6Bc77313",
           xtoken:"0x11Ca689B3aB2f0d28d95dE62bbbB384C4173c893",
           daopool:"0x2f15fD83710aD8E9ea5E1A25ba05942Eaf389307",
           daov3:"0x6c9985eB3288f3E89E54ceeE818028aB81e532bC",

         }
      },
    },
    hecolocal:{
      url: `http://94.74.87.188:8545`,
      accounts,
      gasPrice: 0x3b9aca00,
      chainId: 3388,
      bxh:{
         address:{
           fee: "f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
           usdt:"e7f1725E7734CE288F8367e1Bb143E90bb3F0512",
           husd:"9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
           hbtc:"Cf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
           heth:"Dc64a140Aa3E981100a9becA4E685f962f0cF6C9",
           hltc:"5FC8d32690cc91D4c39d9d3abcBD16989F875707",
           wht :"0165878A594ca255338adfa4d48449f69242Eb8F",
           hdot:"a513E6E4b8f2a923D98304ec87F64353C4D5C853",
           bxh :"1613beB3B2C4f22Ee086B2b38C1476A3cE7f78E8",
           uniswap:{
             factory:"851356ae760d987E095750cCeb3bC6014560891C",
             router:"95401dc811bb5740090279Ba06cfA8fcF6113778",
           },
           bxhpool: "4826533B4897376654Bb4d4AD88B7faFD0C98528",
           airdrop:"70e0bA845a1A0F2DA3359C97E0285013525FFC49",
           investTeamLock:"0x0ed64d01D0B4B655E410EF1441dD677B695639E7",
           marketTeamLock:"0xde2Bd2ffEA002b8E84ADeA96e5976aF664115E2c",
           devTeamLock:"0xc582Bc0317dbb0908203541971a358c44b1F3766",

         }
      },
    },
    brewchain:{
      url:"http://localhost:8000",
      accounts,
      gasPrice: 20*1000000000,
      chainId: 128,
      loggingEnabled: true,
      blockGasLimit:0x280de80,
      bxh:{
         address:{
           fee: "0xD8b60b2d2FEE9bda23ed03a66154077328863c71",
           usdt:"0x9BAE23D58C9f528e0Bb517153374538042b4750F",
           husd:"0xd3bA38D99DB3649eD337a873B051DB544976F8Bc",
           hbtc:"0x04E39BA4c07Aa1A3a45995aF76d8376155Dac229",
           heth:"0x16Ab21A0246A31D21E776f739Bade4d0eE985606",
           hltc:"0xB563231B650A5391Ff61fb401B0B4d0e68895a90",
           wht :"0xd886ab0c60EBB4f344F6316FaB63476265be613B",
           hdot:"0x67ac8de54d9a723Fb6dE2954FE1110Ec33bbb52E",
           bxh :"0x5CcCBefE4BD2B52A232639cB3eA79e5C2153c970",
           uniswap:{
             factory:"0x632701B718480868c3db574B4c69F1415b45a73a",
             router: "0x9dD214014CbE19384da60526800aFc7607c26CAF",
           },
           bxhpool: "4826533B4897376654Bb4d4AD88B7faFD0C98528",
           airdrop:"70e0bA845a1A0F2DA3359C97E0285013525FFC49",
           investTeamLock:"0x0ed64d01D0B4B655E410EF1441dD677B695639E7",
           marketTeamLock:"0xde2Bd2ffEA002b8E84ADeA96e5976aF664115E2c",
           devTeamLock:"0xc582Bc0317dbb0908203541971a358c44b1F3766",

         }
      },
    },
  }
};

