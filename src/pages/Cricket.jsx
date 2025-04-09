import React from 'react';
import ShopCategory from '../components/ShopCategory';

const Cricket = () => {
  return (
    <div>
      <div className="bg-green-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Cricket Memorabilia</h1>
          <p className="mt-2">Authentic cricket memorabilia from legendary players and historic matches.</p>
        </div>
      </div>
      
      <ShopCategory category="Cricket" />
    </div>
  );
};

export default Cricket;