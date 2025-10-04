# SpaceZoom Explorer

## Overview
SpaceZoom Explorer is a React application that allows users to explore high-resolution images from NASA's vast collection. Users can search for images, view them in a gallery, and open a detailed viewer with additional features such as adding notes and sharing images.

## Features
- Search for images using keywords.
- Display images in a responsive grid gallery.
- View selected images in a full-screen viewer with a map overlay.
- Add personal notes to images.
- Share images via a shareable link.

## Project Structure
```
spacezoom-react
├── public
│   └── index.html          # Main HTML document
├── src
│   ├── components          # React components
│   │   ├── Gallery.tsx     # Image gallery component
│   │   ├── Viewer.tsx      # Full-screen image viewer component
│   │   └── SearchBar.tsx   # Search input component
│   ├── services            # API connection
│   │   └── nasaApi.ts      # NASA API service
│   ├── hooks               # Custom hooks
│   │   └── useNasaSearch.ts # Hook for managing NASA image search
│   ├── App.tsx             # Main application component
│   ├── index.tsx           # Entry point of the application
│   ├── styles              # CSS styles
│   │   └── main.css        # Main stylesheet
│   └── types               # TypeScript types
│       └── index.d.ts      # Type definitions
├── package.json            # npm configuration
├── tsconfig.json           # TypeScript configuration
└── README.md               # Project documentation
```

## Installation
1. Clone the repository:
   ```
   git clone https://github.com/yourusername/spacezoom-react.git
   ```
2. Navigate to the project directory:
   ```
   cd spacezoom-react
   ```
3. Install the dependencies:
   ```
   npm install
   ```

## Usage
1. Start the development server:
   ```
   npm start
   ```
2. Open your browser and navigate to `http://localhost:3000` to view the application.

## API
The application fetches images from the NASA API. The API connection is handled in the `src/services/nasaApi.ts` file, which exports a function to retrieve images based on a search query.

## Contributing
Contributions are welcome! Please open an issue or submit a pull request for any enhancements or bug fixes.

## License
This project is licensed under the MIT License. See the LICENSE file for details.