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

async function main(contestId, entryTitle, NFTAddress, regFee) {
  const SsacCommunityV1 = await ethers.getContractFactory("SsacCommunityV1");
  const proxyContract = new ethers.Contract(
    deployedProxyAddress,
    SsacCommunityV1.interface,
    wallet
  );

  await proxyContract.createEntry(contestId, entryTitle, NFTAddress, {
    value: regFee,
  });
  console.log("Entry Successful...Good Luck");
}
const regFee = ethers.utils.parseUnits("0.1", "ether");

main(
  0,
  "First Test Entry",
  "0xd3c4ee7dbdba22864ffeb94cd2e81675e849b8a4",
  regFee
);
