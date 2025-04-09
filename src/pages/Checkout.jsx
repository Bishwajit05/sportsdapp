import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { Web3Context } from '../context/Web3Context';
import Cart from '../components/Cart';

// Enhanced Toast Component
const Toast = ({ message, type, onClose }) => {
  const typeStyles = {
    success: {
      bg: 'bg-green-100 border-green-400 text-green-700',
      icon: (
        <svg className="w-6 h-6 text-green-500 mr-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
        </svg>
      )
    },
    error: {
      bg: 'bg-red-100 border-red-400 text-red-700',
      icon: (
        <svg className="w-6 h-6 text-red-500 mr-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
        </svg>
      )
    },
    warning: {
      bg: 'bg-yellow-100 border-yellow-400 text-yellow-700',
      icon: (
        <svg className="w-6 h-6 text-yellow-500 mr-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
        </svg>
      )
    },
    info: {
      bg: 'bg-blue-100 border-blue-400 text-blue-700',
      icon: (
        <svg className="w-6 h-6 text-blue-500 mr-4" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
        </svg>
      )
    }
  };

  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center pointer-events-none">
      <div 
        className={`
          ${typeStyles[type].bg} 
          border-l-4 
          p-4 
          rounded-lg 
          shadow-lg 
          max-w-md 
          w-full 
          mx-4 
          flex 
          items-center 
          animate-bounce 
          transition-all 
          duration-300
        `}
      >
        {typeStyles[type].icon}
        <div className="flex-1">
          <p className="font-semibold">{message}</p>
        </div>
      </div>
    </div>
  );
};

const Checkout = () => {
  const { cartItems, totalPrice, clearCart } = useContext(CartContext);
  const { 
    account, 
    isConnected, 
    connectWallet, 
    buyItem, 
    isLoading, 
    balance, 
    chainId 
  } = useContext(Web3Context);
  
  const [processingPayment, setProcessingPayment] = useState(false);
  const [networkName, setNetworkName] = useState('');
  
  // Toast state
  const [toast, setToast] = useState(null);

  // Show toast notification
  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  // Close toast notification
  const closeToast = () => {
    setToast(null);
  };

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
    // Wallet connection check
    if (!isConnected) {
      showToast('Please connect your wallet first', 'warning');
      
      const confirm = window.confirm('Connect wallet now?');
      if (confirm) {
        await connectWallet();
      }
      return;
    }
    
    // Cart empty check
    if (cartItems.length === 0) {
      showToast('Your cart is empty', 'warning');
      return;
    }

    // Network check
    if (chainId !== 11155111 && chainId !== 1337 && chainId !== 31337) {
      showToast('Please switch to Sepolia testnet in your MetaMask wallet', 'error');
      return;
    }

    // Balance check
    if (parseFloat(balance) < parseFloat(totalPrice)) {
      showToast(`Insufficient balance. You need at least ${totalPrice.toFixed(4)} ${networkName} ETH`, 'error');
      return;
    }
    
    setProcessingPayment(true);
    
    try {
      // Track successful and failed purchases
      const purchaseResults = [];

      // Process each item in cart
      for (const item of cartItems) {
        try {
          const success = await buyItem(item.id, item.price);
          
          if (success) {
            purchaseResults.push({
              item: item.name,
              status: 'success'
            });
            
            showToast(`Successfully purchased ${item.name}`, 'success');
          } else {
            purchaseResults.push({
              item: item.name,
              status: 'failed'
            });
            
            showToast(`Failed to purchase ${item.name}`, 'error');
          }
        } catch (itemError) {
          purchaseResults.push({
            item: item.name,
            status: 'failed'
          });
          
          showToast(`Error purchasing ${item.name}: ${itemError.message}`, 'error');
        }
      }
      
      // Check if all purchases were successful
      const allSuccessful = purchaseResults.every(result => result.status === 'success');
      
      if (allSuccessful) {
        showToast('All items purchased successfully!', 'success');
        clearCart();
        // You can add navigation logic here if needed
      } else {
        // Some items failed
        const failedItems = purchaseResults
          .filter(result => result.status === 'failed')
          .map(result => result.item);
        
        showToast(`Some items could not be purchased: ${failedItems.join(', ')}`, 'warning');
      }
    } catch (error) {
      console.error('Checkout error:', error);
      showToast('An unexpected error occurred during checkout', 'error');
    } finally {
      setProcessingPayment(false);
    }
  };
  
  return (
    <div className="container mx-auto px-4 py-8 relative">
      {/* Toast Notification */}
      {toast && (
        <Toast 
          message={toast.message} 
          type={toast.type} 
          onClose={closeToast} 
        />
      )}
      
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