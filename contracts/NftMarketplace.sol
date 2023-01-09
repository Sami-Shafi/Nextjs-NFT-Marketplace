// SPDX-License-Identifier: MIT
pragma solidity ^0.8.7;

// 1. `listItem`: List NFTs on the marketplace
// 2. `buyItem`: Buy NFTs
// 3. `cancelItem`:Cancel a list item / NFT
// 4. `uploadListing`: Update Listing Price
// 5. `withdrawProceeds`: Withdraw payments from the Bought NFTs

import "@openzeppelin/contracts/token/ERC721/IERC721.sol";
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";

// *** Errors *** //

error NftMarketplace__PriceMustBeAboveZero();
error NftMarketplace__NotApprovedOnMarketPlace();
error NftMarketplace__AlreadyListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotListed(address nftAddress, uint256 tokenId);
error NftMarketplace__NotOwner();
error NftMarketplace__NoProceeds();
error NftMarketplace__WithdrawTransferFailed();
error NftMarketplace__PriceNotMet(
    address nftAddress,
    uint256 tokenId,
    uint256 price
);

contract NftMarketplace is ReentrancyGuard {
    // *** Enums / Types *** //

    struct Listing {
        uint256 price;
        address seller;
    }

    // *** Events *** //

    event ItemListed(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemBought(
        address indexed buyer,
        address indexed nftAddress,
        uint256 indexed tokenId,
        uint256 price
    );

    event ItemCancelled(
        address indexed seller,
        address indexed nftAddress,
        uint256 indexed tokenId
    );

    // *** Modifiers *** //

    modifier notListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price > 0)
            revert NftMarketplace__AlreadyListed(nftAddress, tokenId);
        _;
    }

    modifier isListed(address nftAddress, uint256 tokenId) {
        Listing memory listing = s_listings[nftAddress][tokenId];
        if (listing.price <= 0)
            revert NftMarketplace__NotListed(nftAddress, tokenId);
        _;
    }

    modifier isOwner(
        address nftAddress,
        uint256 tokenId,
        address spender
    ) {
        IERC721 nft = IERC721(nftAddress);
        address owner = nft.ownerOf(tokenId);
        if (spender != owner) revert NftMarketplace__NotOwner();
        _;
    }

    // *** State Variables *** //

    // *** Mappings *** //

    // NFT Contract Address => NFT TokenID -> Listing
    mapping(address => mapping(uint256 => Listing)) private s_listings;
    // Seller Address => Amount Earned
    mapping(address => uint256) private s_proceeds;

    // *** Main Functions *** //

    /*
     * @notice: Method for listing NFT on the marketplace
     * @param nftAddress: simply the NFT Address
     * @param tokenId: The Token ID of the NFT
     * @param price: The price of the Listed NFT
     * @dev There are 2 modifiers here.
     */
    function listItem(
        address nftAddress,
        uint256 tokenId,
        uint256 price
    )
        external
        notListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        if (price <= 0) revert NftMarketplace__PriceMustBeAboveZero();
        IERC721 nft = IERC721(nftAddress);

        // if the user doesn't approve the marketplace to hold NFTs
        if (nft.getApproved(tokenId) != address(this))
            revert NftMarketplace__NotApprovedOnMarketPlace();

        s_listings[nftAddress][tokenId] = Listing(price, msg.sender);
        emit ItemListed(msg.sender, nftAddress, tokenId, price);
    }

    /*
     * @notice: Method for buying NFT on the marketplace
     * @param nftAddress: simply the NFT Address
     * @param tokenId: The Token ID of the NFT
     * @dev There is a custom modifer and
     * a openZeppelin modifier here (this one is for reentrancy attacks).
     */
    function buyItem(
        address nftAddress,
        uint256 tokenId
    ) external payable nonReentrant isListed(nftAddress, tokenId) {
        Listing memory listedItem = s_listings[nftAddress][tokenId];
        if (msg.value < listedItem.price)
            revert NftMarketplace__PriceNotMet(
                nftAddress,
                tokenId,
                listedItem.price
            );

        // Don't directly send money to user
        // have them withdraw the money
        // in this case, delete the user and update info first
        // then call the safeTransferFrom
        s_proceeds[listedItem.seller] =
            s_proceeds[listedItem.seller] +
            msg.value;
        delete (s_listings[nftAddress][tokenId]);

        IERC721(nftAddress).safeTransferFrom(
            listedItem.seller,
            msg.sender,
            tokenId
        );
        emit ItemBought(msg.sender, nftAddress, tokenId, listedItem.price);
    }

    function cancelListing(
        address nftAddress,
        uint256 tokenId
    )
        external
        isOwner(nftAddress, tokenId, msg.sender)
        isListed(nftAddress, tokenId)
    {
        delete (s_listings[nftAddress][tokenId]);
        emit ItemCancelled(msg.sender, nftAddress, tokenId);
    }

    function updateListing(
        address nftAddress,
        uint256 tokenId,
        uint256 newPrice
    )
        external
        isListed(nftAddress, tokenId)
        isOwner(nftAddress, tokenId, msg.sender)
    {
        s_listings[nftAddress][tokenId].price = newPrice;
        emit ItemListed(msg.sender, nftAddress, tokenId, newPrice);
    }

    function withdrawProceeds() external {
        uint256 proceeds = s_proceeds[msg.sender];
        if (proceeds <= 0) revert NftMarketplace__NoProceeds();

        // set proceeds to 0 before any transactions
        s_proceeds[msg.sender] = 0;
        (bool success, ) = payable(msg.sender).call{value: proceeds}("");
        if (!success) revert NftMarketplace__WithdrawTransferFailed();
    }

    // *** Getter Functions *** //

    function getListing(
        address nftAddress,
        uint256 tokenId
    ) external view returns (Listing memory) {
        return s_listings[nftAddress][tokenId];
    }

    function getProceeds(address seller) external view returns (uint256) {
        return s_proceeds[seller];
    }
}
