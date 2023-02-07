import { ethers } from "ethers";
import SsacCommunityV2 from "../artifacts/contracts/SsacCommunityV2.sol/SsacCommunityV2";

const alchemyProvider = new ethers.providers.JsonRpcProvider(
  "https://eth-goerli.g.alchemy.com/v2/QqSZFIahqZ-ZKKwyQhjNXg2HCzQfw8-B"
);
const deployedProxyAddress = "0x44a31563F1Eb2389f2d59C6CFE23FF0344a6B519";

export const isMember = async (userAddress) => {
  const proxyContract = new ethers.Contract(
    deployedProxyAddress,
    SsacCommunityV2.abi,
    alchemyProvider
  );

  return await proxyContract.isMember(userAddress);
};
