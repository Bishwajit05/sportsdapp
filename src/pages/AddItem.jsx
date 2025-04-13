import React from 'react';
import AddItemForm from '../components/AddItemForm';
import { useNavigate } from 'react-router-dom';

const AddItem = () => {
  const navigate = useNavigate();

  const handleSuccess = () => {
    // Navigate to home page after successful listing
    navigate('/');
  };

  const handleCancel = () => {
    // Go back to previous page
    navigate(-1);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-6">Add New Item</h1>
      <div className="bg-white rounded-lg shadow-lg p-6">
        <AddItemForm 
          onSuccess={handleSuccess}
          onCancel={handleCancel}
        />
      </div>
    </div>
  );
};

export default AddItem;
