const { ethers, upgrades } = require("hardhat");

// TO DO: Place the address of your proxy here!
const proxyAddress = "0x44a31563F1Eb2389f2d59C6CFE23FF0344a6B519";

async function main() {
  const SsacCommunityV2 = await ethers.getContractFactory("SsacCommunityV2");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, SsacCommunityV2);

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );

  console.log(
    "The current contract owner address is: " + (await upgraded.owner())
  );
  console.log("New Implementation contract address: " + implementationAddress);
}

main();

// npx hardhat run scripts/upgradeProxy.js --network goerli
