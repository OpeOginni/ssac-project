const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect, use } = require("chai");
const { ethers } = require("hardhat");
require("dotenv").config();

describe("SsacToken", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployToken() {
    const SsacToken = await ethers.getContractFactory("SSACTOKEN");
    const ssacToken = await SsacToken.deploy();

    const [owner, user1, user2] = await ethers.getSigners();
    let preMintAmount = ethers.utils.parseUnits("100", "ether");
    let giftAmount = ethers.utils.parseUnits("1", "ether");
    let mintAmount = ethers.utils.parseUnits("5", "ether");

    console.log("ADDRESSES");
    console.log("Owner address: ", owner.address);
    console.log("User1 address: ", user1.address);
    console.log("User2 address: ", user2.address);
    return {
      ssacToken,
      owner,
      user1,
      user2,
      giftAmount,
      preMintAmount,
      mintAmount,
    };
  }

  // 1st Test
  it("should deploy and provide the owner 100 Tokens", async function () {
    const { ssacToken, owner, preMintAmount } = await loadFixture(deployToken);
    expect(await ssacToken.balanceOf(owner.address)).to.equal(preMintAmount);
  });

  // 2nd Test
  it("should allow owner to mint new token for user1", async function () {
    const { ssacToken, owner, user1, giftAmount } = await loadFixture(
      deployToken
    );
    await ssacToken.connect(owner).mint(user1.address, giftAmount);
    expect(await ssacToken.balanceOf(user1.address)).to.equal(giftAmount);
  });

  // 3nd Test
  it("should transfer 1 Token to user1", async function () {
    const { ssacToken, owner, user1, giftAmount } = await loadFixture(
      deployToken
    );
    await ssacToken.connect(owner).transfer(user1.address, giftAmount);
    expect(await ssacToken.balanceOf(user1.address)).to.equal(giftAmount);
  });

  // 4th Test
  it("should burn 1 of user1's token", async function () {
    const { ssacToken, owner, user1, mintAmount, giftAmount } =
      await loadFixture(deployToken);
    const ownerBalanceBeforeTransfer = await ssacToken.balanceOf(owner.address);

    await ssacToken.connect(owner).mint(user1.address, mintAmount);

    // User Voting giving approval to Burn 1 Token
    await ssacToken.connect(user1).approve(owner.address, giftAmount); // User approves contract to burn the token
    await ssacToken.connect(owner).burnFrom(user1.address, giftAmount); // Contract Burns token
    // await ssacToken.connect(owner).burn(giftAmount);
    expect(await ssacToken.balanceOf(user1.address)).to.changeTokenBalances(
      ssacToken,
      [owner, user1],
      [ownerBalanceBeforeTransfer, mintAmount - giftAmount]
    );
  });

  // 5th Test
  it("should successfuly transfer ownership of the token", async function () {
    // user2 will be the new owner
    const { ssacToken, owner, user2 } = await loadFixture(deployToken);

    await ssacToken.connect(owner).transferOwnership(user2.address);
    expect(await ssacToken.owner()).to.equal(user2.address);
  });
});
