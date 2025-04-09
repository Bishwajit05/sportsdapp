import React from 'react';
import ShopCategory from '../components/ShopCategory';

const Football = () => {
  return (
    <div>
      <div className="bg-blue-700 text-white py-12">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold">Football Memorabilia</h1>
          <p className="mt-2">Collectibles from football legends and major tournaments around the world.</p>
        </div>
      </div>
      
      <ShopCategory category="Football" />
    </div>
  );
};

export default Football;