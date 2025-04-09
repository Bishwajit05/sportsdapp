import React, { useState, useEffect, useContext } from 'react';
import { Web3Context } from '../context/Web3Context';
import ProductCard from '../components/ProductCard';

const Profile = () => {
  const { account, isConnected, connectWallet, contract } = useContext(Web3Context);
  const [myListings, setMyListings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    image: '',
    price: '',
    category: 'cricket'
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  useEffect(() => {
    const fetchMyListings = async () => {
      if (!isConnected || !contract) {
        setLoading(false);
        return;
      }
      
      try {
        const items = await contract.fetchMyItems();
        const formattedItems = items.map(item => ({
          id: item.itemId.toNumber(),
          name: item.name,
          description: item.description,
          image: item.image,
          price: item.price.toString() / 1e18,
          category: item.category,
          seller: item.seller,
          sold: item.sold
        }));
        
        setMyListings(formattedItems);
      } catch (error) {
        console.error('Error fetching user listings:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchMyListings();
  }, [isConnected, contract]);
  
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!isConnected) {
      alert('Please connect your wallet first!');
      return;
    }
    
    if (!formData.name || !formData.description || !formData.price || !formData.category) {
      alert('Please fill all required fields');
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      // Use a placeholder image if none provided
      const imageUrl = formData.image || `https://via.placeholder.com/300x200?text=${encodeURIComponent(formData.name)}`;
      
      const priceInEth = parseFloat(formData.price);
      const tx = await contract.createMarketItem(
        formData.name,
        formData.description,
        imageUrl,
        ethers.utils.parseEther(priceInEth.toString()),
        formData.category
      );
      
      await tx.wait();
      
      alert('Item listed successfully!');
      
      // Reset form
      setFormData({
        name: '',
        description: '',
        image: '',
        price: '',
        category: 'cricket'
      });
      
      // Refresh listings
      const items = await contract.fetchMyItems();
      const formattedItems = items.map(item => ({
        id: item.itemId.toNumber(),
        name: item.name,
        description: item.description,
        image: item.image,
        price: item.price.toString() / 1e18,
        category: item.category,
        seller: item.seller,
        sold: item.sold
      }));
      
      setMyListings(formattedItems);
    } catch (error) {
      console.error('Error creating listing:', error);
      alert('Failed to list item. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };
  
  if (!isConnected) {
    return (
      <div className="container mx-auto px-4 py-16 text-center">
        <h1 className="text-3xl font-bold mb-6">My Profile</h1>
        <p className="mb-6">Please connect your wallet to view your profile and listings.</p>
        <button
          onClick={connectWallet}
          className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-6 rounded-lg font-semibold"
        >
          Connect Wallet
        </button>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">My Profile</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-8">
        <div className="flex items-center mb-6">
          <div className="bg-blue-100 text-blue-600 rounded-full w-16 h-16 flex items-center justify-center mr-4">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-8 w-8" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
            </svg>
          </div>
          <div>
            <h2 className="text-xl font-semibold">My Wallet</h2>
            <p className="text-gray-600 font-mono">{account}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-1">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">List New Item</h2>
            
            <form onSubmit={handleSubmit}>
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="name">
                  Item Name *
                </label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                />
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="description">
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  rows="4"
                  required
                ></textarea>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="image">
                  Image URL
                </label>
                <input
                  type="url"
                  id="image"
                  name="image"
                  value={formData.image}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  placeholder="https://example.com/image.jpg"
                />
                <p className="text-xs text-gray-500 mt-1">Leave empty for a placeholder image</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="price">
                  Price (ETH) *
                </label>
                <input
                  type="number"
                  id="price"
                  name="price"
                  value={formData.price}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  min="0.0001"
                  step="0.01"
                  required
                />
              </div>
              
              <div className="mb-6">
                <label className="block text-gray-700 text-sm font-bold mb-2" htmlFor="category">
                  Category *
                </label>
                <select
                  id="category"
                  name="category"
                  value={formData.category}
                  onChange={handleChange}
                  className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
                  required
                >
                  <option value="cricket">Cricket</option>
                  <option value="football">Football</option>
                  <option value="badminton">Badminton</option>
                </select>
              </div>
              
              <button
                type="submit"
                disabled={isSubmitting}
                className={`w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
                  isSubmitting ? 'opacity-50 cursor-not-allowed' : ''
                }`}
              >
                {isSubmitting ? 'Creating...' : 'Create Listing'}
              </button>
            </form>
          </div>
        </div>
        
        <div className="lg:col-span-2">
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">My Listings</h2>
            
            {loading ? (
              <div className="flex justify-center items-center h-64">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
              </div>
            ) : myListings.length === 0 ? (
              <div className="text-center py-12">
                <p className="text-lg text-gray-600">You haven't created any listings yet.</p>
                <p className="text-gray-500 mt-2">Use the form on the left to create your first listing!</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {myListings.map(item => (
                  <div key={item.id} className="bg-gray-50 p-4 rounded-lg relative">
                    <ProductCard product={item} />
                    {item.sold && (
                      <div className="absolute top-0 right-0 bg-red-500 text-white px-3 py-1 rounded-bl-lg font-semibold">
                        Sold
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Profile;