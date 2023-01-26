require("@nomiclabs/hardhat-etherscan");

async function verify() {
  await hre.run("verify:verify", {
    // address:  // Put in the address of your deployed contract...Not proxy
  });
}

verify();
