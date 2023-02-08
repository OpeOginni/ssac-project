const { ethers } = require("hardhat");
require("dotenv").config();

const CONTEST_ID = 2;

const alchemyProvider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_GOERLI_URL
);
const wallet = new ethers.Wallet(
  process.env.GOERLI_PRIVATE_KEY,
  alchemyProvider
);
const deployedProxyAddress = "0x44a31563F1Eb2389f2d59C6CFE23FF0344a6B519";

async function main(contestId) {
  const SsacCommunityV2 = await ethers.getContractFactory("SsacCommunityV2");
  const proxyContract = new ethers.Contract(
    deployedProxyAddress,
    SsacCommunityV2.interface,
    wallet
  );

  await proxyContract.endContest(contestId);
  console.log("Contest Over...Winner Rewarded");
}

main(CONTEST_ID);

// npx hardhat run scripts/endContest.js --network goerli
