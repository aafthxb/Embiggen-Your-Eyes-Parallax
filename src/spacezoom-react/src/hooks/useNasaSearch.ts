import { useState, useEffect } from 'react';
import { fetchNasaImages } from '../services/nasaApi';

const useNasaSearch = (query) => {
    const [images, setImages] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const searchImages = async () => {
            setLoading(true);
            setError(null);
            try {
                const data = await fetchNasaImages(query);
                setImages(data.collection?.items || []);
            } catch (err) {
                setError('Error loading images. Try again!');
            } finally {
                setLoading(false);
            }
        };

        if (query) {
            searchImages();
        }
    }, [query]);

    return { images, loading, error };
};

export default useNasaSearch;