import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Info, Search, X } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface NasaImage {
  id: string;
  title: string;
  description: string;
  lowQuality: string;
  mediumQuality: string;
  highQuality: string;
}

const SpaceGallery = () => {
  const [query, setQuery] = useState("galaxy");
  const [searchTerm, setSearchTerm] = useState("galaxy");
  const [images, setImages] = useState<NasaImage[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedImage, setSelectedImage] = useState<NasaImage | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });

  const API_URL = 'https://images-api.nasa.gov/search';

  useEffect(() => {
    const fetchImages = async () => {
      setLoading(true);
      setError(null);
      setImages([]);

      try {
        const response = await fetch(`${API_URL}?q=${encodeURIComponent(searchTerm)}&media_type=image`);
        if (!response.ok) {
          throw new Error('Failed to fetch images from NASA API.');
        }
        const data = await response.json();
        const items = data.collection?.items || [];
        
        const imageData: NasaImage[] = items.slice(0, 100).map((item: any) => ({
          id: item.data?.[0]?.nasa_id || item.href,
          title: item.data?.[0]?.title || 'No Title',
          description: item.data?.[0]?.description || 'No Description Available.',
          lowQuality: item.links?.find((l: any) => l.render === 'image')?.href.replace('~orig', '~thumb') || '',
          mediumQuality: item.links?.find((l: any) => l.render === 'image')?.href.replace('~orig', '~medium') || '',
          highQuality: item.links?.find((l: any) => l.render === 'image')?.href.replace('~orig', '~orig') || '',
        })).filter((img: NasaImage) => img.lowQuality);

        setImages(imageData);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An unknown error occurred.');
      } finally {
        setLoading(false);
      }
    };

    fetchImages();
  }, [searchTerm]);

  const getImageUrl = (image: NasaImage) => {
    if (zoom <= 1.5) return image.lowQuality;
    if (zoom <= 3) return image.mediumQuality;
    return image.highQuality;
  };

  const getQuality = () => {
    if (zoom <= 1.5) return "Low";
    if (zoom <= 3) return "Medium";
    return "High";
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 5));
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 1));
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (zoom > 1) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleImageSelect = (image: NasaImage) => {
    setSelectedImage(image);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleCloseViewer = () => {
    handleReset();
    setSelectedImage(null);
  };

  const handleSearch = () => {
    setSearchTerm(query);
  };


  return (
    <div className="min-h-screen space-gradient relative">
      <style dangerouslySetInnerHTML={{ __html: `::-webkit-scrollbar { display: none; } body { scrollbar-width: none; }` }} />
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(100)].map((_, i) => (
          <div
            key={i}
            className="absolute rounded-full bg-white animate-pulse"
            style={{
              width: `${Math.random() * 3 + 1}px`,
              height: `${Math.random() * 3 + 1}px`,
              top: `${Math.random() * 100}%`,
              left: `${Math.random() * 100}%`,
              opacity: Math.random() * 0.7 + 0.3,
              animationDuration: `${Math.random() * 3 + 2}s`,
              animationDelay: `${Math.random() * 2}s`
            }}
          />
        ))}
      </div>

      {/* Main content */}
      <div className="relative z-10">
        <header className="container mx-auto px-4 py-8 text-center">
          <div className="absolute top-4 left-4">
            <Link to="/">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </Link>
          </div>

          <h1 className="text-5xl font-bold mb-4 gradient-text">Space gallery</h1>
          <p className="text-muted-foreground mb-6">Dive into NASA's high-res space imagery.</p>

          <div className="flex justify-center gap-2">
            <div className="relative max-w-md flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search e.g., 'Mars rover' or 'nebula'"
                className="pl-10 bg-background/20 border-primary/30 focus:ring-primary"
              />
              {query && (
                <Button variant="ghost" size="icon" onClick={() => setQuery("")} className="absolute right-1 top-1/2 -translate-y-1/2 h-7 w-7">
                  <X className="h-4 w-4" />
                </Button>
              )}
            </div>
            <Button onClick={handleSearch} disabled={loading}>
              {loading ? "Exploring..." : "Explore"}
            </Button>
          </div>
        </header>

        {/* Gallery Grid */}
        <main className="container mx-auto px-4 pb-16">
          {loading && <p className="text-center text-lg text-muted-foreground">Loading images for "{searchTerm}"...</p>}
          {error && <p className="text-center text-red-400">{error}</p>}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-6">
            {images.map((image) => (
              <Card
                key={image.id}
                onClick={() => handleImageSelect(image)}
                className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl overflow-hidden group glass-panel"
              >
                <img
                  src={image.lowQuality}
                  alt={image.title}
                  className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-110"
                />
              </Card>
            ))}
          </div>

          {!loading && images.length === 0 && (
            <div className="text-center py-16">
              <div className="text-6xl mb-4">🔭</div>
              <h2 className="text-2xl font-bold mb-2">No images found for "{searchTerm}"</h2>
              <p className="text-muted-foreground">Try a different search term.</p>
            </div>
          )}
        </main>
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center" onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white line-clamp-1">{selectedImage.title}</h2>
              <p className="text-sm text-white/70 mt-1">
                Zoom: {zoom.toFixed(1)}x • Quality: {getQuality()}
              </p>
            </div>

            <div className="flex gap-2">
              <Button
                onClick={handleZoomOut}
                disabled={zoom <= 1}
                variant="secondary"
                size="icon"
              >
                <ZoomOut className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleZoomIn}
                disabled={zoom >= 5}
                variant="secondary"
                size="icon"
              >
                <ZoomIn className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleReset}
                variant="secondary"
                size="icon"
              >
                <RotateCcw className="h-5 w-5" />
              </Button>
              <Button
                onClick={handleCloseViewer}
                variant="secondary"
                size="icon"
              >
                <X className="h-5 w-5" />
              </Button>
            </div>
          </div>

          <div
            className="w-full h-full"
            style={{ cursor: zoom > 1 ? 'move' : 'default' }}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
          >
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
              }}
            >
              <img
                src={getImageUrl(selectedImage)}
                alt={selectedImage.title}
                className="max-w-full max-h-full object-contain select-none"
                draggable={false}
                key={`${selectedImage.id}-${getQuality()}`}
              />
            </div>
          </div>

          {zoom === 1 && pan.x === 0 && pan.y === 0 && (
            <div className="absolute bottom-8 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 rounded-lg">
              <p className="text-sm flex items-center gap-2 text-white">
                <Info className="h-4 w-4" />
                Use zoom buttons to see higher quality • Drag to pan when zoomed
              </p>
            </div>
          )}

          <div className="absolute bottom-4 left-4 right-4 glass-panel p-4 rounded-lg">
            <p className="text-sm text-white/90 line-clamp-2">{selectedImage.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceGallery;
