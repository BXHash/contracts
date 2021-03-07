require("@nomiclabs/hardhat-waffle");

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
  defaultNetwork: "local",
  networks: {
    local: {
      url: `http://localhost:8545`,
      bxh:{
         address:{
           fee: "f39fd6e51aad88f6f4ce6ab8827279cfffb92266",
           usdt:"36C02dA8a0983159322a80FFE9F24b1acfF8B570",
           husd:"Dc64a140Aa3E981100a9becA4E685f962f0cF6C9",
           hbtc:"809d550fca64d94Bd9F66E60752A544199cfAC3D",
           heth:"4c5859f0F772848b2D91F1D83E2Fe57935348029",
           hltc:"1291Be112d480055DaFd8a610b7d1e203891C274",
           wht :"5f3f1dBD7B74C6B46e8c44f98792A1dAf8d69154",
           hdot:"FD471836031dc5108809D173A067e8486B9047A3",
           bxh :"CD8a1C3ba11CF5ECfa6267617243239504a98d90",
           uniswap:{
             factory:"21dF544947ba3E8b3c32561399E88B52Dc8b2823",
             router:"D8a5a9b31c3C0232E196d518E89Fd8bF83AcAd43",
           }
         }
      }
    },
    mainnet: {
      url: `https://mainnet.infura.io/v3/${process.env.INFURA_API_KEY}`,
      gasPrice: 120 * 1000000000,
      chainId: 1,
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
           }
           bxhpool: "998abeb3E57409262aE5b751f60747921B33613E",
           airdrop:"70e0bA845a1A0F2DA3359C97E0285013525FFC49",
         }
      },

    }
  }
};

