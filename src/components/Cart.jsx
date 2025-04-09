import React, { useContext } from 'react';
import { CartContext } from '../context/CartContext';

const Cart = () => {
  const { cartItems, totalPrice, removeFromCart, clearCart } = useContext(CartContext);
  
  if (cartItems.length === 0) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-semibold mb-4">Your Cart</h2>
        <p className="text-gray-500">Your cart is empty.</p>
      </div>
    );
  }
  
  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">Your Cart</h2>
        <button
          onClick={clearCart}
          className="text-red-500 hover:text-red-700 text-sm"
        >
          Clear Cart
        </button>
      </div>
      
      <div className="divide-y">
        {cartItems.map((item) => (
          <div key={item.id} className="py-4 flex justify-between items-center">
            <div className="flex items-center">
              <img 
                src={item.image || `https://via.placeholder.com/80?text=${item.name}`}
                alt={item.name}
                className="w-16 h-16 object-cover rounded mr-4"
              />
              <div>
                <h3 className="font-medium">{item.name}</h3>
                <p className="text-gray-500 text-sm">{item.category}</p>
              </div>
            </div>
            
            <div className="flex items-center">
              <span className="font-semibold mr-4">{item.price} ETH</span>
              <button
                onClick={() => removeFromCart(item.id)}
                className="text-gray-500 hover:text-red-500"
              >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                  <path fillRule="evenodd" d="M9 2a1 1 0 00-.894.553L7.382 4H4a1 1 0 000 2v10a2 2 0 002 2h8a2 2 0 002-2V6a1 1 0 100-2h-3.382l-.724-1.447A1 1 0 0011 2H9zM7 8a1 1 0 012 0v6a1 1 0 11-2 0V8zm5-1a1 1 0 00-1 1v6a1 1 0 102 0V8a1 1 0 00-1-1z" clipRule="evenodd" />
                </svg>
              </button>
            </div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 pt-4 border-t">
        <div className="flex justify-between items-center mb-4">
          <span className="font-semibold">Total:</span>
          <span className="text-xl font-bold">{totalPrice.toFixed(4)} ETH</span>
        </div>
      </div>
    </div>
  );
};

export default Cart;