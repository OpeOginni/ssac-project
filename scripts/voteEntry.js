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

const mintAmount = ethers.utils.parseUnits("2", "ether");

async function main(contestId, entryId, _wallet) {
  const SsacCommunityV1 = await ethers.getContractFactory("SsacCommunityV1");
  const proxyContract = new ethers.Contract(
    deployedProxyAddress,
    SsacCommunityV1.interface,
    wallet
  );

  await proxyContract.mintToken(wallet.address, mintAmount);

  await proxyContract.vote(contestId, entryId);
  console.log("Voted Successful...");
}

main(0, 1, wallet);
