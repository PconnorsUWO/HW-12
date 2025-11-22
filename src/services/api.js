import { Platform } from 'react-native';

// Option 1: Use local IP (recommended - no tunnel needed!)
// Make sure your phone and computer are on the same WiFi network
const API_URL = 'http://172.30.54.155:5001';

// Option 2: Use localtunnel (if you need external access)
// Run: npx localtunnel --port 5001
// const API_URL = 'https://bright-apples-relate.loca.lt';

// Option 3: Use ngrok (more stable than localtunnel)
// Run: npx ngrok http 5001
// const API_URL = 'https://YOUR-NGROK-URL.ngrok.io';


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
            body: formData,
            // Don't set Content-Type - browser sets it automatically with boundary
        });

        if (!response.ok) {
            throw new Error(`Server Error: ${response.status}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('API Upload Error:', error);
        throw error;
    }
};
