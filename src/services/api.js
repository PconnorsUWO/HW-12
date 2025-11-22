import { Platform } from 'react-native';

// Option 1: Use local IP (recommended - no tunnel needed!)
// Make sure your phone and computer are on the same WiFi network
const API_URL = 'https://a9fe3dc87504.ngrok-free.app';

// Option 2: Use localtunnel (if you need external access)
// Run: npx localtunnel --port 5001
// const API_URL = 'https://bright-apples-relate.loca.lt';

// Option 3: Use ngrok (more stable than localtunnel)
// Run: npx ngrok http 5001
// const API_URL = 'https://YOUR-NGROK-URL.ngrok.io';


/**
 * Uploads an image to the backend API for analysis
 * @param {string} imageUri - The local file URI of the image to upload
 * @returns {Promise<Object>} The analysis result from the backend
 */
export const uploadImage = async (imageUri) => {
    const formData = new FormData();

    // Extract filename from URI
    const filename = imageUri.split('/').pop() || 'photo.jpg';
    
    // Determine image MIME type from extension
    const match = /\.(\w+)$/.exec(filename);
    const extension = match ? match[1].toLowerCase() : 'jpg';
    const type = `image/${extension === 'jpg' ? 'jpeg' : extension}`;

    // Append image to FormData (React Native format)
    formData.append('image', {
        uri: Platform.OS === 'ios' ? imageUri.replace('file://', '') : imageUri,
        name: filename,
        type: type,
    });

    try {
        console.log(`Uploading image to ${API_URL}/analyze`);
        
        const response = await fetch(`${API_URL}/analyze`, {
            method: 'POST',
            body: formData,
            // Don't set Content-Type - React Native sets it automatically with boundary
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error(`Server error (${response.status}):`, errorText);
            throw new Error(`Server Error: ${response.status} - ${errorText}`);
        }

        const data = await response.json();
        console.log('Upload successful, received analysis data');
        return data;
    } catch (error) {
        console.error('API Upload Error:', error);
        if (error instanceof TypeError && error.message.includes('Network request failed')) {
            throw new Error('Network error: Could not reach the server. Make sure your backend is running and the API_URL is correct.');
        }
        throw error;
    }
};
