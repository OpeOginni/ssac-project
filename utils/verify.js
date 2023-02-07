require("@nomiclabs/hardhat-etherscan");

async function verify() {
  await hre.run("verify:verify", {
    address: "0x3561eA0e38d03602b2ce83770D2a5B28E2C919bc", // Put in the address of your deployed contract...Not proxy
  });
}

verify();
module.exports = { verify };

// npx hardhat verify --network goerli <implementationAddress>

// OR

// npx hardhat run utils/verify.js --network goerli

// If error clear aritfacts and cache
