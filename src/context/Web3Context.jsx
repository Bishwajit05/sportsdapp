import React, { createContext, useState, useEffect, useCallback } from 'react';
import { ethers } from 'ethers';
import Web3Modal from 'web3modal';
import SportsMarketplaceABI from '../artifacts/contracts/Marketplace.sol/SportsMarketplace.json';
import contractAddress from '../utils/contractAddress.json';

export const Web3Context = createContext();

export const Web3Provider = ({ children }) => {
  const [provider, setProvider] = useState(null);
  const [signer, setSigner] = useState(null);
  const [contract, setContract] = useState(null);
  const [account, setAccount] = useState('');
  const [isConnected, setIsConnected] = useState(false);
  const [chainId, setChainId] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [balance, setBalance] = useState('0');

  // Initialize web3modal
  const web3Modal = new Web3Modal({
    network: "mainnet",
    cacheProvider: true,
    providerOptions: {}
  });

  // Fetch user balance from backend
  const fetchBalance = useCallback(async () => {
    try {
      if (!account) {
        console.log('No wallet connected, cannot fetch balance');
        setBalance('0');
        return;
      }
      
      console.log('Fetching balance from backend for address:', account);
      const response = await fetch(`http://localhost:3001/api/marketplace/balance?address=${account}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Balance data received:', data);
      setBalance(data.balance);
    } catch (error) {
      console.error("Error fetching balance from backend:", error);
      setBalance('0');
    }
  }, [account]);

  // Connect wallet
  const connectWallet = useCallback(async () => {
    try {
      setIsLoading(true);
      const instance = await web3Modal.connect();
      const provider = new ethers.providers.Web3Provider(instance);
      const signer = provider.getSigner();
      const address = await signer.getAddress();
      const network = await provider.getNetwork();

      setProvider(provider);
      setSigner(signer);
      setAccount(address);
      setChainId(network.chainId);
      setIsConnected(true);

      // Initialize the contract
      const marketplaceContract = new ethers.Contract(
        contractAddress.SportsMarketplace,
        SportsMarketplaceABI.abi,
        signer
      );
      setContract(marketplaceContract);

      // Set up listeners
      instance.on("accountsChanged", (accounts) => {
        if (accounts.length > 0) {
          setAccount(accounts[0]);
        } else {
          // If user disconnected through MetaMask UI
          disconnectWallet();
        }
      });

      instance.on("chainChanged", async () => {
        window.location.reload();
      });

      instance.on("disconnect", () => {
        disconnectWallet();
      });
    } catch (error) {
      console.error("Connection error:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Disconnect wallet
  const disconnectWallet = useCallback(async () => {
    try {
      await web3Modal.clearCachedProvider();
      setAccount('');
      setIsConnected(false);
      setProvider(null);
      setSigner(null);
      setContract(null);
      setBalance('0');
    } catch (error) {
      console.error("Disconnect error:", error);
    }
  }, []);

  // Auto-connect if previously connected
  useEffect(() => {
    if (web3Modal.cachedProvider) {
      connectWallet();
    }
  }, [connectWallet]);

  // Update balance when account changes
  useEffect(() => {
    if (isConnected && account) {
      fetchBalance();
    }
  }, [isConnected, account, fetchBalance]);

  // Function to fetch items from a category via API
  const fetchItemsByCategory = useCallback(async (category) => {
    try {
      console.log(`Fetching ${category} items from backend...`);
      const response = await fetch(`http://localhost:3001/api/marketplace/items/${category}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Items data received:', data);
      
      return data.items || [];
    } catch (error) {
      console.error(`Error fetching ${category} items:`, error);
      return [];
    }
  }, []);

  // Function to buy an item with real wallet transaction
  const buyItem = useCallback(async (itemId, price) => {
    if (!contract || !signer || !account) {
      alert('Please connect your wallet first');
      return false;
    }
    
    try {
      setIsLoading(true);
      console.log(`Buying item ${itemId} for ${price} using blockchain transaction...`);
      
      // First get the item details from backend
      const response = await fetch(`http://localhost:3001/api/marketplace/items-detail/${itemId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }
      
      const itemData = await response.json();
      console.log('Item data:', itemData);
      
      // Convert price to Wei (blockchain format)
      const priceInWei = ethers.utils.parseEther(price.toString());
      
      // Create and send the transaction
      const tx = await signer.sendTransaction({
        to: itemData.item.seller || '0xYourMarketplaceAddress', // Replace with actual seller or marketplace address
        value: priceInWei,
        gasLimit: 100000 // Approximate gas needed
      });
      
      console.log('Transaction sent:', tx.hash);
      
      // Wait for transaction confirmation
      const receipt = await tx.wait();
      console.log('Transaction confirmed:', receipt);
      
      // Notify backend about successful purchase
      const purchaseResponse = await fetch('http://localhost:3001/api/marketplace/purchase-complete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId,
          transactionHash: tx.hash,
          buyer: account
        })
      });
      
      // Update balance after purchase
      await fetchBalance();
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error buying item:", error);
      alert(`Transaction failed: ${error.message}`);
      setIsLoading(false);
      return false;
    }
  }, [contract, account, fetchBalance]);

  // Function to create a new listing via backend API
  const createListing = useCallback(async (name, description, image, price, category) => {
    try {
      setIsLoading(true);
      console.log('Creating new item via backend API...');
      
      const response = await fetch('http://localhost:3001/api/marketplace/items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name,
          description,
          image,
          price,
          category
        })
      });
      
      console.log('Response status:', response.status);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Item created successfully:', data);
      
      // Update balance after item creation
      await fetchBalance();
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error creating listing:", error);
      alert(`Listing creation failed: ${error.message}`);
      setIsLoading(false);
      return false;
    }
  }, [contract, account, fetchBalance]);

  return (
    <Web3Context.Provider
      value={{
        provider,
        signer,
        contract,
        account,
        isConnected,
        chainId,
        isLoading,
        balance,
        connectWallet,
        disconnectWallet,
        fetchItemsByCategory,
        buyItem,
        createListing,
        fetchBalance
      }}
    >
      {children}
    </Web3Context.Provider>
  );
};