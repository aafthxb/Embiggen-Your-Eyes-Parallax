import { useState, useEffect } from "react";
import { ArrowLeft } from "lucide-react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";

interface ApodData {
  date: string;
  title: string;
  explanation: string;
  url: string;
  hdurl?: string;
  media_type: string;
  copyright?: string;
}

const Apod = () => {
  const [apod, setApod] = useState<ApodData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchApod = async () => {
      try {
        const response = await fetch(`https://api.nasa.gov/planetary/apod?api_key=oTdzf49PEdhPhucTamhKERB4fqqQda0btH1Vyd1Y`);
        if (!response.ok) {
          throw new Error('Failed to fetch APOD');
        }
        const data = await response.json();
        setApod(data);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : 'An error occurred');
        setLoading(false);
      }
    };

    fetchApod();
  }, []);

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
      <div className="relative z-10 min-h-screen">
        {/* Header */}
        <header className="container mx-auto px-4 py-8">
          <div className="flex items-center justify-between">
            <Link to="/">
              <Button variant="ghost" className="text-foreground hover:text-primary">
                <ArrowLeft className="mr-2 h-5 w-5" />
                Back to Home
              </Button>
            </Link>
          </div>

          <div className="max-w-4xl mx-auto text-center mt-8">
            <h1 className="text-5xl font-bold mb-6 gradient-text">
              {apod ? apod.title : 'Astronomy Picture of the Day'}
            </h1>
          </div>
        </header>

        {/* APOD Content */}
        <div className="container mx-auto px-4 pb-16">
          {loading && (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
                <p className="text-muted-foreground">Loading today's astronomy picture...</p>
              </div>
            </div>
          )}

          {error && (
            <div className="flex justify-center items-center min-h-[400px]">
              <div className="text-center glass-panel p-8 rounded-lg">
                <div className="text-6xl mb-4">🚀</div>
                <h2 className="text-2xl font-bold mb-2">Failed to load APOD</h2>
                <p className="text-muted-foreground">{error}</p>
              </div>
            </div>
          )}

          {apod && (
            <div className="max-w-4xl mx-auto">
              <div className="glass-panel p-6 rounded-lg mb-6">
                {apod.media_type === 'image' ? (
                  <img
                    src={apod.hdurl || apod.url}
                    alt={apod.title}
                    className="w-full rounded-lg shadow-lg"
                  />
                ) : (
                  <iframe
                    src={apod.url}
                    className="w-full h-96 rounded-lg"
                    title={apod.title}
                    allowFullScreen
                  />
                )}
                {apod.date && (
                  <p className="text-center text-muted-foreground mt-2">
                    {`NASA's featured image for `}
                    {new Date(apod.date + 'T00:00:00-05:00').toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                  </p>
                )}
                <div className="text-center text-muted-foreground mt-2">
                  {apod.copyright && (
                    <>
                      <strong>Image Credit & Copyright:</strong>
                      &nbsp;
                      {(() => {
                        const credit = apod.copyright.trim();
                        const urlRegex = /(https?:\/\/[^\s]+)/;
                        const urlMatch = credit.match(urlRegex);
                        if (urlMatch) {
                          const name = credit.replace(urlRegex, '').replace(/\(\)/, '').trim();
                          return <a href={urlMatch[0]} target="_blank" rel="noopener noreferrer" className="hover:underline">{name || urlMatch[0]}</a>;
                        }
                        return credit;
                      })()}
                    </>
                  )}
                </div>
              </div>
              <div className="glass-panel p-6 rounded-lg">
                <h3 className="text-xl font-semibold mb-4">Explanation</h3>
                <p className="text-muted-foreground leading-relaxed">{apod.explanation}</p>
              </div>

              {/* Archive Button */}
              <div className="mt-6 text-center">
                <a href="https://apod.nasa.gov/apod/archivepix.html" target="_blank" rel="noopener noreferrer">
                  <Button variant="outline">
                    Archive
                  </Button>
                </a>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Apod;
