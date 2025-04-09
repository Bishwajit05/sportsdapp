import { useState } from 'react';
import { createMarketItem, buyMarketItem } from '../services/web3Service';

export function useMarketplace() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const createItem = async (itemDetails) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await createMarketItem(itemDetails);
      setIsLoading(false);
      return result;
    } catch (err) {
      setIsLoading(false);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  const purchaseItem = async (itemId, price) => {
    setIsLoading(true);
    setError(null);

    try {
      const result = await buyMarketItem(itemId, price);
      setIsLoading(false);
      return result;
    } catch (err) {
      setIsLoading(false);
      setError(err.message);
      return { success: false, message: err.message };
    }
  };

  return {
    createItem,
    purchaseItem,
    isLoading,
    error
  };
}   