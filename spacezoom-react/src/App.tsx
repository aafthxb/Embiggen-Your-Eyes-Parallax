import React, { useState } from 'react';
import SearchBar from './components/SearchBar';
import Gallery from './components/Gallery';
import Viewer from './components/Viewer';
import { ImageData } from './types';

const App: React.FC = () => {
    const [selectedImage, setSelectedImage] = useState<ImageData | null>(null);
    const [searchQuery, setSearchQuery] = useState<string>('');

    const handleImageSelect = (image: ImageData) => {
        setSelectedImage(image);
    };

    const handleCloseViewer = () => {
        setSelectedImage(null);
    };

    return (
        <div>
            <header>
                <h1>SpaceZoom Explorer</h1>
                <p>Embiggen Your Eyes! Dive into NASA's high-res space imagery.</p>
            </header>
            <SearchBar setSearchQuery={setSearchQuery} />
            <Gallery searchQuery={searchQuery} onImageSelect={handleImageSelect} />
            {selectedImage && (
                <Viewer image={selectedImage} onClose={handleCloseViewer} />
            )}
        </div>
    );
};

export default App;