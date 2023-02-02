require("@nomiclabs/hardhat-etherscan");

const verify = async (implementationAddress) => {
  await hre.run("verify:verify", {
    address: implementationAddress, // Put in the address of your deployed contract...Not proxy
  });
};

module.exports = { verify };

// npx hardhat verify --network goerli <implementationAddress>

// If error clear aritfacts and cache
