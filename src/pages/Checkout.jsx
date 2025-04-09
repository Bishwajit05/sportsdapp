import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { Web3Context } from '../context/Web3Context';
import Cart from '../components/Cart';

// Custom Toast Component
const Toast = ({ message, type, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  const typeStyles = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    warning: 'bg-yellow-500',
    info: 'bg-blue-500'
  };

  return (
    <div 
      className={`fixed top-4 right-4 z-50 px-4 py-2 text-white rounded-lg shadow-lg transition-all duration-300 ${typeStyles[type] || typeStyles.info}`}
    >
      {message}
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