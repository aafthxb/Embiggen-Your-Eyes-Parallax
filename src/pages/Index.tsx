import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Globe2, Telescope } from "lucide-react";
import { Globe2, Telescope, SplitSquareVertical } from "lucide-react";

const Index = () => {
  return (
    <div className="min-h-screen space-gradient relative overflow-hidden flex items-center justify-center">
      {/* Animated space elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {/* Stars */}
        {[...Array(150)].map((_, i) => (
          <div
            key={`star-${i}`}
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

        {/* Planets */}
        <div
          className="absolute rounded-full opacity-30"
          style={{
            width: "80px",
            height: "80px",
            top: "15%",
            left: "10%",
            background: "radial-gradient(circle at 30% 30%, #ff6b6b, #c92a2a)",
            boxShadow: "0 0 30px rgba(255, 107, 107, 0.5)"
          }}
        />
        <div
          className="absolute rounded-full opacity-30"
          style={{
            width: "60px",
            height: "60px",
            top: "70%",
            left: "85%",
            background: "radial-gradient(circle at 30% 30%, #4dabf7, #1971c2)",
            boxShadow: "0 0 30px rgba(77, 171, 247, 0.5)"
          }}
        />
        <div
          className="absolute rounded-full opacity-25"
          style={{
            width: "100px",
            height: "100px",
            top: "60%",
            left: "15%",
            background: "radial-gradient(circle at 30% 30%, #be4bdb, #862e9c)",
            boxShadow: "0 0 40px rgba(190, 75, 219, 0.5)"
          }}
        />
        
        {/* Saturn with rings */}
        <div className="absolute opacity-30" style={{ top: "20%", right: "15%" }}>
          <div
            className="rounded-full relative"
            style={{
              width: "70px",
              height: "70px",
              background: "radial-gradient(circle at 30% 30%, #ffd43b, #fab005)"
            }}
          >
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
              style={{
                width: "120px",
                height: "30px",
                border: "3px solid rgba(255, 212, 59, 0.4)",
                borderRadius: "50%",
                transform: "translate(-50%, -50%) rotateX(75deg)"
              }}
            />
          </div>
        </div>

        {/* Nebula effects */}
        <div
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: "300px",
            height: "300px",
            top: "40%",
            right: "30%",
            background: "radial-gradient(circle, rgba(190, 75, 219, 0.6), transparent)"
          }}
        />
        <div
          className="absolute rounded-full blur-3xl opacity-20"
          style={{
            width: "400px",
            height: "400px",
            top: "10%",
            left: "40%",
            background: "radial-gradient(circle, rgba(99, 102, 241, 0.4), transparent)"
          }}
        />

        {/* Black hole */}
        <div className="absolute opacity-30" style={{ bottom: "20%", right: "10%" }}>
          <div className="relative w-20 h-20">
            <div className="absolute inset-0 rounded-full bg-black border-2 border-purple-500 animate-spin" style={{ animationDuration: "10s" }} />
            <div className="absolute inset-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 animate-spin" style={{ animationDuration: "8s" }} />
            <div className="absolute inset-4 rounded-full bg-black" />
          </div>
        </div>

        {/* Galaxy */}
        <div className="absolute opacity-25" style={{ top: "50%", left: "5%" }}>
          <div className="relative w-24 h-24 animate-spin" style={{ animationDuration: "30s" }}>
            <div className="absolute inset-0 rounded-full bg-gradient-to-r from-purple-400 via-blue-400 to-transparent blur-sm" />
            <div className="absolute inset-2 rounded-full bg-gradient-to-l from-blue-400 via-purple-400 to-transparent blur-sm" />
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 text-center px-4 max-w-2xl">
        <h1 className="text-8xl font-bold mb-16 gradient-text tracking-tight">
          Parallax
        </h1>

          <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
            <Link to="/celestial-bodies">
              <Button 
                size="lg" 
                className="glass-panel text-lg px-8 py-6 hover:scale-105 transition-transform duration-300 border-2 border-primary/40 hover:border-primary/60 bg-primary/10 hover:bg-primary/20 text-foreground font-semibold"
              >
                <Globe2 className="mr-3 h-6 w-6" />
                Celestial Bodies
              </Button>
            </Link>

            <Link to="/space-gallery">
              <Button 
                size="lg" 
                className="glass-panel text-lg px-8 py-6 hover:scale-105 transition-transform duration-300 border-2 border-secondary/40 hover:border-secondary/60 bg-secondary/10 hover:bg-secondary/20 text-foreground font-semibold"
              >
                <Telescope className="mr-3 h-6 w-6" />
                Space Gallery
              </Button>
            </Link>

            <Link to="/compare">
              <Button
                size="lg"
                className="glass-panel text-lg px-8 py-6 hover:scale-105 transition-transform duration-300 border-2 border-green-500/40 hover:border-green-500/60 bg-green-500/10 hover:bg-green-500/20 text-foreground font-semibold"
              >
                <Globe2 className="mr-3 h-6 w-6" />
                Earth
              </Button>
            </Link>

            <Link to="/apod">
              <Button
                size="lg"
                className="glass-panel text-lg px-8 py-6 hover:scale-105 transition-transform duration-300 border-2 border-accent/40 hover:border-accent/60 bg-accent/10 hover:bg-accent/20 text-foreground font-semibold flex items-center justify-center gap-2"
              >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M12 3v9.75l4.5 2.25M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                APOD
              </Button>
            </Link>
          </div>

        <p className="mt-8 text-muted-foreground text-sm">
          Explore the cosmos and discover the wonders of our universe
        </p>
      </div>
    </div>
  );
};

export default Index;
