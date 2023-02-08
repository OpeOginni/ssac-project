import { ethers } from "ethers";
import SsacToken from "../../artifacts/contracts/SsacToken.sol/SSACTOKEN";

const alchemyProvider = new ethers.providers.JsonRpcProvider(
  "https://eth-goerli.g.alchemy.com/v2/QqSZFIahqZ-ZKKwyQhjNXg2HCzQfw8-B"
);
const deployedSsacTokenAddress = "0x03bECfd9152B01E28522AD6073eA1264EAE87c46";

export const userTokenBalance = async (account) => {
  const SsacTokenContract = new ethers.Contract(
    deployedSsacTokenAddress,
    SsacToken.abi,
    alchemyProvider
  );

  return await SsacTokenContract.balanceOf(account);
};
