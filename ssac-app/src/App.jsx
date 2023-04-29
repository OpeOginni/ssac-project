import {
  Box,
  Button,
  Grid,
  SimpleGrid,
  Heading,
  Text,
  Link,
  ButtonGroup,
  FormControl,
  FormLabel,
  Input,
  Highlight,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberDecrementStepper,
  NumberIncrementStepper,
  useToast,
  Spinner,
  Center,
} from "@chakra-ui/react";

import { Network, Alchemy } from "alchemy-sdk";
import { ArrowBackIcon, ExternalLinkIcon } from "@chakra-ui/icons";
import React, { useState, useEffect } from "react";
import { ethers, BigNumber } from "ethers";
import { getContests } from "../frontend-functions/getContests";
import { getEntries } from "../frontend-functions/getEntries";
import { getWinner } from "../frontend-functions/getContestWinner";
import { enterContest } from "../frontend-functions/enterContest";
import { isMemberCheck } from "../frontend-functions/isMember";
import { becomeMember } from "../frontend-functions/becomeMember";
import { voteEntry } from "../frontend-functions/voteEntry";
import { userHasVoted } from "../frontend-functions/hasVoted";
import { userTokenBalance } from "../frontend-functions/userTokenBalance";

const settings = {
  apiKey: "QqSZFIahqZ-ZKKwyQhjNXg2HCzQfw8-B", // Replace with your Alchemy API Key.
  network: Network.ETH_GOERLI, // Replace with your network.
};
const alchemy = new Alchemy(settings);

const App = () => {
  const [selectedContest, setSelectedContest] = useState(null);
  const [entries, setEntries] = useState([]);
  const [contests, setContests] = useState([]);
  const [winnerId, setWinnerId] = useState("");
  const [entryFormOpen, setEntryFormOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [account, setAccount] = useState();
  const [signer, setSigner] = useState();
  const [isVoting, setIsVoting] = useState(false);
  const [isEntering, setIsEntering] = useState(false);
  const [isJoining, setIsJoining] = useState(false);
  const [isMember, setIsMember] = useState(false);

  const toast = useToast();

  if (!window.ethereum) {
    return (
      <>
        <Center>
          <Heading>WEB3 Wallet needed </Heading>
        </Center>
        <Center>
          <Text>Please Install Metamask</Text>
        </Center>
      </>
    );
  }
  const provider = new ethers.providers.Web3Provider(window.ethereum);

  const getContestDetails = async (contestId) => {
    return contests.find(
      (contest) => contest.contestId.toNumber() === contestId
    );
  };

  async function vote(_contestId, _entryId, _signer) {
    setIsVoting(true);
    if (await userHasVoted(_contestId, account)) {
      toast({
        title: "Voting Error",
        description: "You can't Vote Twice",
        position: "top",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } else if (
      (await userTokenBalance(account)) < ethers.utils.parseUnits("1", "ether")
    ) {
      toast({
        title: "Not Enough Tokens To Vote",
        description: "Ask the Owner to Mint SSAC Token for your account",
        position: "top",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } else if (!(await isMember(account))) {
      toast({
        title: "Only Members Can Vote",
        description: "Join the Community as a member to Vote",
        position: "top",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } else {
      try {
        let tx = await voteEntry(_contestId, _entryId, _signer);
        await alchemy.transact.waitForTransaction(tx.hash).then();
        toast({
          title: "Success",
          description: "Your vote has been added",
          position: "top",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
        handleContestSelection(
          BigNumber.from(selectedContest.contestId).toNumber()
        );
      } catch (err) {
        toast({
          title: "Error",
          description: "There was an Error",
          position: "top",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    }
    setIsVoting(false);
  }

  async function becomeCommunityMember(_signer) {
    setIsJoining(true);
    if (await isMember(account)) {
      toast({
        title: "Error",
        description: "You are Already a Member",
        position: "top",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } else {
      try {
        await becomeMember(_signer);
        toast({
          title: "Successful",
          position: "top",
          description: "Welcome to our Community",
          status: "success",
          duration: 9000,
          isClosable: true,
        });
      } catch (err) {
        toast({
          title: "Error",
          description: "There was an error, Try again later",
          position: "top",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    }
    setIsJoining(false);
  }

  const handleContestSelection = async (contestId) => {
    const contest = await getContestDetails(contestId);
    setLoading(true);
    try {
      const contestEntries = await getEntries(contestId);
      const contestWinnerId = await getWinner(contestId);
      // const contestWinnerId = 1;
      setSelectedContest(contest);
      setEntries(contestEntries);
      setWinnerId(BigNumber.from(contestWinnerId).toNumber());
      setLoading(false);
    } catch (error) {
      setLoading(false);
      console.log(error);
      toast({
        title: "Error",
        description: "Failed to fetch contests details",
        position: "top",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    }
  };

  const createNewContestEntry = async (e) => {
    e.preventDefault();
    const entryName = document.getElementById("entryName").value;
    const regFee = document.getElementById("regFee").value;
    const NFT_Address = document.getElementById("NFT_Address").value;
    const NFT_Id = document.getElementById("NFT_Id").value;
    setIsEntering(true);

    if (regFee < ethers.utils.formatEther(selectedContest.registrationFee)) {
      toast({
        title: "Error",
        position: "top",
        description: "Registration Fee is too small",
        status: "error",
        duration: 9000,
        isClosable: true,
      });
    } else if (!(await isMember(account))) {
      toast({
        title: "Error",
        description: "You need to be a Community Member",
        position: "top",
        status: "error",
        duration: 5000,
        isClosable: true,
      });
    } else {
      try {
        await enterContest(
          BigNumber.from(selectedContest.contestId).toNumber(),
          entryName,
          NFT_Address,
          NFT_Id,
          regFee,
          signer
        );
        toast({
          title: "Successful Entry",
          position: "top",
          description: "Entry Created...Good Luck",
          status: "success",
          duration: 9000,
          isClosable: true,
        });

        handleContestSelection(
          BigNumber.from(selectedContest.contestId).toNumber()
        );
      } catch (error) {
        setLoading(false);
        console.log(error.message);
        toast({
          title: "Error",
          position: "top",
          description: "Could not Enter the Contest",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    }
    setIsEntering(false);
  };

  const handleCreateEntry = async (contestId) => {
    const contest = await getContestDetails(contestId);
    if (contest.open == true) {
      setSelectedContest(contest);
      setEntryFormOpen(true);
    } else {
      toast({
        position: "top",
        title: "Contest has Ended",
        status: "error",
        duration: 4000,
        isClosable: true,
      });
    }
  };

  const handleCancleEntry = async () => {
    setSelectedContest(null);
    setEntryFormOpen(false);
  };

  useEffect(() => {
    const fetchContests = async () => {
      setLoading(true);
      try {
        const contests = await getContests();
        setContests(contests);
        setLoading(false);
      } catch (error) {
        setLoading(false);
        console.log(error);
        toast({
          title: "Error",
          description: "Failed to fetch contests details",
          status: "error",
          duration: 9000,
          isClosable: true,
        });
      }
    };

    async function getAccounts() {
      const accounts = await provider.send("eth_requestAccounts", []);

      setAccount(accounts[0]);
      setSigner(provider.getSigner());
    }

    async function checkIsMember() {
      setIsMember(await isMemberCheck(account));
    }

    getAccounts();
    checkIsMember();
    fetchContests();
  }, [toast, account]);

  return (
    <>
      {loading ? (
        <Center margin="40">
          <Heading textAlign={"center"} margin="12">
            Fetching Data From Smart Contract
          </Heading>
          <Spinner size="xl" />
        </Center>
      ) : (
        <>
          <Box p={4}>
            {entryFormOpen ? (
              <Box>
                <Heading textAlign={"center"} margin="12">
                  Enter Contest "{selectedContest.contestName}"
                </Heading>
                <Heading as="h4" size="md" textAlign={"center"} margin="12">
                  Registration Fee Min "
                  {ethers.utils.formatEther(selectedContest.registrationFee)}{" "}
                  ETH"
                </Heading>
                <Box maxWidth={"14em"} margin="7">
                  <FormControl isRequired>
                    <FormLabel>Entry Name</FormLabel>
                    <Input
                      id="entryName"
                      placeholder="Your Entry Name"
                      margin={"1"}
                    />
                    <FormLabel>Registration Fee in ETH</FormLabel>
                    <NumberInput id="regFee" max={50} margin={"1"}>
                      <NumberInputField />
                      <NumberInputStepper>
                        <NumberIncrementStepper />
                        <NumberDecrementStepper />
                      </NumberInputStepper>
                    </NumberInput>
                    <FormLabel>NFT Address</FormLabel>
                    <Input
                      id="NFT_Address"
                      placeholder="0x12...34abcd"
                      margin={"1"}
                    />
                    <FormLabel>NFT Id</FormLabel>
                    <Input id="NFT_Id" placeholder="0" margin={"1"} />
                  </FormControl>
                  <ButtonGroup mt={4}>
                    {isEntering ? (
                      <Button size="sm" colorScheme="teal">
                        <Spinner
                          thickness="4px"
                          speed="0.65s"
                          emptyColor="gray.200"
                          color="blue.500"
                          size="sm"
                        ></Spinner>
                      </Button>
                    ) : (
                      <Button
                        size="sm"
                        colorScheme="teal"
                        type="submit"
                        onClick={(e) => createNewContestEntry(e)}
                      >
                        Submit
                      </Button>
                    )}

                    <Button
                      colorScheme="red"
                      size="sm"
                      onClick={() => handleCancleEntry()}
                    >
                      Cancel
                    </Button>
                  </ButtonGroup>
                </Box>
              </Box>
            ) : selectedContest ? (
              selectedContest.open ? (
                <Box>
                  <Heading textAlign={"center"} margin="12">
                    Entries for "{selectedContest.contestName}"
                  </Heading>
                  <SimpleGrid
                    columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
                    // templateColumns="repeat(3, 1fr)"
                    gap={6}
                  >
                    {entries.map((entry) => (
                      <Box
                        key={BigNumber.from(entry.entryId).toNumber()}
                        p={4}
                        shadow="md"
                        borderWidth="medium"
                        borderColor={"black"}
                        borderRadius="lg"
                        textAlign={"center"}
                      >
                        <Text as="b" margin="4">
                          {entry.entryTitle}
                        </Text>
                        <Text margin="4">
                          Creator Address:{" "}
                          {`${entry.entrantAddress.slice(
                            0,
                            5
                          )}...${entry.entrantAddress.slice(-4)}`}
                        </Text>
                        <Text margin="4">
                          NFT Address:{" "}
                          {`${entry.NFT_Address.slice(
                            0,
                            4
                          )}...${entry.NFT_Address.slice(-4)}`}
                        </Text>
                        <Text margin="4" as="em">
                          (Added For Tests) - No. Of Votes:{" "}
                          {BigNumber.from(entry.noOfVotes).toNumber()}
                        </Text>
                        <Text margin="4">
                          <Link
                            href={`https://testnets.opensea.io/assets/goerli/${
                              entry.NFT_Address
                            }/${BigNumber.from(entry.NFT_Id).toString()}`}
                            isExternal
                          >
                            Check out NFT
                            <ExternalLinkIcon mx="2px" />
                          </Link>
                        </Text>
                        {isVoting ? (
                          <Button colorScheme={"cyan"}>
                            <Spinner
                              thickness="4px"
                              speed="0.65s"
                              emptyColor="gray.200"
                              color="blue.500"
                              size="lg"
                            ></Spinner>
                          </Button>
                        ) : (
                          <Button
                            colorScheme={"cyan"}
                            onClick={() =>
                              vote(
                                BigNumber.from(
                                  selectedContest.contestId
                                ).toNumber(),
                                BigNumber.from(entry.entryId).toNumber(),
                                signer
                              )
                            }
                          >
                            Vote
                          </Button>
                        )}
                      </Box>
                    ))}
                  </SimpleGrid>
                  <Button
                    leftIcon={<ArrowBackIcon />}
                    onClick={() => setSelectedContest(null)}
                    margin="10"
                  >
                    Back to Contests
                  </Button>
                </Box>
              ) : (
                <Box>
                  <Heading textAlign={"center"} margin="12">
                    Entries for "{selectedContest.contestName}"
                  </Heading>
                  <SimpleGrid
                    columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
                    // templateColumns="repeat(3, 1fr)"
                    gap={6}
                  >
                    {entries.map((entry) => (
                      <Box
                        key={BigNumber.from(entry.entryId).toNumber()}
                        p={4}
                        shadow="md"
                        borderWidth="medium"
                        borderColor={"black"}
                        borderRadius="lg"
                        textAlign={"center"}
                        maxWidth={"350px"}
                      >
                        <Text as="b" margin="4">
                          {entry.entryTitle}
                        </Text>
                        <Text margin="4">
                          Creator Address:{" "}
                          {`${entry.entrantAddress.slice(
                            0,
                            4
                          )}...${entry.entrantAddress.slice(-4)}`}
                        </Text>
                        <Text margin="4">
                          NFT Address:{" "}
                          {`${entry.NFT_Address.slice(
                            0,
                            3
                          )}...${entry.NFT_Address.slice(-4)}`}
                        </Text>
                        <Text margin="4" as="em">
                          (Added For Tests) - No. Of Votes:{" "}
                          {BigNumber.from(entry.noOfVotes).toNumber()}
                        </Text>
                        <Text margin="4">
                          <Link
                            href={`https://testnets.opensea.io/assets/goerli/${
                              entry.NFT_Address
                            }/${BigNumber.from(entry.NFT_Id).toString()}`}
                            isExternal
                          >
                            Check out NFT
                            <ExternalLinkIcon mx="2px" />
                          </Link>
                        </Text>

                        {BigNumber.from(entry.entryId).toNumber() ==
                        winnerId ? (
                          <Text
                            backgroundColor={"gray"}
                            padding="1"
                            borderRadius={"lg"}
                            fontSize="25px"
                            as="em"
                            color={"gold"}
                            margin="4"
                          >
                            Winner
                          </Text>
                        ) : (
                          <Text as="b" margin="4">
                            Not Winner
                          </Text>
                        )}
                      </Box>
                    ))}
                  </SimpleGrid>
                  <Button
                    leftIcon={<ArrowBackIcon />}
                    onClick={() => setSelectedContest(null)}
                    margin="10"
                  >
                    Back to Contests
                  </Button>
                </Box>
              )
            ) : (
              <Box>
                {isMember ? (
                  <Box>
                    <Center>
                      <Text as="b">Welcome Back</Text>
                    </Center>
                  </Box>
                ) : (
                  <Box>
                    <Center>
                      <Text as="b">Become a Member</Text>
                    </Center>
                    <Center margin="3">
                      {isJoining ? (
                        <Button>
                          <Spinner
                            thickness="4px"
                            speed="0.65s"
                            emptyColor="gray.200"
                            color="blue.500"
                            size="lg"
                          ></Spinner>
                        </Button>
                      ) : (
                        <Button onClick={() => becomeCommunityMember(signer)}>
                          Join the SSAC Community
                        </Button>
                      )}
                    </Center>
                  </Box>
                )}

                <Heading textAlign={"center"} margin="12">
                  Available Contests
                </Heading>
                <SimpleGrid
                  columns={{ sm: 1, md: 2, lg: 3, xl: 4 }}
                  // templateColumns="repeat(3, 1fr)"
                  gap={6}
                >
                  {contests.map((contest) => (
                    <Box
                      key={BigNumber.from(contest.contestId).toNumber()}
                      p={8}
                      shadow="md"
                      textAlign={"center"}
                    >
                      <Text as="em" margin="4">
                        Contest ID:{" "}
                        {BigNumber.from(contest.contestId).toNumber()}
                      </Text>
                      <br></br>
                      <Text as="b" margin="4">
                        {contest.contestName}
                      </Text>
                      <Text margin="3">
                        Registration Fee:{" "}
                        {ethers.utils.formatEther(contest.registrationFee)} ETH
                      </Text>
                      <Text margin="3">
                        Current Prize Pool:{" "}
                        {ethers.utils.formatEther(contest.prizePool)} ETH
                      </Text>
                      <Text margin="3">
                        Token Reward:{" "}
                        {ethers.utils.formatEther(contest.tokenReward)} SSAC
                      </Text>

                      <Text margin="3">
                        Start Date:{" "}
                        {new Date(
                          BigNumber.from(contest.startDate).toNumber() * 1000
                        ).toLocaleDateString()}
                      </Text>

                      {contest.open ? (
                        <Text margin="4">
                          <Highlight
                            query="Contest Open"
                            styles={{
                              px: "2",
                              py: "1",
                              rounded: "full",
                              bg: "green.100",
                            }}
                          >
                            Contest Open
                          </Highlight>
                        </Text>
                      ) : (
                        <Text margin="4">
                          <Highlight
                            query="Contest Closed"
                            styles={{
                              px: "2",
                              py: "1",
                              rounded: "full",
                              bg: "red.100",
                            }}
                          >
                            Contest Closed
                          </Highlight>
                        </Text>
                      )}

                      <ButtonGroup gap="4">
                        <Button
                          colorScheme="blue"
                          size="sm"
                          onClick={() =>
                            handleContestSelection(
                              BigNumber.from(contest.contestId).toNumber()
                            )
                          }
                        >
                          View Entries
                        </Button>
                        <Button
                          colorScheme="blue"
                          size="sm"
                          onClick={() =>
                            handleCreateEntry(
                              BigNumber.from(contest.contestId).toNumber()
                            )
                          }
                        >
                          Create Entry
                        </Button>
                      </ButtonGroup>
                    </Box>
                  ))}
                </SimpleGrid>
              </Box>
            )}
          </Box>
        </>
      )}
    </>
  );
};

export default App;
