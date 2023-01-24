// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "./SsacToken.sol";

contract SsacCommunityV1 is Initializable {
    SSACTOKEN private ssacToken;
    address[] public members;
    address public owner;
    uint256 currentContestId;
    uint256 votingCost;

    // Entry Struct that represnts an entry to a contest
    struct Entry {
        uint256 entryId;
        string entryTitle;
        address entrantAddress;
        address NFT_Address;
        uint256 noOfVotes;
    }

    struct Contest {
        uint256 contestId;
        string contestName;
        uint256 registrationFee; // Fee will be in ETH
        uint256 tokenReward; // Rewards will be partially in ETH and SSAC Token
        uint256 startDate;
        bool open; // If the contest is still ongoing
    }

    Contest[] public contests;
    // mapping(uint256 => Contest) public contests; // Maps an ID to a particular Contest
    mapping(uint256 => mapping(uint256 => Entry)) public entries; // Maps an ID of a contest to the ID of a particular Entry in that Contest
    mapping(uint256 => uint256) public noOfEntries; // Maps a ContestId to the number of entries
    mapping(uint256 => address[]) public contestVoters; // Stores a array of votes for a particular contestId

    function initialize(uint256 _votingCost) public initializer {
        ssacToken = new SSACTOKEN();
        currentContestId = currentContestId;
        votingCost = _votingCost;
        owner = msg.sender;
    }

    function mintToken(address _to, uint256 _amount) public onlyOwner {
        ssacToken.mint(_to, _amount);
    }

    function addMember() public {
        require(isMember(msg.sender) == false);
        members.push(msg.sender);
    }

    function createContest(
        string calldata _name,
        uint256 _registrationFee,
        uint256 _tokenReward
    ) external onlyOwner {
        contests.push(
            Contest(
                currentContestId,
                _name,
                _registrationFee,
                _tokenReward,
                block.timestamp,
                true
            )
        );
        noOfEntries[currentContestId] = 0;

        currentContestId += 1;
    }

    function createEntry(
        uint256 _contestId,
        string calldata _title,
        address _NFT_Address
    ) external payable {
        Contest memory presentContest = getContest(_contestId);
        require(isMember(msg.sender), "Only members can create an Entry");
        require(isContest(_contestId), "Contest is closed or does not exist"); // To make sure that the contest is open/exists
        require(
            msg.value >= presentContest.registrationFee,
            "Insuficient Registration Fee"
        );

        noOfEntries[currentContestId] += 1;

        uint256 currentEntryId = noOfEntries[currentContestId]; // This gets the ID for the particulat Entry

        entries[_contestId][currentEntryId] = Entry(
            currentEntryId,
            _title,
            msg.sender,
            _NFT_Address,
            0
        );
    }

    function vote(uint256 _contestId, uint256 _entryId) external {
        require(
            isContest(_contestId) == true,
            "Contest doesn't exist or is over"
        ); // To make sure that the contest is open/exists
        require(isEntry(_contestId, _entryId) == true, "Entry doesn't exist"); // To make sure that the entry exists
        require(isMember(msg.sender), "Only members can vote");
        require(
            ssacToken.balanceOf(msg.sender) > votingCost,
            "Insufficient Token amount"
        ); // 1 Token is needed to Vote
        require(
            hasVoted(_contestId, msg.sender) == false,
            "Address has already Voted"
        );
        ssacToken.burnFrom(msg.sender, votingCost); // Works
        contestVoters[_contestId].push(msg.sender);

        entries[_contestId][_entryId].noOfVotes += 1;
    }

    function getEntry(
        uint256 _contestId,
        uint256 _entryId
    ) public view returns (Entry memory) {
        require(isEntry(_contestId, _entryId) == true, "entry not found");
        return entries[_contestId][_entryId];
    }

    function getNoOfVotes(
        uint256 _contestId,
        uint256 _entryId
    ) public view returns (uint256) {
        Entry memory _entry = getEntry(_contestId, _entryId);

        return _entry.noOfVotes;
    }

    function getContest(
        uint256 _contestId
    ) public view returns (Contest memory) {
        return contests[_contestId];
    }

    function isMember(address _addr) public view returns (bool) {
        for (uint i; i < members.length; i++) {
            if (members[i] == _addr) {
                return true;
            }
        }
        return false;
    }

    function hasVoted(
        uint _contestId,
        address _addr
    ) public view returns (bool) {
        for (uint i; i < contestVoters[_contestId].length; i++) {
            if (contestVoters[_contestId][i] == _addr) {
                return true;
            }
        }
        return false;
    }

    function getTokenAddress() public view returns (address) {
        return address(ssacToken);
    }

    modifier onlyOwner() {
        require(msg.sender == owner);

        _;
    }

    function isContest(uint256 _contestId) public view returns (bool) {
        if (contests[_contestId].open == true) {
            return true;
        }
        return false;
    }

    function isEntry(
        uint256 _contestId,
        uint256 _entryId
    ) public view returns (bool) {
        require(isContest(_contestId));
        if (entries[_contestId][_entryId].entryId > 0) {
            return true;
        }
        return false;
    }
}
