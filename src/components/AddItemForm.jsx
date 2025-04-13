import React, { useState, useContext } from 'react';
import { Web3Context } from '../context/Web3Context';

const AddItemForm = ({ onSuccess, onCancel }) => {
  const { createListing, isConnected, connectWallet, isLoading } = useContext(Web3Context);

  const [formData, setFormData] = useState({
    name: '',
    description: '',
    price: '',
    image: '',
    category: 'cricket', // Default category
  });

  const [errors, setErrors] = useState({});
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });

    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.description.trim()) {
      newErrors.description = 'Description is required';
    }
    
    if (!formData.price) {
      newErrors.price = 'Price is required';
    } else if (isNaN(parseFloat(formData.price)) || parseFloat(formData.price) <= 0) {
      newErrors.price = 'Price must be a positive number';
    }
    
    if (!formData.image.trim()) {
      newErrors.image = 'Image URL is required';
    }
    
    if (!formData.category.trim()) {
      newErrors.category = 'Category is required';
    }
    
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Validate form
    const formErrors = validateForm();
    if (Object.keys(formErrors).length > 0) {
      setErrors(formErrors);
      return;
    }
    
    // Check if wallet is connected
    if (!isConnected) {
      const confirm = window.confirm('You need to connect your wallet to create a listing. Connect now?');
      if (confirm) {
        try {
          await connectWallet();
        } catch (error) {
          alert('Failed to connect wallet. Please try again.');
          return;
        }
      } else {
        return;
      }
    }
    
    try {
      setIsSubmitting(true);
      
      const success = await createListing(
        formData.name,
        formData.description,
        formData.image,
        formData.price,
        formData.category
      );
      
      if (success) {
        alert('Item listed successfully!');
        if (onSuccess) {
          onSuccess();
        }
      }
    } catch (error) {
      console.error('Error listing item:', error);
      alert(`Failed to list item: ${error.message}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-2xl font-bold mb-6">Add New Item</h2>
      
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Name</label>
          <input
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.name ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Item name"
            disabled={isSubmitting}
          />
          {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Description</label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.description ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="Item description"
            rows="3"
            disabled={isSubmitting}
          ></textarea>
          {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Price (ETH)</label>
          <input
            type="number"
            name="price"
            value={formData.price}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.price ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="0.01"
            step="0.001"
            min="0"
            disabled={isSubmitting}
          />
          {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price}</p>}
        </div>
        
        <div className="mb-4">
          <label className="block text-gray-700 mb-2">Image URL</label>
          <input
            type="text"
            name="image"
            value={formData.image}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.image ? 'border-red-500' : 'border-gray-300'}`}
            placeholder="https://example.com/image.jpg"
            disabled={isSubmitting}
          />
          {errors.image && <p className="text-red-500 text-sm mt-1">{errors.image}</p>}
        </div>
        
        <div className="mb-6">
          <label className="block text-gray-700 mb-2">Category</label>
          <select
            name="category"
            value={formData.category}
            onChange={handleChange}
            className={`w-full p-2 border rounded ${errors.category ? 'border-red-500' : 'border-gray-300'}`}
            disabled={isSubmitting}
          >
            <option value="cricket">Cricket</option>
            <option value="football">Football</option>
            <option value="badminton">Badminton</option>
          </select>
          {errors.category && <p className="text-red-500 text-sm mt-1">{errors.category}</p>}
        </div>
        
        <div className="flex justify-end space-x-4">
          <button
            type="button"
            onClick={onCancel}
            className="px-4 py-2 bg-gray-300 hover:bg-gray-400 rounded"
            disabled={isSubmitting || isLoading}
          >
            Cancel
          </button>
          <button
            type="submit"
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded"
            disabled={isSubmitting || isLoading}
          >
            {isSubmitting || isLoading ? 'Processing...' : 'Add Item'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddItemForm;
