const express = require('express');
const router = express.Router();

// In-memory storage for items (replace with database in production)
let items = [
  {
    id: '1',
    category: 'football',
    name: 'Football Jersey',
    price: '50',
    description: 'Official team jersey',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '2',
    category: 'basketball',
    name: 'Basketball',
    price: '30',
    description: 'Professional basketball',
    image: 'https://via.placeholder.com/150',
  },
  {
    id: '3',
    category: 'cricket',
    name: 'Cricket Bat',
    price: '40',
    description: 'Professional cricket bat',
    image: 'https://via.placeholder.com/150',
  }
];

// In-memory wallet balances (simulating blockchain)
// This would be a database in a real application
const walletBalances = {};

const { getWalletBalance, purchaseItem } = require('../utils/blockchain');

// Endpoint to fetch user balance
router.get('/balance', async (req, res) => {
  try {
    // Get wallet address from query parameter
    const { address } = req.query;
    
    if (!address) {
      return res.status(400).json({ error: "Wallet address is required" });
    }
    
    // If we don't have a balance for this wallet yet, initialize it with blockchain balance
    if (walletBalances[address] === undefined) {
      try {
        // Get initial balance from blockchain
        const blockchainBalance = await getWalletBalance(address);
        // Initialize with a decent starting balance for testing
        walletBalances[address] = parseFloat(blockchainBalance || '100.00');
      } catch (error) {
        // If blockchain query fails, initialize with default balance
        console.error('Error getting blockchain balance:', error);
        walletBalances[address] = 100.00;
      }
    }
    
    // Return the tracked balance
    res.json({ balance: walletBalances[address].toFixed(2) });
  } catch (error) {
    console.error("Error fetching balance:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to get all items
router.get('/items', async (req, res) => {
  try {
    res.json({ items });
  } catch (error) {
    console.error("Error fetching items:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to get items by category
router.get('/items/:category', async (req, res) => {
  try {
    const { category } = req.params;
    const categoryItems = items.filter(item => item.category.toLowerCase() === category.toLowerCase());
    res.json({ items: categoryItems });
  } catch (error) {
    console.error(`Error fetching ${req.params.category} items:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to get item details by ID
router.get('/items-detail/:itemId', async (req, res) => {
  try {
    const { itemId } = req.params;
    const item = items.find(item => item.id === itemId);
    
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    // Add a seller address if it doesn't exist (for testing)
    if (!item.seller) {
      item.seller = '0x123456789abcdef123456789abcdef123456789a';
    }
    
    res.json({ item });
  } catch (error) {
    console.error(`Error fetching item details:`, error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to create a new item
router.post('/items', async (req, res) => {
  try {
    const { category, name, price, description, image } = req.body;
    
    // Validate required fields
    if (!category || !name || !price) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Create new item
    const newItem = {
      id: (items.length + 1).toString(),
      category,
      name,
      price,
      description: description || '',
      image: image || 'https://via.placeholder.com/150',
    };
    
    // Add to items collection
    items.push(newItem);
    
    res.status(201).json({ item: newItem });
  } catch (error) {
    console.error("Error creating item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to purchase an item
router.post('/purchase', async (req, res) => {
  try {
    const { itemId, price, address } = req.body;
    
    if (!itemId || !price || !address) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Find the item to purchase
    const item = items.find(item => item.id === itemId);
    
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    // Check if the price matches
    if (parseFloat(price) !== parseFloat(item.price)) {
      return res.status(400).json({ error: "Please submit the asking price" });
    }
    
    // Initialize wallet balance if not already done
    if (walletBalances[address] === undefined) {
      walletBalances[address] = 100.0; // Default starting balance
    }
    
    // Check if user has enough balance
    const priceValue = parseFloat(price);
    if (walletBalances[address] < priceValue) {
      return res.status(400).json({ error: "Insufficient balance" });
    }
    
    // Deduct the price from user's balance
    walletBalances[address] -= priceValue;
    
    // Mark the item as sold (in a real app, we would handle blockchain transactions here)
    item.sold = true;
    item.buyer = address;
    
    res.status(200).json({ 
      success: true, 
      item, 
      newBalance: walletBalances[address].toFixed(2),
      message: "Item purchased successfully" 
    });
  } catch (error) {
    console.error("Error purchasing item:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

// Endpoint to handle completed blockchain purchases
router.post('/purchase-complete', async (req, res) => {
  try {
    const { itemId, transactionHash, buyer } = req.body;
    
    if (!itemId || !transactionHash || !buyer) {
      return res.status(400).json({ error: "Missing required fields" });
    }
    
    // Find the item that was purchased
    const item = items.find(item => item.id === itemId);
    
    if (!item) {
      return res.status(404).json({ error: "Item not found" });
    }
    
    // Mark the item as sold
    item.sold = true;
    item.buyer = buyer;
    item.transactionHash = transactionHash;
    
    console.log(`Item ${itemId} purchased by ${buyer} with transaction ${transactionHash}`);
    
    res.status(200).json({ 
      success: true, 
      item,
      message: "Item purchase recorded successfully" 
    });
  } catch (error) {
    console.error("Error recording purchase:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

module.exports = router;
