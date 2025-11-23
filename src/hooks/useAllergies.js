import { useState, useEffect } from 'react';
import { AllergyService } from '../services/allergies';

export function useAllergies() {
  const [allergies, setAllergies] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadAllergies = async () => {
    setIsLoading(true);
    try {
      const userAllergies = await AllergyService.getUserAllergies();
      setAllergies(userAllergies);
    } catch (error) {
      console.error('Failed to load allergies:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateAllergies = async (newAllergies) => {
    try {
      const success = await AllergyService.updateAllergies(newAllergies);
      if (success) {
        setAllergies(newAllergies);
      }
      return success;
    } catch (error) {
      console.error('Failed to update allergies:', error);
      return false;
    }
  };

  useEffect(() => {
    loadAllergies();
  }, []);

  return {
    allergies,
    isLoading,
    updateAllergies,
    loadAllergies,
    checkForAllergies: AllergyService.checkForAllergies
  };
}