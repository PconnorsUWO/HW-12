import { Platform } from 'react-native';

import { AllergyService } from './allergies';
import { API_URL } from '../config';


export const uploadImage = async (imageUri) => {
    const formData = new FormData();

    const filename = imageUri.split('/').pop();
    const match = /\.(\w+)$/.exec(filename);
    const type = match ? `image/${match[1]}` : `image`;

    formData.append('image', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        name: filename,
        type,
    });

    try {
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            headers: {
                'ngrok-skip-browser-warning': 'true'
            },
            body: formData,
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();

        // Check for user allergies
        try {
            const userAllergies = await AllergyService.getUserAllergies();
            const dangerousIngredients = AllergyService.checkForAllergies(
                data.analysis?.ingredients || [],
                userAllergies
            );

            return {
                ...data,
                allergyWarning: {
                    hasDangerousIngredients: dangerousIngredients.length > 0,
                    dangerousIngredients
                }
            };
        } catch (allergyError) {
            console.warn('Allergy check failed:', allergyError);
            return {
                ...data,
                allergyWarning: {
                    hasDangerousIngredients: false,
                    dangerousIngredients: []
                }
            };
        }
    } catch (error) {
        console.error('API Upload Error:', error);
        throw error;
    }
};

export { API_URL };