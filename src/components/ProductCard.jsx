import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';
import { Web3Context } from '../context/Web3Context';

const ProductCard = ({ product }) => {
  const { addToCart } = useContext(CartContext);
  const { buyItem, isConnected } = useContext(Web3Context);
  
  const handleAddToCart = () => {
    addToCart(product);
  };
  
  const handleBuyNow = async () => {
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    
    const success = await buyItem(product.id, product.price);
    if (success) {
      alert(`Successfully purchased ${product.name}!`);
    }
  };
  
  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden">
      <img 
        src={product.image || `https://via.placeholder.com/300x200?text=${product.name}`} 
        alt={product.name}
        className="w-full h-48 object-cover"
      />
      
      <div className="p-4">
        <h3 className="text-lg font-semibold mb-2">{product.name}</h3>
        <p className="text-gray-600 text-sm mb-3 h-12 overflow-hidden">{product.description}</p>
        
        <div className="flex justify-between items-center">
          <span className="text-lg font-bold">{product.price} ETH</span>
          
          <div className="flex space-x-2">
            <button
              onClick={handleAddToCart}
              className="bg-blue-500 hover:bg-blue-600 text-white py-1 px-3 rounded text-sm"
            >
              Add to Cart
            </button>
            
            <button
              onClick={handleBuyNow}
              className="bg-green-500 hover:bg-green-600 text-white py-1 px-3 rounded text-sm"
            >
              Buy Now
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProductCard;