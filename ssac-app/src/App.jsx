import {
  Box,
  Button,
  Grid,
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
} from "@chakra-ui/react";

import { ArrowBackIcon, ExternalLinkIcon } from "@chakra-ui/icons";
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
    open: true,
  },
  {
    id: 2,
    name: "Best Portrait Drawing",
    registrationFee: "0.05 ETH",
    tokenReward: "2 ETH",
    open: false,
  },
  {
    id: 3,
    name: "Best Sculpture",
    registrationFee: "0.2 ETH",
    tokenReward: "10 ETH",
    open: true,
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
  const toast = useToast();

  const handleContestSelection = async (contestId) => {
    const contest = await getContestDetails(contestId);
    const contestEntries = await getContestEntries(contestId);
    setSelectedContest(contest);
    setEntries(contestEntries);
  };

  const handleCreateEntry = async (contestId) => {
    const contest = await getContestDetails(contestId);

    if (contest.id == true) {
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

  return (
    <Box p={4}>
      {entryFormOpen ? (
        <Box>
          <Heading textAlign={"center"} margin="12">
            Enter Contest "{selectedContest.name}"
          </Heading>
          <Heading as="h4" size="md" textAlign={"center"} margin="12">
            Registration Fee Min "{selectedContest.registrationFee}"
          </Heading>
          <Box maxWidth={"14em"} margin="7">
            <FormControl isRequired>
              <FormLabel>Entry Name</FormLabel>
              <Input placeholder="Your Entry Name" margin={"1"} />
              <FormLabel>Registration Fee in ETH</FormLabel>
              <NumberInput max={50} min={10} margin={"1"}>
                <NumberInputField />
                <NumberInputStepper>
                  <NumberIncrementStepper />
                  <NumberDecrementStepper />
                </NumberInputStepper>
              </NumberInput>
              <FormLabel>NFT Address</FormLabel>
              <Input placeholder="0x1234abcd" margin={"1"} />
            </FormControl>
            <ButtonGroup mt={4}>
              <Button size="sm" colorScheme="teal" type="submit">
                Submit
              </Button>
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
        <Box>
          <Heading textAlign={"center"} margin="12">
            Entries for "{selectedContest.name}"
          </Heading>
          <Grid templateColumns="repeat(3, 1fr)" gap={6}>
            {entries.map((entry) => (
              <Box
                key={entry.id}
                p={4}
                shadow="md"
                borderWidth="medium"
                borderColor={"black"}
                borderRadius="lg"
                textAlign={"center"}
              >
                <Text margin="4">
                  Registration Fee: {entry.registrationFee}
                </Text>
                <Text as="b" margin="4">
                  {entry.name}
                </Text>
                <Text margin="4">NFT Address: {entry.nftAddress}</Text>
                <Text margin="4">
                  <Link href="https://chakra-ui.com" isExternal>
                    Check out NFT
                    <ExternalLinkIcon mx="2px" />
                  </Link>
                </Text>
                <Button colorScheme={"cyan"}>Vote</Button>
              </Box>
            ))}
          </Grid>
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
            Available Contests
          </Heading>
          <Grid templateColumns="repeat(3, 1fr)" gap={6}>
            {testContests.map((contest) => (
              <Box key={contest.id} p={8} shadow="md" textAlign={"center"}>
                <Text as="b" margin="4">
                  {contest.name}
                </Text>
                <Text margin="4">
                  Registration Fee: {contest.registrationFee}
                </Text>
                <Text margin="4">Token Reward: {contest.tokenReward}</Text>
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
                    onClick={() => handleContestSelection(contest.id)}
                  >
                    View Entries
                  </Button>
                  <Button
                    colorScheme="blue"
                    size="sm"
                    onClick={() => handleCreateEntry(contest.id)}
                  >
                    Create Entry
                  </Button>
                </ButtonGroup>
              </Box>
            ))}
          </Grid>
        </Box>
      )}
    </Box>
  );
};

export default App;
