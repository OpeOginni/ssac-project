import { Box, Button, Grid, Heading, Text } from "@chakra-ui/react";
import React, { useState } from "react";

const getContestDetails = async (contestId) => {
  return testContests.find((contest) => contest.id === contestId);
};

const getContestEntries = async (contestId) => {
  return testEntries.filter((entry) => entry.contestId === contestId);
};

const testContests = [
  {
    id: 1,
    name: "Best Landscape Painting",
    registrationFee: "0.1 ETH",
    tokenReward: "5 ETH",
  },
  {
    id: 2,
    name: "Best Portrait Drawing",
    registrationFee: "0.05 ETH",
    tokenReward: "2 ETH",
  },
  {
    id: 3,
    name: "Best Sculpture",
    registrationFee: "0.2 ETH",
    tokenReward: "10 ETH",
  },
];

const testEntries = [
  {
    id: 1,
    contestId: 1,
    name: "Mountain Vista",
    registrationFee: "0.05 ETH",
    nftAddress: "0x1234abcd",
  },
  {
    id: 2,
    contestId: 1,
    name: "Desert Sunrise",
    registrationFee: "0.1 ETH",
    nftAddress: "0x2345bcde",
  },
  {
    id: 3,
    contestId: 2,
    name: "Self Portrait",
    registrationFee: "0.05 ETH",
    nftAddress: "0x3456cdef",
  },
  {
    id: 4,
    contestId: 2,
    name: "Friend Portrait",
    registrationFee: "0.05 ETH",
    nftAddress: "0x4567defg",
  },
  {
    id: 5,
    contestId: 3,
    name: "Bird Sculpture",
    registrationFee: "0.2 ETH",
    nftAddress: "0x5678efgh",
  },
  {
    id: 6,
    contestId: 3,
    name: "Tree Sculpture",
    registrationFee: "0.2 ETH",
    nftAddress: "0x6789fghi",
  },
];

const App = () => {
  const [selectedContest, setSelectedContest] = useState(null);
  const [entries, setEntries] = useState([]);
  const [entryFormOpen, setEntryFormOpen] = useState(false);

  const handleContestSelection = async (contestId) => {
    const contest = await getContestDetails(contestId);
    const contestEntries = await getContestEntries(contestId);
    setSelectedContest(contest);
    setEntries(contestEntries);
  };

  const handleCreateEntry = async (contestId) => {
    const contest = await getContestDetails(contestId);
    setSelectedContest(contest);
    setEntryFormOpen(true);
  };

  const handleCancleEntry = async () => {
    setSelectedContest(null);
    setEntryFormOpen(false);
  };

  return (
    <Box p={4}>
      {entryFormOpen ? (
        <Box>
          <Heading>Enter Contest "{selectedContest.name}"</Heading>
          <form>
            <label htmlFor="entryName">
              Entry Name:
              <input type="text" id="entryName" name="entryName" />
            </label>
            <br />
            <label htmlFor="registrationFee">
              Registration Fee:
              <input
                type="number"
                id="registrationFee"
                name="registrationFee"
              />
            </label>
            <br />
            <label htmlFor="nftAddress">
              NFT Address:
              <input type="text" id="nftAddress" name="nftAddress" />
            </label>
            <br />
            <Button type="submit">Submit Entry</Button>
            <Button onClick={() => handleCancleEntry()}>Cancel</Button>
          </form>
        </Box>
      ) : selectedContest ? (
        <Box>
          <Heading>Entries for "{selectedContest.name}"</Heading>
          <Grid templateColumns="repeat(3, 1fr)" gap={6}>
            {entries.map((entry) => (
              <Box key={entry.id} p={4} shadow="md" borderWidth="1px">
                <Text>{entry.name}</Text>
                <Text>Registration Fee: {entry.registrationFee}</Text>
                <Text>NFT Address: {entry.nftAddress}</Text>
                <Button>Vote</Button>
              </Box>
            ))}
          </Grid>
          <Button onClick={() => setSelectedContest(null)}>
            Back to Contests
          </Button>
        </Box>
      ) : (
        <Box>
          <Heading>Available Contests</Heading>
          <Grid templateColumns="repeat(3, 1fr)" gap={6}>
            {testContests.map((contest) => (
              <Box key={contest.id} p={4} shadow="md" borderWidth="1px">
                <Text>{contest.name}</Text>
                <Text>Registration Fee: {contest.registrationFee}</Text>
                <Text>Token Reward: {contest.tokenReward}</Text>
                <Button onClick={() => handleContestSelection(contest.id)}>
                  View Entries
                </Button>
                <Button onClick={() => handleCreateEntry(contest.id)}>
                  Create Entry
                </Button>
              </Box>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default App;
