require("@nomiclabs/hardhat-etherscan");

async function verify() {
  await hre.run("verify:verify", {
    address: "0x130cF7bb0A5981fC91EA64c26baf4400074511eA", // Put in the address of your deployed contract...Not proxy
  });
}

verify();
module.exports = { verify };

// npx hardhat verify --network goerli <implementationAddress>

// OR

// npx hardhat run utils/verify.js --network goerli

// If error clear aritfacts and cache
