// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 1. `listItem`: List NFTs on the marketplace
// 2. `buyItem`: Buy NFTs
// 3. `cancelItem`:Cancel a list item / NFT
// 4. `uploadListing`: Update Listing Price
// 5. `withdrawProceeds`: Withdraw payments from the Bought NFTs

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";

error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__NotApprovedOnMarketPlace();
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__AlreadyListed();

contract NftMarketplace {

    // *** Enums / Types *** //

    enum Listing {
        uint256 price;
        address seller;
    }


    // *** Events *** //

    event ItemListed(
        address indexed seller;
        address indexed nftAddress;
        address indexed tokenId;
        uint256 price;
    )


    // *** Modifiers *** //

    modifier notListed(address nftAddress, uint256 tokenId, address owner) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if(listing.price > 0) revert NftMarketplace__AlreadyListed(nftAddress, tokenId);
        _;
    }

    modifier isOwner(address nftAddress, uint256 tokenId, address spender) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if(spender != owner) revert NftMarketplace__NotOwner();
        _;
    }


    // *** State Variables *** //

    // NFT Contract Address => NFT TokenID -> Listing
    mapping (address => mapping (uint256 => Listing)) private s_listings;
    
    
    // *** Main Functions *** //
    
    function listItem(address nftAddress, uint256 tokenId, uint256 price) external notListed(nftAddress, tokenId, msg.sender) isOwner(nftAddress, tokenId, msg.sender) {
        if(price <= 0) revert NftMarketplace__PriceMustBeAboveZero();
        IERC721 nft = IERC721(nftAddress);

        // if the user doesn't approve the marketplace to hold NFTs
        if(nft.getApproved(tokenId) != address(this)) revert NftMarketplace__NotApprovedOnMarketPlace();

        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }
}