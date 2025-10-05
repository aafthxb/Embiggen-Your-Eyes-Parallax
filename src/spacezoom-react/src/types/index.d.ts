// This file defines TypeScript types and interfaces used throughout the application, ensuring type safety.

interface NasaImage {
    href: string;
    title: string;
    description: string;
}

interface NasaApiResponse {
    collection: {
        items: NasaImage[];
    };
}

interface Note {
    id: string;
    content: string;
}

interface ViewerProps {
    imageUrl: string;
    title: string;
    description: string;
    onClose: () => void;
    onAddNote: (note: Note) => void;
    onShare: () => void;
}