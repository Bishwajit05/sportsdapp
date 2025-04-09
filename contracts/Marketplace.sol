// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

// Remove duplicate import (line 6 is duplicating line 4)
import "@openzeppelin/contracts/security/ReentrancyGuard.sol";
import "@openzeppelin/contracts/utils/Counters.sol";

contract SportsMarketplace is ReentrancyGuard {
    using Counters for Counters.Counter;
    Counters.Counter private _itemIds;
    
    address payable public owner; // Marketplace owner
    address payable public fixedReceiver; // Fixed address to receive payments
    
    struct MarketItem {
        uint256 itemId;
        string name;
        string description;
        string image;
        uint256 price;
        string category; // cricket, football, or badminton
        address payable seller;
        bool sold;
    }
    
    mapping(uint256 => MarketItem) private idToMarketItem;
    
    event MarketItemCreated(
        uint256 indexed itemId,
        string name,
        string description,
        string image,
        uint256 price,
        string category,
        address seller
    );
    
    event MarketItemSold(
        uint256 indexed itemId,
        address buyer
    );
    
    constructor() {
        owner = payable(msg.sender);
        // Set the fixed receiver address
        fixedReceiver = payable(0x826F389be2A72c80A8406fB967269c584e00b0Fa);
    }
    
    // Function to create a new market item
    function createMarketItem(
        string memory name,
        string memory description,
        string memory image,
        uint256 price,
        string memory category
    ) public {
        require(price > 0, "Price must be at least 1 wei");
        
        _itemIds.increment();
        uint256 itemId = _itemIds.current();
        
        idToMarketItem[itemId] = MarketItem(
            itemId,
            name,
            description,
            image,
            price,
            category,
            payable(msg.sender),
            false
        );
        
        emit MarketItemCreated(
            itemId,
            name,
            description,
            image,
            price,
            category,
            msg.sender
        );
    }
    
    // Function to purchase a market item
    function purchaseMarketItem(uint256 itemId) public payable nonReentrant {
        MarketItem storage item = idToMarketItem[itemId];
        uint price = item.price;
        
        require(itemId > 0 && itemId <= _itemIds.current(), "Item does not exist");
        require(msg.value == price, "Please submit the asking price");
        require(!item.sold, "Item already sold");
        
        // Transfer funds to fixed receiver address (not the seller)
        fixedReceiver.transfer(msg.value);
        
        // Mark as sold
        idToMarketItem[itemId].sold = true;
        
        emit MarketItemSold(itemId, msg.sender);
    }
    
    // Function to fetch all unsold market items
    function fetchMarketItems() public view returns (MarketItem[] memory) {
        uint itemCount = _itemIds.current();
        uint unsoldItemCount = 0;
        
        for (uint i = 1; i <= itemCount; i++) {
            if (!idToMarketItem[i].sold) {
                unsoldItemCount++;
            }
        }
        
        MarketItem[] memory items = new MarketItem[](unsoldItemCount);
        uint currentIndex = 0;
        
        for (uint i = 1; i <= itemCount; i++) {
            if (!idToMarketItem[i].sold) {
                items[currentIndex] = idToMarketItem[i];
                currentIndex++;
            }
        }
        
        return items;
    }
    
    // Function to fetch items by category
    function fetchItemsByCategory(string memory category) public view returns (MarketItem[] memory) {
        uint itemCount = _itemIds.current();
        uint matchingItemCount = 0;
        
        for (uint i = 1; i <= itemCount; i++) {
            if (keccak256(bytes(idToMarketItem[i].category)) == keccak256(bytes(category)) && !idToMarketItem[i].sold) {
                matchingItemCount++;
            }
        }
        
        MarketItem[] memory items = new MarketItem[](matchingItemCount);
        uint currentIndex = 0;
        
        for (uint i = 1; i <= itemCount; i++) {
            if (keccak256(bytes(idToMarketItem[i].category)) == keccak256(bytes(category)) && !idToMarketItem[i].sold) {
                items[currentIndex] = idToMarketItem[i];
                currentIndex++;
            }
        }
        
        return items;
    }
    
    // Function to fetch items created by the caller
    function fetchMyItems() public view returns (MarketItem[] memory) {
        uint itemCount = _itemIds.current();
        uint myItemCount = 0;
        
        for (uint i = 1; i <= itemCount; i++) {
            if (idToMarketItem[i].seller == msg.sender) {
                myItemCount++;
            }
        }
        
        MarketItem[] memory items = new MarketItem[](myItemCount);
        uint currentIndex = 0;
        
        for (uint i = 1; i <= itemCount; i++) {
            if (idToMarketItem[i].seller == msg.sender) {
                items[currentIndex] = idToMarketItem[i];
                currentIndex++;
            }
        }
        
        return items;
    }
}