require("@nomicfoundation/hardhat-toolbox");
require("@chainlink/env-enc").config();
require("@nomicfoundation/hardhat-verify");
require("./tasks");

module.exports = {
  solidity: "0.8.28",
  networks: {
    sepolia: {
      url: process.env.SEPOLIA_RPC_URL,
      accounts: [process.env.PRIVATE_KEY, process.env.PRIVATE_KEY_1],
      chainId: 11155111
    },
  },
  etherscan: {
    apiKey: {
      sepolia: process.env.ETHERSCAN_API_KEY,
    }
  },
};

