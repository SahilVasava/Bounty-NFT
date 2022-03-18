// SPDX-License-Identifier: MIT
pragma solidity ^0.8.4;

import "@openzeppelin/contracts/token/ERC1155/ERC1155.sol";
import "@openzeppelin/contracts/access/Ownable.sol";
import "@openzeppelin/contracts/utils/Counters.sol";
import "@openzeppelin/contracts/utils/cryptography/draft-EIP712.sol";
import "@openzeppelin/contracts/utils/cryptography/ECDSA.sol";
import "hardhat/console.sol";

contract BountyNFT is ERC1155, EIP712, Ownable {
    using Counters for Counters.Counter;

    Counters.Counter private _tokenIdCounter;

    enum Status {
        Open,
        Hunted
    }
    struct Bounty {
        uint256 id;
        uint256 rewardInWei;
        string title;
        address hunter;
        Status status;
        uint256 claimedAt;
    }

    event BountyNFTCreated(
        uint256 id,
        uint256 rewardInWei,
        string title,
        address hunter,
        Status status,
        uint256 claimedAt
    );

    event BountyNFTBatchCreated(
        uint256[] ids,
        uint256[] rewardsInWei,
        string[] titles,
        address[] hunters,
        Status[] statuses,
        uint256[] claimedAts
    );

    constructor() ERC1155("") EIP712("BountyNFT", "1.0.0") {}

    mapping(uint256 => string) private _uris;
    mapping(uint256 => Bounty) public bounties;

    function uri(uint256 tokenId) public view override returns (string memory) {
        return (_uris[tokenId]);
    }

    function setTokenUri(uint256 tokenId, string memory _uri) public onlyOwner {
        require(bytes(_uris[tokenId]).length == 0, "Cannot set uri twice");
        _uris[tokenId] = _uri;
    }

    function createBountyNFT(
        uint256 rewardInWei,
        string memory title,
        string memory _uri
    ) public {
        uint256 tokenId = _tokenIdCounter.current();
        _tokenIdCounter.increment();
        Bounty memory bounty = Bounty(
            tokenId,
            rewardInWei,
            title,
            msg.sender,
            Status.Open,
            0
        );
        setTokenUri(tokenId, _uri);
        bounties[tokenId] = bounty;
        emit BountyNFTCreated(
            tokenId,
            bounty.rewardInWei,
            bounty.title,
            bounty.hunter,
            bounty.status,
            bounty.claimedAt
        );
    }

    function createBountyNFTBatch(
        uint256[] memory rewardsInWei,
        string[] memory titles,
        string[] memory uris
    ) public {
        require(
            rewardsInWei.length == titles.length,
            "ERC1155: rewardsInWei and titles length mismatch"
        );
        require(
            titles.length == uris.length,
            "ERC1155: titles and _uris length mismatch"
        );
        uint256[] memory tokenIds = new uint256[](rewardsInWei.length);
        uint256[] memory amounts = new uint256[](rewardsInWei.length);
        address[] memory hunters = new address[](rewardsInWei.length);
        Status[] memory statuses = new Status[](rewardsInWei.length);
        uint256[] memory claimedAts = new uint256[](rewardsInWei.length);
        for (uint256 i = 0; i < rewardsInWei.length; i++) {
            uint256 tokenId = _tokenIdCounter.current();
            tokenIds[i] = tokenId;
            amounts[i] = 1;
            hunters[i] = msg.sender;
            statuses[i] = Status.Open;
            claimedAts[i] = 0;
            _tokenIdCounter.increment();
            Bounty memory bounty = Bounty(
                tokenId,
                rewardsInWei[i],
                titles[i],
                msg.sender,
                Status.Open,
                0
            );
            setTokenUri(tokenId, uris[i]);
            bounties[tokenId] = bounty;
        }
        emit BountyNFTBatchCreated(
            tokenIds,
            rewardsInWei,
            titles,
            hunters,
            statuses,
            claimedAts
        );
    }

    function claimBountyNFT(
        address account,
        uint256 tokenId,
        bytes calldata signature
    ) external {
        Bounty memory bounty = bounties[tokenId];
        require(bounty.status == Status.Open, "ERC1155: BountyNFT already claimed");
        require(
            _verify(_hash(account, tokenId), signature, tokenId),
            "ERC1155: Invalid signature"
        );
        bounty.hunter = account;
        bounty.claimedAt = block.timestamp;
        bounty.status = Status.Hunted;
        bounties[tokenId] = bounty;
        _mint(account, tokenId, 1, "");
    }

    function _hash(address account, uint256 tokenId)
        internal
        view
        returns (bytes32)
    {
        return
            _hashTypedDataV4(
                keccak256(
                    abi.encode(
                        keccak256("BountyNFT(uint256 tokenId,address account)"),
                        tokenId,
                        account
                    )
                )
            );
    }

    function _verify(
        bytes32 digest,
        bytes memory signature,
        uint256 tokenId
    ) internal view returns (bool) {
        Bounty memory bounty = bounties[tokenId];
        return bounty.hunter == ECDSA.recover(digest, signature);
    }
}
