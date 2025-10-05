import axios from 'axios';

const API_URL = 'https://images-api.nasa.gov/search';

export const fetchNasaImages = async (query: string) => {
    try {
        const response = await axios.get(`${API_URL}?q=${encodeURIComponent(query)}&media_type=image`);
        return response.data.collection?.items || [];
    } catch (error) {
        console.error('Error fetching images from NASA API:', error);
        throw error;
    }
};