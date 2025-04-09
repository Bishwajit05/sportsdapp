import React, { createContext, useState, useEffect } from 'react';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
  const [cartItems, setCartItems] = useState([]);
  const [totalPrice, setTotalPrice] = useState(0);
  
  // Load cart from localStorage on initial render
  useEffect(() => {
    const savedCart = localStorage.getItem('sportsMarketplaceCart');
    if (savedCart) {
      try {
        const parsedCart = JSON.parse(savedCart);
        setCartItems(parsedCart);
      } catch (error) {
        console.error('Error parsing cart from localStorage:', error);
      }
    }
  }, []);
  
  // Update localStorage whenever cart changes
  useEffect(() => {
    localStorage.setItem('sportsMarketplaceCart', JSON.stringify(cartItems));
    
    // Calculate total price
    const newTotal = cartItems.reduce((sum, item) => sum + parseFloat(item.price), 0);
    setTotalPrice(newTotal);
  }, [cartItems]);
  
  // Add item to cart
  const addToCart = (item) => {
    // Check if item already exists in cart
    const itemExists = cartItems.find(cartItem => cartItem.id === item.id);
    
    if (itemExists) {
      // If item exists, just return (no duplicates)
      return;
    } else {
      // Add new item to cart
      setCartItems([...cartItems, item]);
    }
  };
  
  // Remove item from cart
  const removeFromCart = (itemId) => {
    setCartItems(cartItems.filter(item => item.id !== itemId));
  };
  
  // Clear the entire cart
  const clearCart = () => {
    setCartItems([]);
  };
  
  return (
    <CartContext.Provider
      value={{
        cartItems,
        totalPrice,
        addToCart,
        removeFromCart,
        clearCart
      }}
    >
      {children}
    </CartContext.Provider>
  );
};