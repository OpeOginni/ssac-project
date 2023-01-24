// SPDX-License-Identifier: MIT
pragma solidity 0.8.17;

import "@openzeppelin/contracts-upgradeable/proxy/utils/Initializable.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/token/ERC20/extensions/ERC20Burnable.sol";
import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

contract SsacCommunityV1 is Initializable, Ownable {
    address public SSACToken;
    address[] public members;
    uint256 currentEntryId = 1;
    uint256 currentContestId = 1;
    uint256 votingCost = 1 * (10 ** 18);

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

    mapping(uint256 => Contest) public contests; // Maps an ID to a particular Contest
    mapping(uint256 => mapping(uint256 => Entry)) public entries; // Maps an ID of a contest to the ID of a particular Entry in that Contest
    mapping(uint256 => Entry[]) public contestEntries; // Stores all the Entries for a particular contestId
    mapping(uint256 => address[]) public contestVoters; // Stores a array of votes for a particular contestId

    function initialize(address _ssacTokenAddress) public initializer {
        SSACToken = _ssacTokenAddress;
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
        contests[currentContestId] = Contest(
            currentContestId,
            _name,
            _registrationFee,
            _tokenReward,
            block.timestamp,
            true
        );

        currentContestId += 1;
    }

    function createEntry(
        uint256 _contestId,
        string calldata _title,
        address _NFT_Address
    ) external payable {
        Contest memory presentContest = getContest(_contestId);

        require(presentContest.open == true, "Contest is over");
        require(
            msg.value >= presentContest.registrationFee,
            "Insuficient Registration Fee"
        );

        entries[_contestId][currentEntryId] = Entry(
            currentEntryId,
            _title,
            msg.sender,
            _NFT_Address,
            0
        );

        currentEntryId += 1;
    }

    function vote(uint256 _contestId, uint256 _entryId) external {
        require(
            IERC20(SSACToken).balanceOf(msg.sender) > votingCost,
            "Insufficient Token amount"
        ); // 1 Token is needed to Vote
        require(
            hasVoted(_contestId, msg.sender) == false,
            "Address has already Voted"
        );
        ERC20Burnable(SSACToken).burn(votingCost);
        Entry memory _entry = getEntry(_contestId, _entryId);
        _entry.noOfVotes += 1;
    }

    function getNoOfVotes(
        uint256 _contestId,
        uint256 _entryId
    ) public view returns (uint256) {
        Entry memory _entry = getEntry(_contestId, _entryId);

        return _entry.noOfVotes;
    }

    function getEntry(
        uint256 _contestId,
        uint256 _entryId
    ) public view returns (Entry memory) {
        return entries[_contestId][_entryId];
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
}
