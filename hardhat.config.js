require("@nomiclabs/hardhat-waffle");
require("@nomiclabs/hardhat-etherscan");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html

const accounts = {
  mnemonic: process.env.MNEMONIC || "test test test test test test test test test test test junk",

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
           fee: "f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
           usdt:"0x9fE46736679d2D9a65F0992F2272dE9f3c7fa6e0",
           husd:"0xCf7Ed3AccA5a467e9e704C703E8D87F634fB0Fc9",
           hbtc:"0xDc64a140Aa3E981100a9becA4E685f962f0cF6C9",
           heth:"0x5FC8d32690cc91D4c39d9d3abcBD16989F875707",
           hltc:"0x0165878A594ca255338adfa4d48449f69242Eb8F",
           wht :"0xa513E6E4b8f2a923D98304ec87F64353C4D5C853",
           hdot:"0x2279B7A0a67DB372996a5FaB50D91eAA73d2eBe6",
           bxh :"CD8a1C3ba11CF5ECfa6267617243239504a98d90",
           bxhpool:"0x9E545E3C0baAB3E08CdfD552C960A1050f373042",
           uniswap:{
             factory:"0x84eA74d481Ee0A5332c457a4d796187F6Ba67fEB",
             router:"0x96F3Ce39Ad2BfDCf92C0F6E2C2CAbF83874660Fc",
           },
           airdrop:"0xa82fF9aFd8f496c3d6ac40E2a0F282E47488CFc9",
           investTeamLock:"0xc582Bc0317dbb0908203541971a358c44b1F3766",
           marketTeamLock:"0x74Cf9087AD26D541930BaC724B7ab21bA8F00a27",
           devTeamLock:"0xA56F946D6398Dd7d9D4D9B337Cf9E0F68982ca5B",

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
           fee: "0xdEa9d2E81c9bb73c890A822F65118a3651c258D5",
           usdt:"0xa71edc38d189767582c38a3145b5873052c3e47a",
           husd:"0x0298c2b32eae4da002a15f36fdf7615bea3da047",
           hbtc:"0x66a79d23e58475d2738179ca52cd0b41d73f0bea",
           heth:"0x64ff637fb478863b7468bc97d30a5bf3a428a1fd",
           hltc:"0xecb56cf772b5c9a6907fb7d32387da2fcbfb63b4",
           wht :"0x5545153ccfca01fbd7dd11c0b23ba694d9509a6f",
           hdot:"0xa2c49cee16a5e5bdefde931107dc1fae9f7773e3",
           bxh :"0x2E90FF584Bbe93709fFc8577E7b58d921Da6A4ce",
           uniswap:{
             factory:"0xB6B1fE87cAa52D968832a5053116af08f4601475",
             router:"0x9fE4C3F35a92F7C7278BB951adABb5Bd438A0637",
           },
           bxhpool: "0x1bCb6DF7Cdd74E391d809C167a8E262709614985",
           airdrop:"0x11FAc317F65Ff823B9F79f4e1CaFDe55E93484DD",
           investTeamLock:"0x0ed64d01D0B4B655E410EF1441dD677B695639E7",
           marketTeamLock:"0xde2Bd2ffEA002b8E84ADeA96e5976aF664115E2c",
           devTeamLock:"0xc582Bc0317dbb0908203541971a358c44b1F3766",

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

    }
  }
};

