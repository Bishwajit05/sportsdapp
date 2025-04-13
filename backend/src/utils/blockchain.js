const { ethers } = require('ethers');
require('dotenv').config();

// Initialize provider
const getProvider = () => {
  // Use a public Ethereum test network (Sepolia)
  return new ethers.providers.JsonRpcProvider('https://eth-sepolia.public.blastapi.io');
};

// Get wallet balance
const getWalletBalance = async (walletAddress) => {
  try {
    if (!walletAddress) {
      throw new Error('Wallet address is required');
    }
    
    const provider = getProvider();
    const balanceWei = await provider.getBalance(walletAddress);
    const balanceEth = ethers.utils.formatEther(balanceWei);
    
    return parseFloat(balanceEth).toFixed(4);
  } catch (error) {
    console.error('Error getting wallet balance:', error);
    throw error;
  }
};

module.exports = {
  getProvider,
  getWalletBalance
};
