import { useState } from "react";
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Info } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";

interface GalleryImage {
  id: string;
  title: string;
  description: string;
  lowQuality: string;
  mediumQuality: string;
  highQuality: string;
}

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

  const handleImageSelect = (image: GalleryImage) => {
    setSelectedImage(image);
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  return (
    <div className="min-h-screen space-gradient relative overflow-hidden">
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
      <div className="relative z-10 flex h-screen">
        {/* Sidebar */}
        <aside className="w-80 glass-panel m-4 rounded-2xl p-6 flex flex-col">
          <Link to="/">
            <Button variant="ghost" className="mb-6 -ml-2 text-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </Link>

          <h2 className="text-2xl font-bold mb-6 gradient-text">Space Gallery</h2>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {galleryImages.map((image) => (
              <Card
                key={image.id}
                onClick={() => handleImageSelect(image)}
                className={`cursor-pointer transition-all hover:scale-[1.02] ${
                  selectedImage?.id === image.id
                    ? "ring-2 ring-primary bg-primary/20"
                    : "hover:bg-primary/10"
                }`}
              >
                <div className="p-4">
                  <img
                    src={image.lowQuality}
                    alt={image.title}
                    className="w-full h-32 object-cover rounded-lg mb-3"
                  />
                  <h3 className="font-semibold text-sm mb-1">{image.title}</h3>
                  <p className="text-xs text-muted-foreground line-clamp-2">{image.description}</p>
                </div>
              </Card>
            ))}
          </div>
        </aside>

        {/* Image viewer */}
        <main className="flex-1 p-4 flex flex-col">
          <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col">
            {selectedImage ? (
              <>
                <div className="flex items-center justify-between mb-4">
                  <div className="flex-1">
                    <h1 className="text-3xl font-bold gradient-text">{selectedImage.title}</h1>
                    <p className="text-sm text-muted-foreground mt-1">
                      Zoom: {zoom.toFixed(1)}x • Quality: {getQuality()}
                    </p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={handleZoomOut}
                      disabled={zoom <= 1}
                      variant="secondary"
                      size="icon"
                      className="bg-primary/20 hover:bg-primary/30"
                    >
                      <ZoomOut className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={handleZoomIn}
                      disabled={zoom >= 5}
                      variant="secondary"
                      size="icon"
                      className="bg-primary/20 hover:bg-primary/30"
                    >
                      <ZoomIn className="h-5 w-5" />
                    </Button>
                    <Button
                      onClick={handleReset}
                      variant="secondary"
                      size="icon"
                      className="bg-primary/20 hover:bg-primary/30"
                    >
                      <RotateCcw className="h-5 w-5" />
                    </Button>
                  </div>
                </div>

                {/* Image container */}
                <div
                  className="flex-1 relative overflow-hidden rounded-xl bg-black/40 cursor-move"
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
                      alt={selectedImage.title}
                      className="max-w-full max-h-full object-contain select-none"
                      draggable={false}
                      key={`${selectedImage.id}-${getQuality()}`}
                    />
                  </div>

                  {/* Instructions */}
                  {zoom === 1 && pan.x === 0 && pan.y === 0 && (
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 rounded-lg">
                      <p className="text-sm flex items-center gap-2">
                        <Info className="h-4 w-4" />
                        Use zoom buttons to see higher quality • Drag to pan when zoomed
                      </p>
                    </div>
                  )}
                </div>

                {/* Description */}
                <div className="mt-4 glass-panel p-4 rounded-lg">
                  <p className="text-sm text-muted-foreground">{selectedImage.description}</p>
                </div>
              </>
            ) : (
              <div className="flex-1 flex items-center justify-center">
                <div className="text-center">
                  <div className="text-6xl mb-4">🔭</div>
                  <h2 className="text-2xl font-bold mb-2 gradient-text">Select an Image</h2>
                  <p className="text-muted-foreground">Choose an image from the gallery to start exploring</p>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  );
};

export default SpaceGallery;
