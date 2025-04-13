import React, { useContext, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { CartContext } from '../context/CartContext';
import { Web3Context } from '../context/Web3Context';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { buyItem, isConnected, connectWallet, isLoading } = useContext(Web3Context);
  const navigate = useNavigate();
  const [isPurchasing, setIsPurchasing] = useState(false);
  
  const handleAddToCart = () => {
    addToCart(product);
    // Show a success message
    alert(`${product.name} added to cart!`);
  };
  
  const handleBuyNow = async () => {
    // Check if product is already sold
    if (product.sold) {
      alert('This item has already been sold.');
      return;
    }
    
    // Check if wallet is connected
    if (!isConnected) {
      const confirm = window.confirm('Please connect your wallet first. Connect now?');
      if (confirm) {
        await connectWallet();
      }
      return;
    }
    
    try {
      setIsPurchasing(true);
      // Direct blockchain purchase using buyItem function from Web3Context
      const success = await buyItem(product.id, product.price);
      
      if (success) {
        alert(`You've successfully purchased ${product.name}!`);
        // You could redirect to a success page or my purchases page here
      }
    } catch (error) {
      console.error('Purchase failed:', error);
      alert(`Failed to purchase: ${error.message}`);
    } finally {
      setIsPurchasing(false);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <div className="relative">
        <img 
          src={product.image || `https://via.placeholder.com/300x200?text=${product.name}`} 
          alt={product.name}
          className="w-full h-48 object-cover"
        />
        {product.sold && (
          <div className="absolute inset-0 bg-black bg-opacity-60 flex items-center justify-center">
            <span className="text-white font-bold text-lg transform rotate-45">SOLD</span>
          </div>
        )}
      </div>
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 h-12 overflow-hidden">{product.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">{product.price} ETH</span>
          
          <div className="flex space-x-2">
            <button
              onClick={handleAddToCart}
              disabled={product.sold || isPurchasing}
              className={`bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm ${(product.sold || isPurchasing) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              Add to Cart
            </button>
            
            <button
              onClick={handleBuyNow}
              disabled={product.sold || isPurchasing || isLoading}
              className={`bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm ${(product.sold || isPurchasing || isLoading) ? 'opacity-50 cursor-not-allowed' : ''}`}
            >
              {isPurchasing ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        </div>
        
        {product.seller && (
          <div className="mt-2 text-xs text-gray-500">
            Seller: {product.seller.substring(0, 6)}...{product.seller.substring(product.seller.length - 4)}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductCard;