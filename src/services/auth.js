import AsyncStorage from '@react-native-async-storage/async-storage';
import { API_URL } from '../config';

export class AuthService {
  static async login(username, password) {
    try {
      const response = await fetch(`${API_URL}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ username, password })
      });

      if (response.ok) {
        const { token, userId } = await response.json();
        await AsyncStorage.setItem('userToken', token);
        await AsyncStorage.setItem('userId', userId.toString());
        return { success: true, token, userId };
      }

      const errorData = await response.json();
      return { success: false, error: errorData.error || 'Login failed' };
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: `Network error: ${error.message}` };
    }
  }

  static async register(username, password, allergies) {
    try {
      console.log('Registering with URL:', `${API_URL}/auth/register`);
      console.log('Payload:', { username, password: '***', allergies });

      const response = await fetch(`${API_URL}/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'ngrok-skip-browser-warning': 'true'
        },
        body: JSON.stringify({ username, password, allergies })
      });

      console.log('Response status:', response.status);

      if (response.ok) {
        return { success: true };
      }

      const errorData = await response.json();
      console.log('Error data:', errorData);
      return { success: false, error: errorData.error || 'Registration failed' };
    } catch (error) {
      console.error('Network error details:', error);
      return { success: false, error: `Network error: ${error.message}` };
    }
  }

  static async isLoggedIn() {
    try {
      const token = await AsyncStorage.getItem('userToken');
      return !!token;
    } catch (error) {
      return false;
    }
  }

  static async logout() {
    try {
      await AsyncStorage.multiRemove(['userToken', 'userId']);
    } catch (error) {
      console.error('Logout error:', error);
    }
  }

  static async getUserId() {
    try {
      return await AsyncStorage.getItem('userId');
    } catch (error) {
      return null;
    }
  }

  static async getToken() {
    try {
      return await AsyncStorage.getItem('userToken');
    } catch (error) {
      return null;
    }
  }
}