import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "dotenv/config";
import "@typechain/hardhat";

const { PRIVATE_KEY="", SEPOLIA_RPC_URL="", MUMBAI_RPC_URL="", ETHERSCAN_API_KEY="", ZKEVM_TESTNET_RPC_URL="" } = process.env;

const config: HardhatUserConfig = {
  solidity: {
    version: "0.8.19",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    },
  },
  defaultNetwork: "hardhat",
  networks: {
    sepolia: {
      url: SEPOLIA_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 11155111
    },
    zkevm_testnet: {
      url: ZKEVM_TESTNET_RPC_URL,
      accounts: [PRIVATE_KEY],
      chainId: 1442
    },
    localhost: {
      url: "http://localhost:8545",
      chainId: 31337
    },
  },
  etherscan: {
    apiKey: {
      zkevm_testnet: ETHERSCAN_API_KEY
    } 
  },
  gasReporter: {
    enabled: true,
  },
  paths: {
    artifacts: "../frontend/app/artifacts",
  },
};

export default config;
