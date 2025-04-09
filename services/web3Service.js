import { getBlockchainConnection } from '../utils/blockchain';
import { ethers } from 'ethers';

export async function createMarketItem(itemDetails) {
  try {
    const { contract } = getBlockchainConnection();
    
    const { 
      name, 
      description, 
      image, 
      price, 
      category 
    } = itemDetails;

    // Convert price to wei
    const priceInWei = ethers.utils.parseEther(price.toString());

    // Create market item
    const tx = await contract.createMarketItem(
      name,
      description,
      image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(name)}`,
      priceInWei,
      category
    );

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    return {
      success: true,
      message: 'Item created successfully',
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('Error creating market item:', error);
    return {
      success: false,
      message: error.message || 'Failed to create market item'
    };
  }
}

export async function buyMarketItem(itemId, price) {
  try {
    const { contract } = getBlockchainConnection();

    // Convert price to wei
    const priceInWei = ethers.utils.parseEther(price.toString());

    // Purchase market item
    const tx = await contract.purchaseMarketItem(itemId, {
      value: priceInWei
    });

    // Wait for transaction confirmation
    const receipt = await tx.wait();

    return {
      success: true,
      message: 'Item purchased successfully',
      transactionHash: receipt.transactionHash
    };
  } catch (error) {
    console.error('Error buying market item:', error);
    return {
      success: false,
      message: error.message || 'Failed to purchase market item'
    };
  }
}