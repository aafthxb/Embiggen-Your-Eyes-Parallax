import { useState, useRef, useEffect } from "react";
import { ArrowLeft, ZoomIn, ZoomOut, RotateCcw, Globe, Grid3x3 } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

const GeminiIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="2" fill="none"/>
    <path d="M8 12h8M12 8v8M9 9l6 6M9 15l6-6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
  </svg>
);

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
  const aiInsightsRef = useRef<HTMLDivElement>(null);

  const scrollToAIInsights = () => {
    if (aiInsightsRef.current) {
      aiInsightsRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  const [selectedBody, setSelectedBody] = useState<CelestialBody>(celestialBodies[0]);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [showGrid, setShowGrid] = useState(false);
  const [geminiResponse, setGeminiResponse] = useState<string | null>(null);
  const [loadingGemini, setLoadingGemini] = useState(false);
  const [errorGemini, setErrorGemini] = useState<string | null>(null);

  const [pageLoading, setPageLoading] = useState(true);

  useEffect(() => {
    // Simulate initial data fetching
    const timer = setTimeout(() => {
      setPageLoading(false);
    }, 1500);
    return () => clearTimeout(timer);
  }, []);

  const handleGeminiQuery = async () => {
    if (loadingGemini) return;
    setLoadingGemini(true);
    setErrorGemini(null);
    setGeminiResponse(null);

    const apiKey = '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';
    const url = 'https://openrouter.ai/api/v1/chat/completions';

    const prompt = `Provide a short description and a fun fact about ${selectedBody.name} in the following format:

**Short Description:**
[Insert short description here]

**Fun Fact:**
[Insert fun fact here]

Do not include any introductory sentences or extra commentary.`;

    try {
      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'deepseek/deepseek-chat-v3.1:free',
          messages: [{
            role: 'user',
            content: prompt
          }]
        })
      });

      if (!response.ok) {
        throw new Error('Failed to fetch from AI API');
      }

      const data = await response.json();
      const text = data.choices?.[0]?.message?.content || 'No information available';
      setGeminiResponse(text);
      scrollToAIInsights();
    } catch (error) {
      setErrorGemini('No information available');
    } finally {
      setLoadingGemini(false);
    }
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

  const formatGeminiResponse = (text: string) => {
    // Remove the first sentence if it matches the unwanted phrase
    const unwantedStart = "Of course! Here's a short description and a fun fact for a user viewing";
    let formatted = text;
    if (formatted.startsWith(unwantedStart)) {
      formatted = formatted.substring(formatted.indexOf('.') + 1).trim();
    }

    // Remove three hashtags and any *** lines
    formatted = formatted.replace(/^\s*#{3,}.*$/gm, ''); // Remove lines starting with 3 or more #
    formatted = formatted.replace(/^\s*\*{3,}\s*$/gm, ''); // Remove lines with only ***

    // Replace headings with bold text and remove * or # symbols
    formatted = formatted.replace(/^#+\s*(.*)$/gm, (_, p1) => `<strong>${p1.trim()}</strong>`);
    formatted = formatted.replace(/^\*\*(.*?)\*\*:/gm, (_, p1) => `<strong>${p1.trim()}:</strong>`);

    // Remove any remaining * symbols used for emphasis
    formatted = formatted.replace(/\*/g, '');

    // Convert newlines to <br> for HTML display
    formatted = formatted.replace(/\n/g, '<br>');

    return formatted;
  };



  return (
  <div className="min-h-screen bg-background relative overflow-hidden">
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
      {pageLoading ? (
        <div className="relative z-10 flex flex-col md:flex-row md:h-screen">
          {/* Sidebar Skeleton */}
          <aside className="w-full md:w-80 glass-panel m-2 md:m-4 rounded-2xl p-4 md:p-6 flex flex-col">
            <Skeleton className="h-9 w-36 mb-4 md:mb-6" />
            <Skeleton className="h-8 w-48 mb-4 md:mb-6" />
            <div className="flex md:flex-col gap-3 md:space-y-3 md:flex-1 overflow-hidden pb-2 md:pb-0">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="w-64 md:w-full flex-shrink-0 p-4 rounded-xl glass-panel">
                  <div className="flex items-start gap-3">
                    <Skeleton className="h-8 w-8 rounded-full" />
                    <div className="flex-1">
                      <Skeleton className="h-6 w-24 mb-2" />
                      <Skeleton className="h-4 w-full" />
                      <Skeleton className="h-4 w-3/4 mt-1" />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </aside>

          {/* Main Content Skeleton */}
          <main className="flex-1 p-2 md:p-4 flex flex-col min-h-0">
            <div className="flex flex-col lg:flex-row flex-1 gap-4 min-h-0">
              <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col">
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                  <div>
                    <Skeleton className="h-9 w-40 mb-2" />
                    <Skeleton className="h-4 w-20" />
                  </div>
                  <div className="flex gap-2 flex-wrap">
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                    <Skeleton className="h-10 w-10 rounded-md" />
                  </div>
                </div>
                <Skeleton className="flex-1 w-full rounded-xl min-h-[300px] md:min-h-0" />
              </div>
            </div>
          </main>
        </div>
      ) : (
      <div className="relative z-10 flex flex-col md:flex-row md:h-screen">
        {/* Sidebar */}
        <aside className="w-full md:w-80 glass-panel m-2 md:m-4 rounded-2xl p-4 md:p-6 flex flex-col">
          <Link to="/">
            <Button variant="ghost" className="mb-4 md:mb-6 -ml-2 text-foreground hover:text-primary">
              <ArrowLeft className="mr-2 h-5 w-5" />
              Back to Home
            </Button>
          </Link>

          <h2 className="text-2xl font-bold mb-4 md:mb-6">Celestial Bodies</h2>

          <div className="flex md:flex-col gap-3 md:space-y-3 md:flex-1 overflow-x-auto md:overflow-y-auto pb-2 md:pb-0">
            {celestialBodies.map((body) => (
              <button
                key={body.id}
                onClick={() => setSelectedBody(body)}
                className={`w-64 md:w-full flex-shrink-0 text-left p-4 rounded-xl transition-all ${
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

        {/* Map viewer and AI Insights container */}
        <main className="flex-1 p-2 md:p-4 flex flex-col min-h-0">
          <div className="flex flex-col lg:flex-row flex-1 gap-4 min-h-0">
            {/* Map viewer */}
            <div className="glass-panel rounded-2xl p-6 flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between mb-4 gap-4">
                <div>
                  <h1 className="text-3xl font-bold gradient-text">{selectedBody.name}</h1>
                  <p className="text-sm text-muted-foreground mt-1">
                    Zoom: {zoom.toFixed(1)}x
                  </p>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Button
                    onClick={handleGeminiQuery}
                    disabled={loadingGemini}
                    variant="secondary"
                    size="icon"
                    className="bg-primary/20 hover:bg-primary/30"
                    title="Get AI info"
                  >
                    <GeminiIcon />
                  </Button>
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
                className="flex-1 relative overflow-hidden rounded-xl bg-muted/40 cursor-move min-h-[300px] md:min-h-0"
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

              {/* Gemini AI Response */}
            </div>

            {/* AI Insights box */}
            {(geminiResponse || errorGemini || loadingGemini) && (
              <div ref={aiInsightsRef} className="glass-panel rounded-2xl p-6 w-full lg:max-w-sm flex-shrink-0 overflow-y-auto">
                <h3 className="text-xl font-bold mb-4 gradient-text">AI Insights</h3>
                {loadingGemini && (
                  <div className="flex items-center gap-2">
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
                    <p className="text-sm text-muted-foreground">Getting information...</p>
                  </div>
                )}
                {errorGemini && (
                  <p className="text-sm text-red-400">{errorGemini}</p>
                )}
                {geminiResponse && (
                  <div className="text-sm text-foreground whitespace-pre-wrap" dangerouslySetInnerHTML={{ __html: formatGeminiResponse(geminiResponse) }} />
                )}
              </div>
            )}
          </div>
        </main>
      </div>
      )}
    </div>
  );
};

export default CelestialBodies;
