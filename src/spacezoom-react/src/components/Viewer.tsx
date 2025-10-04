import React from 'react';
import L from 'leaflet';

interface ViewerProps {
    imgUrl: string;
    title: string;
    description: string;
    onClose: () => void;
}

const Viewer: React.FC<ViewerProps> = ({ imgUrl, title, description, onClose }) => {
    const mapRef = React.useRef<HTMLDivElement | null>(null);
    const [map, setMap] = React.useState<L.Map | null>(null);

    React.useEffect(() => {
        if (mapRef.current) {
            const newMap = L.map(mapRef.current).setView([0, 0], 1);
            L.imageOverlay(imgUrl, [[0, 0], [1, 1]]).addTo(newMap);
            newMap.setMaxZoom(10);
            newMap.dragging.enable();
            newMap.touchZoom.enable();
            newMap.doubleClickZoom.enable();
            newMap.scrollWheelZoom.enable();
            setMap(newMap);
        }

        return () => {
            if (map) {
                map.remove();
            }
        };
    }, [imgUrl]);

    return (
        <div id="viewer" style={{ position: 'fixed', top: 0, left: 0, width: '100%', height: '100%', background: 'rgba(0,0,0,0.9)', display: 'block', zIndex: 1000 }}>
            <div id="close" onClick={onClose} style={{ position: 'absolute', top: '10px', right: '10px', color: '#fff', fontSize: '24px', cursor: 'pointer' }}>×</div>
            <div id="map" ref={mapRef} style={{ height: '100%', width: '100%' }}></div>
            <div id="sidebar" style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.7)', padding: '10px', borderRadius: '5px', width: '200px' }}>
                <h3 id="title">{title}</h3>
                <p id="description">{description.substring(0, 200)}...</p>
                <div id="notes">
                    <label>Add Note:</label><br />
                    <textarea id="noteInput" placeholder="e.g., 'Look at that crater!'" style={{ width: '100%', height: '60px', background: '#333', color: '#fff', border: 'none', borderRadius: '3px' }}></textarea>
                    <button onClick={() => alert('Note saved: ' + document.getElementById('noteInput')?.value)}>Save Note</button>
                </div>
                <button onClick={() => navigator.share ? navigator.share({ title, url: window.location.href }) : prompt('Share this link:', window.location.href)}>Share View</button>
            </div>
        </div>
    );
};

export default Viewer;