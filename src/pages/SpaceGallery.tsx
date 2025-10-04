import { useState, useEffect, useRef } from "react";
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Info, Search, X } from "lucide-react";
import { useState, useRef, useMemo } from "react";
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Info, Search, X, Dice6, SplitSquareVertical } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

interface NasaImage {
interface GalleryImage {
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
const galleryImages: GalleryImage[] = [
  {
    id: "pillars-of-creation",
    title: "Pillars of Creation",
    description: "Stunning view of the Eagle Nebula captured by the James Webb Space Telescope",
    lowQuality: "https://images-assets.nasa.gov/image/PIA23128/PIA23128~thumb.jpg",
    mediumQuality: "https://images-assets.nasa.gov/image/PIA23128/PIA23128~medium.jpg",
    highQuality: "https://images-assets.nasa.gov/image/PIA23128/PIA23128~orig.jpg"
  },
  {
    id: "hubble-deep-field",
    title: "Hubble Deep Field",
    description: "A glimpse into the distant universe showing thousands of galaxies",
    lowQuality: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001327/GSFC_20171208_Archive_e001327~thumb.jpg",
    mediumQuality: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001327/GSFC_20171208_Archive_e001327~medium.jpg",
    highQuality: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e001327/GSFC_20171208_Archive_e001327~orig.jpg"
  },
  {
    id: "carina-nebula",
    title: "Carina Nebula",
    description: "Cosmic cliffs in the Carina Nebula - one of Webb's first images",
    lowQuality: "https://images-assets.nasa.gov/image/PIA16695/PIA16695~thumb.jpg",
    mediumQuality: "https://images-assets.nasa.gov/image/PIA16695/PIA16695~medium.jpg",
    highQuality: "https://images-assets.nasa.gov/image/PIA16695/PIA16695~orig.jpg"
  },
  {
    id: "jupiter",
    title: "Jupiter's Great Red Spot",
    description: "Close-up view of Jupiter's iconic storm system",
    lowQuality: "https://images-assets.nasa.gov/image/PIA21775/PIA21775~thumb.jpg",
    mediumQuality: "https://images-assets.nasa.gov/image/PIA21775/PIA21775~medium.jpg",
    highQuality: "https://images-assets.nasa.gov/image/PIA21775/PIA21775~orig.jpg"
  },
  {
    id: "andromeda",
    title: "Andromeda Galaxy",
    description: "Our nearest spiral galaxy neighbor, 2.5 million light-years away",
    lowQuality: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000393/GSFC_20171208_Archive_e000393~thumb.jpg",
    mediumQuality: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000393/GSFC_20171208_Archive_e000393~medium.jpg",
    highQuality: "https://images-assets.nasa.gov/image/GSFC_20171208_Archive_e000393/GSFC_20171208_Archive_e000393~orig.jpg"
  },
  {
    id: "orion-nebula",
    title: "Orion Nebula",
    description: "A stellar nursery where new stars are being born",
    lowQuality: "https://images-assets.nasa.gov/image/PIA04227/PIA04227~thumb.jpg",
    mediumQuality: "https://images-assets.nasa.gov/image/PIA04227/PIA04227~medium.jpg",
    highQuality: "https://images-assets.nasa.gov/image/PIA04227/PIA04227~orig.jpg"
  }
];

const SpaceGallery = () => {
  const [selectedImage, setSelectedImage] = useState<GalleryImage | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [touchPinchStartDistance, setTouchPinchStartDistance] = useState<number | null>(null);
  const [pinchStartZoom, setPinchStartZoom] = useState<number>(1);
  const [starCount, setStarCount] = useState<number>(100);
  const modalRef = useRef<HTMLDivElement | null>(null);

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

  // lock body scrolling when viewer is open
  useEffect(() => {
    const original = document.body.style.overflow;
    if (selectedImage) document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = original;
    };
  }, [selectedImage]);

  // responsive star count and reduced motion handling
  useEffect(() => {
    const updateStars = () => {
      const w = window.innerWidth;
      if (w < 480) setStarCount(30);
      else if (w < 768) setStarCount(50);
      else if (w < 1280) setStarCount(80);
      else setStarCount(120);
    };
    updateStars();
    window.addEventListener('resize', updateStars);
    return () => window.removeEventListener('resize', updateStars);
  }, []);

  // keyboard accessibility: Escape to close, arrow nav
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      if (e.key === 'Escape') handleCloseViewer();
      if (e.key === 'ArrowLeft') {
        const idx = images.findIndex(i => i.id === selectedImage.id);
        if (idx > 0) handleImageSelect(images[idx - 1]);
      }
      if (e.key === 'ArrowRight') {
        const idx = images.findIndex(i => i.id === selectedImage.id);
        if (idx >= 0 && idx < images.length - 1) handleImageSelect(images[idx + 1]);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [selectedImage, images]);

  // focus modal when opened
  useEffect(() => {
    if (selectedImage && modalRef.current) {
      // slight delay to ensure element is focusable
      setTimeout(() => modalRef.current?.focus(), 50);
    }
  }, [selectedImage]);

  // Touch handlers for pinch-to-zoom and pan
  const getDistance = (t1: any, t2: any) => {
    const dx = t1.clientX - t2.clientX;
    const dy = t1.clientY - t2.clientY;
    return Math.hypot(dx, dy);
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (e.touches.length === 2) {
      const d = getDistance(e.touches[0], e.touches[1]);
      setTouchPinchStartDistance(d);
      setPinchStartZoom(zoom);
    } else if (e.touches.length === 1 && zoom > 1) {
      const t = e.touches[0];
      setIsDragging(true);
      setDragStart({ x: t.clientX - pan.x, y: t.clientY - pan.y });
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (e.touches.length === 2 && touchPinchStartDistance) {
      const d = getDistance(e.touches[0], e.touches[1]);
      const ratio = d / touchPinchStartDistance;
      const newZoom = Math.min(Math.max(pinchStartZoom * ratio, 1), 5);
      setZoom(newZoom);
    } else if (e.touches.length === 1 && isDragging) {
      const t = e.touches[0];
      setPan({ x: t.clientX - dragStart.x, y: t.clientY - dragStart.y });
    }
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (e.touches.length < 2) {
      setTouchPinchStartDistance(null);
    }
    if (e.touches.length === 0) {
      setIsDragging(false);
    }
  };

  const getImageUrl = (image: NasaImage) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [showGallery, setShowGallery] = useState(true);
  const galleryRef = useRef<HTMLDivElement>(null);

  const getImageUrl = (image: GalleryImage) => {
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
  const handleImageSelect = (image: GalleryImage) => {
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

    setSelectedImage(null);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const handleSearch = () => {
    setShowGallery(true);
    galleryRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  const filteredImages = galleryImages.filter(
    (image) =>
      image.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      image.description.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Background Stars 
  const stars = useMemo(
  () =>
    Array.from({ length: 100 }, (_, i) => ({
      id: i,
      size: Math.random() * 3 + 1,
      top: Math.random() * 100,
      left: Math.random() * 100,
      opacity: Math.random() * 0.7 + 0.3,
      duration: Math.random() * 3 + 2,
      delay: Math.random() * 2,
    })),
  []
);

  return (
    <div className="min-h-screen space-gradient relative">
      <style dangerouslySetInnerHTML={{ __html: `::-webkit-scrollbar { display: none; } body { scrollbar-width: none; }` }} />
      {/* Animated stars background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none" aria-hidden>
        {[...Array(starCount)].map((_, i) => (
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
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {stars.map((star) => (
        <div
          key={star.id}
          className="absolute rounded-full bg-white animate-pulse"
          style={{
            width: `${star.size}px`,
            height: `${star.size}px`,
            top: `${star.top}%`,
            left: `${star.left}%`,
            opacity: star.opacity,
            animationDuration: `${star.duration}s`,
            animationDelay: `${star.delay}s`,
          }}
        />
      ))}
      </div>

      {/* Main content */}
      <div className="relative z-10 min-h-screen">
        {/* Header with search */}
        <header className="container mx-auto px-4 min-h-screen flex flex-col justify-center">
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
          <div className="max-w-2xl mx-auto text-center">
            <h1 className="text-5xl font-bold mb-6 gradient-text">Space Gallery</h1>
            <p className="text-muted-foreground mb-8">Explore stunning images from NASA's database</p>

            <div className="flex items-center gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search space images..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleSearch(); }}
                  className="pl-12 pr-12 py-6 text-lg glass-panel border-primary/20 focus:border-primary"
                />
                {searchQuery && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setSearchQuery("")}
                    className="absolute right-2 top-1/2 -translate-y-1/2"
                  >
                    <X className="h-5 w-5" />
                  </Button>
                )}
              </div>
              <Button
                variant="outline"
                className="h-14 w-14 glass-panel border-primary/20 hover:border-primary"
                onClick={handleSearch}
              >
                <Search className="h-5 w-5" />
              </Button>
              <Button
                variant="outline"
                className="h-14 w-14 glass-panel border-primary/20 hover:border-primary"
                onClick={() => {
                  const randomImage = galleryImages[Math.floor(Math.random() * galleryImages.length)];
                  handleImageSelect(randomImage);
                }}
              >
                <Dice6 className="h-5 w-5" />
              </Button>
            </div>
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
                onKeyDown={(e) => e.key === 'Enter' && handleImageSelect(image)}
                tabIndex={0}
                role="button"
                className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl overflow-hidden group glass-panel"
              >
                <img
                  src={image.lowQuality}
                  alt={image.title}
                  loading="lazy"
                  decoding="async"
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
        {showGallery && (
          <div ref={galleryRef} className="container mx-auto px-4 pb-16 mt-32">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredImages.map((image) => (
                <Card
                  key={image.id}
                  onClick={() => handleImageSelect(image)}
                  className="cursor-pointer transition-all hover:scale-[1.02] hover:shadow-xl overflow-hidden group"
                >
                  <div className="relative">
                    <img
                      src={image.lowQuality}
                      alt={image.title}
                      className="w-full h-64 object-cover transition-transform duration-300 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute bottom-0 left-0 right-0 p-4 text-white transform translate-y-full group-hover:translate-y-0 transition-transform duration-300">
                      <h3 className="font-semibold text-lg mb-1">{image.title}</h3>
                      <p className="text-sm text-white/90 line-clamp-2">{image.description}</p>
                    </div>
                  </div>
                </Card>
              ))}
            </div>

            {filteredImages.length === 0 && (
              <div className="text-center py-16">
                <div className="text-6xl mb-4">🔍</div>
                <h2 className="text-2xl font-bold mb-2">No images found</h2>
                <p className="text-muted-foreground">Try a different search term</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Image Viewer Modal */}
      {selectedImage && (
        <div
          ref={modalRef}
          tabIndex={-1}
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center"
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white line-clamp-1">{selectedImage.title}</h2>
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center">
          <div className="absolute top-4 left-4 right-4 flex items-center justify-between z-10">
            <div className="flex-1">
              <h2 className="text-2xl font-bold text-white">{selectedImage.title}</h2>
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
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <div
              className="absolute inset-0 flex items-center justify-center transition-transform duration-200"
              style={{
                transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`
              }}
            >
              <img
                src={getImageUrl(selectedImage)}
                srcSet={`${selectedImage.lowQuality} 400w, ${selectedImage.mediumQuality} 1000w, ${selectedImage.highQuality} 2000w`}
                sizes="(max-width: 640px) 90vw, (max-width: 1024px) 80vw, 60vw"
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
            <p className="text-sm text-white/90">{selectedImage.description}</p>
          </div>
        </div>
      )}
    </div>
  );
};

export default SpaceGallery;
