import { ethers } from 'ethers';
import ContractABI from '../contracts/SportsMarketplace.json';

export function getBlockchainConnection() {
  // Use window.ethereum for browser-based wallet
  const provider = new ethers.providers.Web3Provider(window.ethereum);
  const signer = provider.getSigner();
  
  const contractAddress = import.meta.env.VITE_CONTRACT_ADDRESS;
  const contract = new ethers.Contract(contractAddress, ContractABI.abi, signer);

  return { provider, signer, contract };
}

export async function requestWalletConnection() {
  if (window.ethereum) {
    try {
      // Request account access
      await window.ethereum.request({ method: 'eth_requestAccounts' });
      return true;
    } catch (error) {
      console.error("Wallet connection failed", error);
      return false;
    }
  } else {
    console.error("No Ethereum wallet found");
    return false;
  }
}