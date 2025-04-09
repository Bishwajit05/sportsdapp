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

  // Fetch user balance
  const fetchBalance = useCallback(async () => {
    if (provider && account) {
      try {
        const balanceWei = await provider.getBalance(account);
        const balanceEth = ethers.utils.formatEther(balanceWei);
        setBalance(parseFloat(balanceEth).toFixed(4));
      } catch (error) {
        console.error("Error fetching balance:", error);
        setBalance('0');
      }
    }
  }, [provider, account]);

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

  // Function to fetch items from a category
  const fetchItemsByCategory = useCallback(async (category) => {
    if (!contract) return [];
    try {
      const items = await contract.fetchItemsByCategory(category);
      return items.map(item => ({
        id: item.itemId.toNumber(),
        name: item.name,
        description: item.description,
        image: item.image,
        price: ethers.utils.formatEther(item.price),
        category: item.category,
        seller: item.seller,
        sold: item.sold
      }));
    } catch (error) {
      console.error(`Error fetching ${category} items:`, error);
      return [];
    }
  }, [contract]);

  // Function to buy an item
  const buyItem = useCallback(async (itemId, price) => {
    if (!contract || !account) return false;
    try {
      setIsLoading(true);
      const priceInWei = ethers.utils.parseEther(price.toString());
      
      // Add gas estimate with buffer to ensure transaction goes through
      const gasEstimate = await contract.estimateGas.purchaseMarketItem(itemId, {
        value: priceInWei
      });
      const gasLimit = gasEstimate.mul(120).div(100); // Add 20% buffer
      
      const transaction = await contract.purchaseMarketItem(itemId, {
        value: priceInWei,
        gasLimit
      });
      
      const receipt = await transaction.wait();
      
      // Update balance after purchase
      await fetchBalance();
      
      console.log("Purchase successful!", receipt);
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error("Error buying item:", error);
      alert(`Transaction failed: ${error.message}`);
      setIsLoading(false);
      return false;
    }
  }, [contract, account, fetchBalance]);

  // Function to create a new listing
  const createListing = useCallback(async (name, description, image, price, category) => {
    if (!contract || !account) return false;
    try {
      setIsLoading(true);
      const priceInWei = ethers.utils.parseEther(price.toString());
      
      // Add gas estimate with buffer
      const gasEstimate = await contract.estimateGas.createMarketItem(
        name,
        description,
        image,
        priceInWei,
        category
      );
      const gasLimit = gasEstimate.mul(120).div(100); // Add 20% buffer
      
      const transaction = await contract.createMarketItem(
        name,
        description,
        image,
        priceInWei,
        category,
        { gasLimit }
      );
      
      await transaction.wait();
      
      // Update balance after listing creation
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