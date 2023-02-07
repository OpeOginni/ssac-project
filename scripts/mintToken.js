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

const addressToMintTo = "0x798dAf26493A3bc4bD3ca862E4a65b2f63062D6f";

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
