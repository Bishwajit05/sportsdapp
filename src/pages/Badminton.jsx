import React from 'react';
import ShopCategory from '../components/ShopCategory';

const Badminton = () => {
  return (
    <div>
      <div className="bg-purple-600 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Badminton Memorabilia</h1>
          <p className="mt-2">Rare badminton memorabilia from champions and international competitions.</p>
        </div>
      </div>
      
      <ShopCategory category="Badminton" />
    </div>
  );
};

export default Badminton;