import { ethers } from 'ethers';
import { SUPPORTED_NETWORKS } from './constants';

/**
 * Formats an Ethereum address to a shortened format
 * @param {string} address - The Ethereum address to format
 * @param {number} startLength - Number of characters to keep at the start
 * @param {number} endLength - Number of characters to keep at the end
 * @returns {string} Formatted address
 */
export const formatAddress = (address, startLength = 6, endLength = 4) => {
  if (!address) return '';
  return `${address.slice(0, startLength)}...${address.slice(-endLength)}`;
};

/**
 * Formats a wei value to ETH with specified decimal places
 * @param {string|number} wei - The wei amount to convert
 * @param {number} decimals - Number of decimal places to display
 * @returns {string} Formatted ETH amount
 */
export const formatEth = (wei, decimals = 4) => {
  if (!wei) return '0';
  const eth = ethers.utils.formatEther(wei.toString());
  return Number(eth).toFixed(decimals);
};

/**
 * Converts ETH to wei
 * @param {string|number} eth - The ETH amount to convert
 * @returns {string} Wei amount as a string
 */
export const toWei = (eth) => {
  if (!eth) return '0';
  return ethers.utils.parseEther(eth.toString()).toString();
};

/**
 * Gets the network name from chainId
 * @param {number} chainId - The chain ID
 * @returns {string} Network name
 */
export const getNetworkName = (chainId) => {
  return SUPPORTED_NETWORKS[chainId] || 'Unknown Network';
};

/**
 * Checks if MetaMask is installed
 * @returns {boolean} True if MetaMask is installed
 */
export const isMetaMaskInstalled = () => {
  return typeof window !== 'undefined' && typeof window.ethereum !== 'undefined';
};

/**
 * Adds a network to MetaMask
 * @param {Object} networkDetails - Network configuration details
 * @returns {Promise<boolean>} Success status
 */
export const addNetwork = async (networkDetails) => {
  if (!isMetaMaskInstalled()) return false;
  
  try {
    await window.ethereum.request({
      method: 'wallet_addEthereumChain',
      params: [networkDetails]
    });
    return true;
  } catch (error) {
    console.error('Error adding network:', error);
    return false;
  }
};

/**
 * Switches MetaMask to a specific network
 * @param {number} chainId - The chain ID to switch to
 * @returns {Promise<boolean>} Success status
 */
export const switchNetwork = async (chainId) => {
  if (!isMetaMaskInstalled()) return false;
  
  const hexChainId = `0x${chainId.toString(16)}`;
  
  try {
    await window.ethereum.request({
      method: 'wallet_switchEthereumChain',
      params: [{ chainId: hexChainId }]
    });
    return true;
  } catch (error) {
    console.error('Error switching network:', error);
    return false;
  }
};

/**
 * Validates an Ethereum address
 * @param {string} address - The address to validate
 * @returns {boolean} True if address is valid
 */
export const isValidAddress = (address) => {
  return ethers.utils.isAddress(address);
};