import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Web3Context } from '../context/Web3Context';
import { CartContext } from '../context/CartContext';
import { ethers } from 'ethers';

const Header = () => {
  const { account, isConnected, connectWallet, disconnectWallet, provider } = useContext(Web3Context);
  const { cartItems } = useContext(CartContext);
  const [balance, setBalance] = useState('0');

  useEffect(() => {
    const fetchBalance = async () => {
      if (isConnected && provider && account) {
        try {
          const balanceWei = await provider.getBalance(account);
          const balanceEth = ethers.utils.formatEther(balanceWei);
          setBalance(parseFloat(balanceEth).toFixed(4));
        } catch (error) {
          console.error('Error fetching balance:', error);
          setBalance('0');
        }
      }
    };

    fetchBalance();
  }, [isConnected, provider, account]);

  return (
    <header className="bg-gray-800 text-white py-4">
      <div className="container mx-auto px-4 flex justify-between items-center">
        <Link to="/" className="text-2xl font-bold">
          Sports Memorabilia
        </Link>
        
        <nav className="flex space-x-6">
          <Link to="/" className="hover:text-gray-300">
            Home
          </Link>
          <Link to="/cricket" className="hover:text-gray-300">
            Cricket
          </Link>
          <Link to="/football" className="hover:text-gray-300">
            Football
          </Link>
          <Link to="/badminton" className="hover:text-gray-300">
            Badminton
          </Link>
          {isConnected && (
            <>
              <Link to="/profile" className="hover:text-gray-300">
                My Profile
              </Link>
              <Link to="/add-item" className="hover:text-gray-300">
                Add Item
              </Link>
            </>
          )}
        </nav>
        
        <div className="flex items-center space-x-4">
          <Link to="/checkout" className="relative">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
            {cartItems.length > 0 && (
              <span className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center text-xs">
                {cartItems.length}
              </span>
            )}
          </Link>
          
          {isConnected ? (
            <div className="flex items-center space-x-2">
              <span className="text-sm px-2 py-1 bg-gray-700 rounded">
                {balance} ETH
              </span>
              <span className="text-sm hidden md:inline">
                {account.slice(0, 6)}...{account.slice(-4)}
              </span>
              <button
                onClick={disconnectWallet}
                className="bg-red-500 hover:bg-red-600 text-white py-1 px-3 rounded text-sm"
              >
                Disconnect
              </button>
            </div>
          ) : (
            <button
              onClick={connectWallet}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded"
            >
              Connect Wallet
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;