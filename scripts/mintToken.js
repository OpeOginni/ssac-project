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

const addressToMintTo = "0xa55ad720F75cfD9f5F6F9b8C2FC51eA383671421"; // Change this only

const mintAmount = ethers.utils.parseUnits("1", "ether");

async function main(_wallet) {
  const SsacCommunityV2 = await ethers.getContractFactory("SsacCommunityV2");
  const proxyContract = new ethers.Contract(
    deployedProxyAddress,
    SsacCommunityV2.interface,
    wallet
  );

  await proxyContract.mintToken(addressToMintTo, mintAmount);
  console.log("TOKEN MINTED");
}

main(wallet);

// npx hardhat run scripts/mintToken.js --network goerli
