const { expect } = require("chai");
const { ethers } = require("hardhat");

describe("SportsMarketplace", function () {
  let SportsMarketplace;
  let sportsMarketplace;
  let owner;
  let addr1;
  let addr2;
  let fixedReceiver;
  
  beforeEach(async function () {
    // Get contract factory and signers
    SportsMarketplace = await ethers.getContractFactory("SportsMarketplace");
    [owner, addr1, addr2, ...addrs] = await ethers.getSigners();
    
    // Deploy the contract
    sportsMarketplace = await SportsMarketplace.deploy();
    await sportsMarketplace.deployed();
    
    // Get the fixed receiver address
    fixedReceiver = await sportsMarketplace.fixedReceiver();
  });
  
  describe("Deployment", function () {
    it("Should set the right owner", async function () {
      expect(await sportsMarketplace.owner()).to.equal(owner.address);
    });
    
    it("Should set the correct fixed receiver address", async function () {
      expect(fixedReceiver).to.equal("0x826F389be2A72c80A8406fB967269c584e00b0Fa");
    });
  });
  
  describe("Transactions", function () {
    it("Should create a market item correctly", async function () {
      const name = "Test Item";
      const description = "Test Description";
      const image = "https://example.com/image.png";
      const price = ethers.utils.parseEther("1");
      const category = "cricket";
      
      await sportsMarketplace.createMarketItem(
        name,
        description,
        image,
        price,
        category
      );
      
      const items = await sportsMarketplace.fetchMarketItems();
      expect(items.length).to.equal(1);
      expect(items[0].name).to.equal(name);
      expect(items[0].description).to.equal(description);
      expect(items[0].image).to.equal(image);
      expect(items[0].price).to.equal(price);
      expect(items[0].category).to.equal(category);
      expect(items[0].seller).to.equal(owner.address);
      expect(items[0].sold).to.equal(false);
    });
    
    it("Should allow purchasing a market item", async function () {
      // First create an item
      const price = ethers.utils.parseEther("1");
      await sportsMarketplace.createMarketItem(
        "Test Item",
        "Test Description",
        "https://example.com/image.png",
        price,
        "cricket"
      );
      
      // Get fixed receiver balance before purchase
      const initialReceiverBalance = await ethers.provider.getBalance(fixedReceiver);
      
      // Purchase the item from another account
      await sportsMarketplace.connect(addr1).purchaseMarketItem(1, { value: price });
      
      // Check item is marked as sold
      const items = await sportsMarketplace.fetchMarketItems();
      expect(items.length).to.equal(0); // No more unsold items
      
      // Check balances - funds should go to fixed receiver, not seller
      const finalReceiverBalance = await ethers.provider.getBalance(fixedReceiver);
      expect(finalReceiverBalance.sub(initialReceiverBalance)).to.equal(price);
    });
    
    it("Should fetch items by category", async function () {
      // Create items in different categories
      await sportsMarketplace.createMarketItem(
        "Cricket Item",
        "Cricket Description",
        "https://example.com/cricket.png",
        ethers.utils.parseEther("1"),
        "cricket"
      );
      
      await sportsMarketplace.createMarketItem(
        "Football Item",
        "Football Description",
        "https://example.com/football.png",
        ethers.utils.parseEther("2"),
        "football"
      );
      
      await sportsMarketplace.createMarketItem(
        "Badminton Item",
        "Badminton Description",
        "https://example.com/badminton.png",
        ethers.utils.parseEther("3"),
        "badminton"
      );
      
      // Fetch cricket items
      const cricketItems = await sportsMarketplace.fetchItemsByCategory("cricket");
      expect(cricketItems.length).to.equal(1);
      expect(cricketItems[0].name).to.equal("Cricket Item");
      
      // Fetch football items
      const footballItems = await sportsMarketplace.fetchItemsByCategory("football");
      expect(footballItems.length).to.equal(1);
      expect(footballItems[0].name).to.equal("Football Item");
      
      // Fetch badminton items
      const badmintonItems = await sportsMarketplace.fetchItemsByCategory("badminton");
      expect(badmintonItems.length).to.equal(1);
      expect(badmintonItems[0].name).to.equal("Badminton Item");
    });
  });
  
  describe("Error handling", function () {
    it("Should not allow purchasing an item with insufficient funds", async function () {
      // Create an item
      const price = ethers.utils.parseEther("2");
      await sportsMarketplace.createMarketItem(
        "Expensive Item",
        "Too expensive",
        "https://example.com/expensive.png",
        price,
        "cricket"
      );
      
      // Try to purchase with less than the asking price
      await expect(
        sportsMarketplace.connect(addr1).purchaseMarketItem(1, { 
          value: ethers.utils.parseEther("1") 
        })
      ).to.be.revertedWith("Please submit the asking price");
    });
    
    it("Should not allow purchasing a non-existent item", async function () {
      await expect(
        sportsMarketplace.connect(addr1).purchaseMarketItem(99, { 
          value: ethers.utils.parseEther("1") 
        })
      ).to.be.revertedWith("Item does not exist");
    });
    
    it("Should not allow purchasing an already sold item", async function () {
      // Create and purchase an item
      const price = ethers.utils.parseEther("1");
      await sportsMarketplace.createMarketItem(
        "Test Item",
        "Test Description",
        "https://example.com/image.png",
        price,
        "cricket"
      );
      
      await sportsMarketplace.connect(addr1).purchaseMarketItem(1, { value: price });
      
      // Try to purchase it again
      await expect(
        sportsMarketplace.connect(addr2).purchaseMarketItem(1, { value: price })
      ).to.be.revertedWith("Item already sold");
    });
  });
});