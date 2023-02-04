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

async function becomeMember() {
  const SsacCommunityV1 = await ethers.getContractFactory("SsacCommunityV1");
  const proxyContract = new ethers.Contract(
    deployedProxyAddress,
    SsacCommunityV1.interface,
    wallet
  );

  await proxyContract.addMember();
  console.log("You are Now A member");
  console.log("#############################");
}

becomeMember();
