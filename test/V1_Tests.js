const { loadFixture } = require("@nomicfoundation/hardhat-network-helpers");
const { expect } = require("chai");
const { Contract } = require("ethers");
const { ethers, upgrades } = require("hardhat");
require("dotenv").config();

describe("SsacCommunityV1", function () {
  // We define a fixture to reuse the same setup in every test.
  // We use loadFixture to run this setup once, snapshot that state,
  // and reset Hardhat Network to that snapshot in every test.
  async function deployV1() {
    //Declaring needed Variables
    let preMintAmount = ethers.utils.parseUnits("100", "ether");
    let mintAmount1 = ethers.utils.parseUnits("5", "ether");
    let mintAmount2 = ethers.utils.parseUnits("2", "ether");
    let voteFee = ethers.utils.parseUnits("1", "ether");

    const [owner, user1, user2, contestant1, contestant2] =
      await ethers.getSigners();

    // Deploying the communnity contract
    const SsacCommunityV1 = await ethers.getContractFactory("SsacCommunityV1");
    const proxy = await upgrades.deployProxy(SsacCommunityV1, [voteFee]);

    const deployedTokenAddress = await proxy.getTokenAddress();

    const SSACTOKEN = await ethers.getContractFactory("SSACTOKEN");

    // Creating the Deployed Contract Interface
    const ssacToken = new Contract(
      deployedTokenAddress,
      SSACTOKEN.interface,
      owner
    );

    // contestant Creating the NFT contract
    const TestNFT = await ethers.getContractFactory("TestNFT");

    const implementationAddress =
      await upgrades.erc1967.getImplementationAddress(proxy.address);

    console.log("Proxy contract address: " + proxy.address);

    console.log("Implementation contract address: " + implementationAddress);

    console.log("Deployed SSAC Token address: " + ssacToken.address);

    console.log("####################################");
    console.log("Contract Owner address: ", await proxy.owner());

    return {
      proxy,
      ssacToken,
      owner,
      user1,
      user2,
      contestant1,
      contestant2,
      preMintAmount,
      mintAmount1,
      mintAmount2,
      voteFee,
      TestNFT,
    };
  }

  // 1st Test
  it("should deploy the proxy properly and mint 100 tokens for the contract", async function () {
    const { proxy, ssacToken, preMintAmount } = await loadFixture(deployV1);
    expect(await ssacToken.balanceOf(proxy.address)).to.equal(preMintAmount);
  });

  // 2nd Test
  it("should mint 5 tokens for user", async function () {
    const { proxy, ssacToken, user1, mintAmount1 } = await loadFixture(
      deployV1
    );
    await proxy.mintToken(user1.address, mintAmount1);
    expect(await ssacToken.balanceOf(user1.address)).to.equal(mintAmount1);
  });

  // 3rd Test
  it("should allow only members to vote", async function () {
    const { proxy, user1 } = await loadFixture(deployV1);
    expect(proxy.connect(user1).vote(1, 1)).to.be.reverted;
  });

  // 4th Test
  it("should create contest with ID of 0 after creating a contest", async function () {
    const { proxy, owner } = await loadFixture(deployV1);
    const registrationFee = ethers.utils.parseUnits("10", "ether");
    const tokenReward = ethers.utils.parseUnits("5", "ether");
    await proxy.createContest("First Contest", registrationFee, tokenReward); // Contest will be given an ID of 0
    // await proxy.createContest("Second Contest", registrationFee, tokenReward); // Contest will be given an ID of 1
    // await proxy.createContest("Third Contest", registrationFee, tokenReward); // Contest will be given an ID of 2

    expect(await proxy.isContest(0)).to.equal(true);
  });

  // 5th Test
  it("should allow user with sufficient token amount to vote for an existing entry in an existing contest", async function () {
    const { proxy, owner, user1, contestant1, TestNFT, mintAmount1 } =
      await loadFixture(deployV1);
    const registrationFee = ethers.utils.parseUnits("10", "ether");
    const tokenReward = ethers.utils.parseUnits("5", "ether");

    // Owner of Contract creates a Contest
    await proxy.createContest("First Contest", registrationFee, tokenReward); // Contest will be given an ID of 0

    // Contestant Creates NFT
    const testNFTAddess = (await TestNFT.connect(contestant1).deploy()).address;

    await proxy.connect(contestant1).addMember(); // Contestant registers as a member
    await proxy.connect(contestant1).createEntry(0, "My Entry", testNFTAddess, {
      value: registrationFee,
    }); // Contestant Enters contest with an Entry ID of 1

    await proxy.connect(user1).addMember(); // Voter registers as a member
    await proxy.mintToken(user1.address, mintAmount1); // Voter gers minted token
    await proxy.connect(user1).vote(0, 1); // Voter votes for First Entry of First Contest
    expect(await proxy.getNoOfVotes(0, 1)).to.equal(1);
  });

  // 6th Test
  it("should deposit registration fee to Contract after Entry is created", async function () {
    const { proxy, owner, user1, contestant1, TestNFT, mintAmount1 } =
      await loadFixture(deployV1);
    const registrationFee = ethers.utils.parseUnits("10", "ether");
    const tokenReward = ethers.utils.parseUnits("5", "ether");

    // Onwer of Contract creates a Contest
    await proxy.createContest("First Contest", registrationFee, tokenReward); // Contest will be given an ID of 0

    // Contestant Creates NFT
    const testNFTAddess = (await TestNFT.connect(contestant1).deploy()).address;

    await proxy.connect(contestant1).addMember(); // Contestant registers as a member
    await proxy.connect(contestant1).createEntry(0, "My Entry", testNFTAddess, {
      value: registrationFee,
    });

    expect(await ethers.provider.getBalance(proxy.address)).to.equal(
      registrationFee
    );
  });

  // 7th Test
  it("should not allow user to vote twice", async function () {
    const { proxy, user1, contestant1, TestNFT, mintAmount1 } =
      await loadFixture(deployV1);
    const registrationFee = ethers.utils.parseUnits("10", "ether");
    const tokenReward = ethers.utils.parseUnits("5", "ether");

    // Owner of Contract Creates a contest
    await proxy.createContest("First Contest", registrationFee, tokenReward); // Contest will be given an ID of 0

    // Contestant Creates NFT
    const testNFTAddess = (await TestNFT.connect(contestant1).deploy()).address;

    await proxy.connect(contestant1).addMember(); // Contestant registers as a member
    await proxy.connect(contestant1).createEntry(0, "My Entry", testNFTAddess, {
      value: registrationFee,
    }); // Contestant Enters contest with an Entry ID of 1

    await proxy.connect(user1).addMember(); // Voter registers as a member
    await proxy.mintToken(user1.address, mintAmount1); // Voter gers minted token
    await proxy.connect(user1).vote(0, 1); // Voter votes for First Entry of First Contest
    expect(proxy.connect(user1).vote(0, 1)).to.be.reverted;
  });

  // 8th Test
  it("should burn voters token after voting", async function () {
    const {
      proxy,
      ssacToken,
      user1,
      contestant1,
      TestNFT,
      mintAmount1,
      voteFee,
    } = await loadFixture(deployV1);
    const registrationFee = ethers.utils.parseUnits("10", "ether");
    const tokenReward = ethers.utils.parseUnits("5", "ether");

    // Owner of Contract creates a Contest
    await proxy.createContest("First Contest", registrationFee, tokenReward); // Contest will be given an ID of 0

    // Contestant Creates NFT
    const testNFTAddess = (await TestNFT.connect(contestant1).deploy()).address;

    await proxy.connect(contestant1).addMember(); // Contestant registers as a member
    await proxy.connect(contestant1).createEntry(0, "My Entry", testNFTAddess, {
      value: registrationFee,
    }); // Contestant Enters contest with an Entry ID of 1

    // Voter registers as a member
    await proxy.connect(user1).addMember();
    await proxy.mintToken(user1.address, mintAmount1); // Voter gers minted token
    await proxy.connect(user1).vote(0, 1); // Voter votes for First Entry of First Contest

    expect(await ssacToken.balanceOf(user1.address)).to.equal(
      ethers.utils.parseUnits("4", "ether")
    );
  });

  // 9th Test
  it("should increase the contest price pool when 2 entrants register", async function () {
    const { proxy, contestant1, contestant2, TestNFT } = await loadFixture(
      deployV1
    );
    const registrationFee = ethers.utils.parseUnits("10", "ether");
    const totalPrizePool = ethers.utils.parseUnits("20", "ether"); // 10ETH + 10ETH
    const tokenReward = ethers.utils.parseUnits("5", "ether");

    // Owner of Contract Creates a Contest
    await proxy.createContest("First Contest", registrationFee, tokenReward); // Contest will be given an ID of 0

    // Contestant1 Creates NFT to enter the Contest
    const testNFTAddess1 = (await TestNFT.connect(contestant1).deploy())
      .address;

    // Contestant1 registers as a member
    await proxy.connect(contestant1).addMember();
    await proxy
      .connect(contestant1)
      .createEntry(0, "My Entry", testNFTAddess1, {
        value: registrationFee,
      }); // Contestant Enters contest (ID 0) with an Entry ID of 1

    // Contestant2 Creates NFT to enter the Contest
    const testNFTAddess2 = (await TestNFT.connect(contestant2).deploy())
      .address;

    // Contestant2 registers as a member
    await proxy.connect(contestant2).addMember();
    await proxy
      .connect(contestant2)
      .createEntry(0, "My Entry", testNFTAddess2, {
        value: registrationFee,
      }); // Contestant Enters contest (ID 0) with an Entry ID of 2

    expect(await proxy.getContestPrizePool(0)).to.equal(totalPrizePool);
  });

  // 10th Test
  it("should make the voteCount of the second contestant to be 2", async function () {
    const {
      proxy,
      user1,
      user2,
      contestant1,
      contestant2,
      TestNFT,
      mintAmount1,
    } = await loadFixture(deployV1);
    const registrationFee = ethers.utils.parseUnits("10", "ether");
    const tokenReward = ethers.utils.parseUnits("5", "ether");

    // Owner of Contract Creates a Contest
    await proxy.createContest("First Contest", registrationFee, tokenReward); // Contest will be given an ID of 0

    // Contestant1 Creates NFT to enter the Contest
    const testNFTAddess1 = (await TestNFT.connect(contestant1).deploy())
      .address;

    // Contestant1 registers as a member
    await proxy.connect(contestant1).addMember();
    await proxy
      .connect(contestant1)
      .createEntry(0, "My Entry", testNFTAddess1, {
        value: registrationFee,
      }); // Contestant Enters contest (ID 0) with an Entry ID of 1

    // Contestant2 Creates NFT to enter the Contest
    const testNFTAddess2 = (await TestNFT.connect(contestant2).deploy())
      .address;

    // Contestant2 registers as a member
    await proxy.connect(contestant2).addMember();
    await proxy
      .connect(contestant2)
      .createEntry(0, "My Entry", testNFTAddess2, {
        value: registrationFee,
      }); // Contestant Enters contest (ID 0) with an Entry ID of 2

    // Voter1 registers as a member and votes for the second contestant
    await proxy.connect(user1).addMember();
    await proxy.mintToken(user1.address, mintAmount1); // Voter gers minted token
    await proxy.connect(user1).vote(0, 2); // Voter1 votes for Second Entry(ID 2) of First Contest(ID 0)

    // Voter2 registers as a member and votes for the second contestant
    await proxy.connect(user2).addMember();
    await proxy.mintToken(user2.address, mintAmount1); // Voter gers minted token
    await proxy.connect(user2).vote(0, 2); // Voter2 votes for Second Entry(ID 2) of First Contest(ID 0)

    expect(await proxy.getNoOfVotes(0, 2)).to.equal(2);
  });

  // 11th Test
  it("should return the 2nd entry ID(2) as the winner", async function () {
    const {
      proxy,
      user1,
      user2,
      contestant1,
      contestant2,
      TestNFT,
      mintAmount1,
    } = await loadFixture(deployV1);
    const registrationFee = ethers.utils.parseUnits("10", "ether");
    const tokenReward = ethers.utils.parseUnits("5", "ether");

    // Owner of Contract Creates a Contest
    await proxy.createContest("First Contest", registrationFee, tokenReward); // Contest will be given an ID of 0

    // Contestant1 Creates NFT to enter the Contest
    const testNFTAddess1 = (await TestNFT.connect(contestant1).deploy())
      .address;

    // Contestant1 registers as a member
    await proxy.connect(contestant1).addMember();
    await proxy
      .connect(contestant1)
      .createEntry(0, "My Entry", testNFTAddess1, {
        value: registrationFee,
      }); // Contestant Enters contest (ID 0) with an Entry ID of 1

    // Contestant2 Creates NFT to enter the Contest
    const testNFTAddess2 = (await TestNFT.connect(contestant2).deploy())
      .address;

    // Contestant2 registers as a member
    await proxy.connect(contestant2).addMember();
    await proxy
      .connect(contestant2)
      .createEntry(0, "My Entry", testNFTAddess2, {
        value: registrationFee,
      }); // Contestant Enters contest (ID 0) with an Entry ID of 2

    // Voter1 registers as a member and votes for the second contestant
    await proxy.connect(user1).addMember();
    await proxy.mintToken(user1.address, mintAmount1); // Voter gers minted token
    await proxy.connect(user1).vote(0, 2); // Voter1 votes for Second Entry(ID 2) of First Contest(ID 0)

    // Voter2 registers as a member and votes for the second contestant
    await proxy.connect(user2).addMember();
    await proxy.mintToken(user2.address, mintAmount1); // Voter gers minted token
    await proxy.connect(user2).vote(0, 2); // Voter2 votes for Second Entry(ID 2) of First Contest(ID 0)

    expect(await proxy.getEntryWithHighestVote(0)).to.equal(2);
  });

  // 12th Test
  it("should send the winner (contestant2) the ETH prize pool", async function () {
    const {
      proxy,
      user1,
      user2,
      contestant1,
      contestant2,
      TestNFT,
      mintAmount1,
    } = await loadFixture(deployV1);
    const registrationFee = ethers.utils.parseUnits("10", "ether");
    const tokenReward = ethers.utils.parseUnits("5", "ether");

    // Owner of Contract Creates a Contest
    await proxy.createContest("First Contest", registrationFee, tokenReward); // Contest will be given an ID of 0

    // Contestant1 Creates NFT to enter the Contest
    const testNFTAddess1 = (await TestNFT.connect(contestant1).deploy())
      .address;

    // Contestant1 registers as a member
    await proxy.connect(contestant1).addMember();
    await proxy
      .connect(contestant1)
      .createEntry(0, "My Entry", testNFTAddess1, {
        value: registrationFee,
      }); // Contestant Enters contest (ID 0) with an Entry ID of 1

    // Contestant2 Creates NFT to enter the Contest
    const testNFTAddess2 = (await TestNFT.connect(contestant2).deploy())
      .address;

    // Contestant2 registers as a member
    await proxy.connect(contestant2).addMember();
    await proxy
      .connect(contestant2)
      .createEntry(0, "My Entry", testNFTAddess2, {
        value: registrationFee,
      }); // Contestant Enters contest (ID 0) with an Entry ID of 2

    // Voter1 registers as a member and votes for the second contestant
    await proxy.connect(user1).addMember();
    await proxy.mintToken(user1.address, mintAmount1); // Voter gers minted token
    await proxy.connect(user1).vote(0, 2); // Voter1 votes for Second Entry(ID 2) of First Contest(ID 0)

    // Voter2 registers as a member and votes for the second contestant
    await proxy.connect(user2).addMember();
    await proxy.mintToken(user2.address, mintAmount1); // Voter gers minted token
    await proxy.connect(user2).vote(0, 2); // Voter2 votes for Second Entry(ID 2) of First Contest(ID 0)

    // Get the prize pool of the contest
    const contestPrizePool = await proxy.getContestPrizePool(0);

    // Owner/Chainlink VRF ends the Contest
    await proxy.endContest(0); // Ending the First Contest (ID 0)
    expect(await ethers.provider.getBalance(proxy.address)).to.equal(0);
  });

  // 12th Test
  it("should mint the winner (contestant2) the SSAC TOKEN Reward", async function () {
    const {
      proxy,
      user1,
      user2,
      contestant1,
      contestant2,
      TestNFT,
      ssacToken,
      mintAmount1,
    } = await loadFixture(deployV1);
    const registrationFee = ethers.utils.parseUnits("10", "ether");
    const tokenReward = ethers.utils.parseUnits("5", "ether");

    // Owner of Contract Creates a Contest
    await proxy.createContest("First Contest", registrationFee, tokenReward); // Contest will be given an ID of 0

    // Contestant1 Creates NFT to enter the Contest
    const testNFTAddess1 = (await TestNFT.connect(contestant1).deploy())
      .address;

    // Contestant1 registers as a member
    await proxy.connect(contestant1).addMember();
    await proxy
      .connect(contestant1)
      .createEntry(0, "My Entry", testNFTAddess1, {
        value: registrationFee,
      }); // Contestant Enters contest (ID 0) with an Entry ID of 1

    // Contestant2 Creates NFT to enter the Contest
    const testNFTAddess2 = (await TestNFT.connect(contestant2).deploy())
      .address;

    // Contestant2 registers as a member
    await proxy.connect(contestant2).addMember();
    await proxy
      .connect(contestant2)
      .createEntry(0, "My Entry", testNFTAddess2, {
        value: registrationFee,
      }); // Contestant Enters contest (ID 0) with an Entry ID of 2

    // Voter1 registers as a member and votes for the second contestant
    await proxy.connect(user1).addMember();
    await proxy.mintToken(user1.address, mintAmount1); // Voter gers minted token
    await proxy.connect(user1).vote(0, 2); // Voter1 votes for Second Entry(ID 2) of First Contest(ID 0)

    // Voter2 registers as a member and votes for the second contestant
    await proxy.connect(user2).addMember();
    await proxy.mintToken(user2.address, mintAmount1); // Voter gers minted token
    await proxy.connect(user2).vote(0, 2); // Voter2 votes for Second Entry(ID 2) of First Contest(ID 0)

    // Get the prize pool of the contest
    const previousContestantTokenBalance = await ssacToken.balanceOf(
      contestant2.address
    );

    // Owner/Chainlink VRF ends the Contest
    await proxy.endContest(0); // Ending the First Contest (ID 0)
    expect(await ssacToken.balanceOf(contestant2.address)).to.equal(
      previousContestantTokenBalance + tokenReward
    );
  });

  // 12th Test
  it("should prevent new entries for a closed contest", async function () {
    const {
      proxy,
      user1,
      user2,
      contestant1,
      contestant2,
      TestNFT,
      ssacToken,
      mintAmount1,
    } = await loadFixture(deployV1);
    const registrationFee = ethers.utils.parseUnits("10", "ether");
    const tokenReward = ethers.utils.parseUnits("5", "ether");

    // Owner of Contract Creates a Contest
    await proxy.createContest("First Contest", registrationFee, tokenReward); // Contest will be given an ID of 0

    // Contestant1 Creates NFT to enter the Contest
    const testNFTAddess1 = (await TestNFT.connect(contestant1).deploy())
      .address;

    // Contestant1 registers as a member
    await proxy.connect(contestant1).addMember();
    await proxy
      .connect(contestant1)
      .createEntry(0, "My Entry", testNFTAddess1, {
        value: registrationFee,
      }); // Contestant Enters contest (ID 0) with an Entry ID of 1

    // Contestant2 Creates NFT to enter the Contest
    const testNFTAddess2 = (await TestNFT.connect(contestant2).deploy())
      .address;

    // Contestant2 registers as a member
    await proxy.connect(contestant2).addMember();
    await proxy
      .connect(contestant2)
      .createEntry(0, "My Entry", testNFTAddess2, {
        value: registrationFee,
      }); // Contestant Enters contest (ID 0) with an Entry ID of 2

    // Voter1 registers as a member and votes for the second contestant
    await proxy.connect(user1).addMember();
    await proxy.mintToken(user1.address, mintAmount1); // Voter gers minted token
    await proxy.connect(user1).vote(0, 2); // Voter1 votes for Second Entry(ID 2) of First Contest(ID 0)

    // Voter2 registers as a member and votes for the second contestant
    await proxy.connect(user2).addMember();
    await proxy.mintToken(user2.address, mintAmount1); // Voter gers minted token
    await proxy.connect(user2).vote(0, 2); // Voter2 votes for Second Entry(ID 2) of First Contest(ID 0)

    // Owner/Chainlink VRF ends the Contest
    await proxy.endContest(0); // Ending the First Contest (ID 0)

    // Late user creates an NFT
    const testNFTAddess3 = (await TestNFT.connect(user1).deploy()).address;
    // Tries to enter contest when it has ended
    expect(
      proxy.connect(user1).createEntry(0, "My Entry", testNFTAddess3, {
        value: registrationFee,
      })
    ).to.be.reverted;
  });
});
