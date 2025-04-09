import React, { useContext, useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Web3Context } from '../context/Web3Context';
import Cart from '../components/Cart';
import { ethers } from 'ethers';

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useContext(CartContext);
  const { account, isConnected, connectWallet, buyItem, isLoading, provider, balance, chainId } = useContext(Web3Context);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [networkName, setNetworkName] = useState('');
  const navigate = useNavigate();
  
  useEffect(() => {
    const getNetworkName = () => {
      // ChainId for Sepolia is 11155111
      if (chainId === 11155111) {
        setNetworkName('Sepolia Testnet');
      } else if (chainId === 1) {
        setNetworkName('Ethereum Mainnet');
      } else if (chainId === 1337 || chainId === 31337) {
        setNetworkName('Local Network');
      } else {
        setNetworkName(`Network ID: ${chainId}`);
      }
    };
    
    if (isConnected && chainId) {
      getNetworkName();
    }
  }, [chainId, isConnected]);
  
  const handleCheckout = async () => {
    if (!isConnected) {
      const confirm = window.confirm('Please connect your wallet first. Connect now?');
      if (confirm) {
        await connectWallet();
      }
      return;
    }
    
    if (cartItems.length === 0) {
      alert('Your cart is empty');
      return;
    }

    // Check if user is on Sepolia or local network
    if (chainId !== 11155111 && chainId !== 1337 && chainId !== 31337) {
      alert('Please switch to Sepolia testnet in your MetaMask wallet to complete this purchase.');
      return;
    }

    // Correctly compare numeric values
    if (parseFloat(balance) < parseFloat(totalPrice)) {
      alert(`Insufficient balance. You need at least ${totalPrice.toFixed(4)} ${networkName} ETH to complete this purchase.`);
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      // Process each item in cart
      for (const item of cartItems) {
        const success = await buyItem(item.id, item.price);
        if (!success) {
          alert(`Failed to purchase ${item.name}. Transaction was not completed.`);
          setProcessingPayment(false);
          return;
        }
      }
      
      // If all transactions were successful
      alert('Payment completed successfully!');
      clearCart();
      navigate('/');
    } catch (error) {
      console.error('Checkout error:', error);
      alert('An error occurred during checkout. Please try again.');
    } finally {
      setProcessingPayment(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Checkout</h1>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2">
          <Cart />
        </div>
        
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
            
            {isConnected && (
              <div className="mb-4 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-800">
                Connected to: <span className="font-semibold">{networkName}</span>
              </div>
            )}
            
            <div className="mb-4 pb-4 border-b">
              <div className="flex justify-between mb-2">
                <span>Items ({cartItems.length})</span>
                <span>{parseFloat(totalPrice).toFixed(4)} ETH</span>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>Network Fee (Est.)</span>
                <span>0.0005 ETH</span>
              </div>
            </div>
            
            <div className="flex justify-between font-bold text-lg mb-6">
              <span>Total</span>
              <span>{(parseFloat(totalPrice) + 0.0005).toFixed(4)} ETH</span>
            </div>

            {isConnected && (
              <div className="mb-4 p-3 bg-gray-100 rounded">
                <div className="flex justify-between">
                  <span>Your Balance:</span>
                  <span className="font-semibold">{balance} ETH</span>
                </div>
              </div>
            )}
            
            {!isConnected ? (
              <button
                onClick={connectWallet}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg font-semibold mb-4"
              >
                Connect Wallet
              </button>
            ) : (
              <button
                onClick={handleCheckout}
                disabled={cartItems.length === 0 || processingPayment || isLoading}
                className={`w-full bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg font-semibold mb-4 ${
                  (cartItems.length === 0 || processingPayment || isLoading) ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {processingPayment || isLoading ? 'Processing...' : 'Complete Payment'}
              </button>
            )}
            
            <div className="text-center text-sm text-gray-600">
              <p>Payment is sent to:</p>
              <p className="font-mono mt-1">0x826F389be2A72c80A8406fB967269c584e00b0Fa</p>
              <p className="mt-1 text-xs text-gray-500">Using {networkName} ETH</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Checkout;