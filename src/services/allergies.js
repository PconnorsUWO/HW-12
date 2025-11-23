import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export class AllergyService {
  static async getUserAllergies() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return [];

      const response = await fetch(`${API_URL}/user/allergies`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'ngrok-skip-browser-warning': 'true'
        }
      });

      if (response.ok) {
        const data = await response.json();
        return data.allergies || [];
      }

      return [];
    } catch (error) {
      console.error('Failed to fetch allergies:', error);
      return [];
    }
  }

  static async updateAllergies(allergies) {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) return false;

      const response = await fetch(`${API_URL}/user/allergies`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ allergies })
      });

      return response.ok;
    } catch (error) {
      console.error('Failed to update allergies:', error);
      return false;
    }
  }

  static checkForAllergies(ingredients, userAllergies) {
    if (!ingredients || !userAllergies) return [];

    const dangerousIngredients = [];

    ingredients.forEach(ingredient => {
      const ingredientName = typeof ingredient === 'string' ? ingredient : ingredient.name;

      userAllergies.forEach(allergy => {
        if (ingredientName.toLowerCase().includes(allergy.toLowerCase())) {
          dangerousIngredients.push(ingredientName);
        }
      });
    });

    return [...new Set(dangerousIngredients)]; // Remove duplicates
  }
}