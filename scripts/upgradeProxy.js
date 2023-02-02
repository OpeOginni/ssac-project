const { ethers, upgrades } = require("hardhat");

// TO DO: Place the address of your proxy here!
const proxyAddress = "";

async function main() {
  const SsacCommunityV2 = await ethers.getContractFactory("SsacCommunityV2");
  const upgraded = await upgrades.upgradeProxy(proxyAddress, SsacCommunityV2);

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxyAddress
  );

  console.log(
    "The current contract owner address is: " + (await upgraded.owner())
  );
  console.log("Implementation contract address: " + implementationAddress);
}

main();
