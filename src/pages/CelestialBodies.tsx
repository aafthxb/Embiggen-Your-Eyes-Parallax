import { useState } from "react";
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Globe, Grid3x3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface CelestialBody {
  id: string;
  name: string;
  description: string;
  icon: string;
  mapUrl: string;
}

const celestialBodies: CelestialBody[] = [
  {
    id: "earth",
    name: "Earth",
    description: "Our home planet, the blue marble with diverse ecosystems and vast oceans.",
    icon: "🌍",
    mapUrl: "https://eoimages.gsfc.nasa.gov/images/imagerecords/73000/73909/world.topo.bathy.200412.3x5400x2700.jpg"
  },
  {
    id: "mars",
    name: "Mars",
    description: "The red planet, a cold desert world with towering volcanoes and deep canyons.",
    icon: "🔴",
    mapUrl: "https://astrogeology.usgs.gov/cache/images/mars_viking_color_540s.jpg"
  },
  {
    id: "moon",
    name: "Moon",
    description: "Earth's natural satellite, marked by ancient impact craters and vast maria.",
    icon: "🌙",
    mapUrl: "https://astrogeology.usgs.gov/cache/images/moon_clementine_750.jpg"
  }
];

const CelestialBodies = () => {
  const [selectedBody, setSelectedBody] = useState<CelestialBody>(celestialBodies[0]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(false);

  const getImageQuality = () => {
    if (zoom <= 1.5) return "low";
    if (zoom <= 3) return "medium";
    return "high";
  };

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.5, 5));
    if (zoom >= 2.5) setShowGrid(true);
  };

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.5, 1));
    if (zoom <= 2) setShowGrid(false);
  };

  const handleReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setShowGrid(false);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    setIsDragging(true);
    setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
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

          <h2 className="text-2xl font-bold mb-6 gradient-text">Celestial Bodies</h2>

          <div className="space-y-3 flex-1 overflow-y-auto">
            {celestialBodies.map((body) => (
              <button
                key={body.id}
                onClick={() => setSelectedBody(body)}
                className={`w-full text-left p-4 rounded-xl transition-all ${
                  selectedBody.id === body.id
                    ? "bg-primary/20 border-2 border-primary shadow-lg shadow-primary/20"
                    : "glass-panel hover:bg-primary/10"
                }`}
              >
                <div className="flex items-start gap-3">
                  <span className="text-3xl">{body.icon}</span>
                  <div>
                    <h3 className="font-semibold text-lg mb-1">{body.name}</h3>
                    <p className="text-sm text-muted-foreground">{body.description}</p>
                  </div>
                </div>
              </button>
            ))}
          </div>
        </aside>

        {/* Map viewer */}
        <main className="flex-1 p-4 flex flex-col">
          <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h1 className="text-3xl font-bold gradient-text">{selectedBody.name}</h1>
                <p className="text-sm text-muted-foreground mt-1">
                  Zoom: {zoom.toFixed(1)}x • Quality: {getImageQuality()}
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
                <Button
                  onClick={() => setShowGrid(!showGrid)}
                  variant="secondary"
                  size="icon"
                  className={`${showGrid ? "bg-primary/30" : "bg-primary/20"} hover:bg-primary/30`}
                >
                  <Grid3x3 className="h-5 w-5" />
                </Button>
              </div>
            </div>

            {/* Map container */}
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
                  src={selectedBody.mapUrl}
                  alt={`${selectedBody.name} surface map`}
                  className="max-w-full max-h-full object-contain select-none"
                  draggable={false}
                  onError={(e) => {
                    // Fallback to a placeholder if image fails to load
                    (e.target as HTMLImageElement).src = "https://via.placeholder.com/1200x600/1a1a2e/16f2b3?text=" + selectedBody.name;
                  }}
                />
              </div>

              {/* Grid overlay */}
              {showGrid && (
                <div className="absolute inset-0 pointer-events-none">
                  <svg className="w-full h-full">
                    <defs>
                      <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
                        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="rgba(139, 92, 246, 0.3)" strokeWidth="1"/>
                      </pattern>
                    </defs>
                    <rect width="100%" height="100%" fill="url(#grid)" />
                  </svg>
                </div>
              )}

              {/* Instructions */}
              {zoom === 1 && pan.x === 0 && pan.y === 0 && (
                <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass-panel px-4 py-2 rounded-lg">
                  <p className="text-sm flex items-center gap-2">
                    <Globe className="h-4 w-4" />
                    Drag to pan • Use zoom buttons to explore
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
};

export default CelestialBodies;
