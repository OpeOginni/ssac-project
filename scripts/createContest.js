const { ethers } = require("hardhat");
require("dotenv").config();

const alchemyProvider = new ethers.providers.JsonRpcProvider(
  process.env.ALCHEMY_GOERLI_URL
);
const wallet = new ethers.Wallet(
  process.env.GOERLI_PRIVATE_KEY,
  alchemyProvider
);
const deployedProxyAddress = "0x44a31563F1Eb2389f2d59C6CFE23FF0344a6B519";

async function main(contestTitle, registrationFee, tokenReward) {
  const SsacCommunityV2 = await ethers.getContractFactory("SsacCommunityV2");
  const proxyContract = new ethers.Contract(
    deployedProxyAddress,
    SsacCommunityV2.interface,
    wallet
  );

  await proxyContract.createContest(contestTitle, registrationFee, tokenReward);
  console.log("Contest Created");
}

const regFee = ethers.utils.parseUnits("0.01", "ether");
const _tokenReward = ethers.utils.parseUnits("15", "ether");

main("Alchemy University Test Contest", regFee, _tokenReward);

// Script: npx hardhat run scripts/createContest.js
