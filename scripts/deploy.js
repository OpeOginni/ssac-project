const { Contract } = require("ethers");
const { ethers, upgrades } = require("hardhat");

async function main() {
  let voteFee = ethers.utils.parseUnits("1", "ether");

  // Deploying the communnity contract
  const SsacCommunityV1 = await ethers.getContractFactory("SsacCommunityV1");
  const proxy = await upgrades.deployProxy(SsacCommunityV1, [voteFee]);
  await proxy.deployed();

  const deployedTokenAddress = await proxy.getTokenAddress();

  const SSACTOKEN = await ethers.getContractFactory("SSACTOKEN");

  // Creating the Deployed Contract Interface
  const ssacToken = new Contract(
    deployedTokenAddress,
    SSACTOKEN.interface,
    owner
  );

  const implementationAddress = await upgrades.erc1967.getImplementationAddress(
    proxy.address
  );

  console.log("Proxy contract address: " + proxy.address);

  console.log("Implementation contract address: " + implementationAddress);

  console.log("Deployed SSAC Token address: " + ssacToken.address);
}

main();
