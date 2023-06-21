import { HardhatUserConfig } from 'hardhat/types';
import '@nomicfoundation/hardhat-ethers';
import '@typechain/hardhat';
import * as dotenv from 'dotenv'
dotenv.config()
const config: HardhatUserConfig = {
  solidity: "0.8.18",
  networks: {
    hardhat: {
      forking: {
        url: `${process.env.ALCHEMY_URL}` ?? "",
      }
    }
  }
};

export default config;
