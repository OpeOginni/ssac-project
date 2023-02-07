import { ethers } from "ethers";
import SsacCommunityV2 from "../artifacts/contracts/SsacCommunityV2.sol/SsacCommunityV2";

// const ethers = require("ethers");
// const SsacCommunityV2 = require("../artifacts/contracts/SsacCommunityV2.sol/SsacCommunityV2");

const alchemyProvider = new ethers.providers.JsonRpcProvider(
  "https://eth-goerli.g.alchemy.com/v2/QqSZFIahqZ-ZKKwyQhjNXg2HCzQfw8-B"
);
const deployedProxyAddress = "0x44a31563F1Eb2389f2d59C6CFE23FF0344a6B519";

export const getEntries = async (contestId) => {
  // const getEntries = async (contestId) => {
  const proxyContract = new ethers.Contract(
    deployedProxyAddress,
    SsacCommunityV2.abi,
    alchemyProvider
  );

  let entries = [];

  const noOfEnries = await proxyContract.getNoOfEntries(contestId);

  for (var i = 1; i <= noOfEnries; i++) {
    const entry = await proxyContract.getEntry(contestId, i);
    entries.push(entry);
  }

  // FOR TESTS
  //   console.log(entries[0].entryId.toNumber());
  //   console.log(entries[0].noOfVotes.toNumber());
  //   console.log(entries[0].NFT_Address);
  console.log(entries);

  return entries;
};
