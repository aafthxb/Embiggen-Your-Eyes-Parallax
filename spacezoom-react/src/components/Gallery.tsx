import React from 'react';
import { useNasaSearch } from '../hooks/useNasaSearch';
import { Viewer } from './Viewer';
import { SearchBar } from './SearchBar';

const Gallery: React.FC = () => {
    const { images, loading, error, searchImages } = useNasaSearch();
    const [selectedImage, setSelectedImage] = React.useState<string | null>(null);

    const handleImageClick = (imgUrl: string) => {
        setSelectedImage(imgUrl);
    };

    const closeViewer = () => {
        setSelectedImage(null);
    };

    return (
        <div>
            <SearchBar onSearch={searchImages} />
            {loading && <p>Loading...</p>}
            {error && <p>Error loading images. Try again!</p>}
            <div className="gallery">
                {images.map((item) => (
                    <div className="thumbnail" key={item.links[0].href} onClick={() => handleImageClick(item.links[0].href)}>
                        <img src={item.links[0].href} alt={item.data[0].title} />
                    </div>
                ))}
            </div>
            {selectedImage && <Viewer imgUrl={selectedImage} onClose={closeViewer} />}
        </div>
    );
};

export default Gallery;