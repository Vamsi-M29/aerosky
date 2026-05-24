import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface WeatherBackgroundProps {
  theme: 'clear-day' | 'clear-night' | 'cloudy' | 'fog' | 'drizzle' | 'rain' | 'snow' | 'thunderstorm';
}

export const WeatherBackground: React.FC<WeatherBackgroundProps> = ({ theme }) => {
  // Cross-fade state: keep track of previous and current themes
  const [prevTheme, setPrevTheme] = useState(theme);
  const [activeTheme, setActiveTheme] = useState(theme);

  useEffect(() => {
    if (theme !== activeTheme) {
      setPrevTheme(activeTheme);
      setActiveTheme(theme);
    }
  }, [theme, activeTheme]);

  // Rain particles generator
  const renderRain = (count: number, isThunder = false) => {
    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 2;
      const duration = 0.8 + Math.random() * 0.8;
      const opacity = 0.3 + Math.random() * 0.5;
      const height = isThunder ? 30 + Math.random() * 20 : 15 + Math.random() * 15;
      
      return (
        <div
          key={`rain-${i}`}
          style={{
            position: 'absolute',
            top: '-20px',
            left: `${left}%`,
            width: '1.5px',
            height: `${height}px`,
            background: 'linear-gradient(to bottom, rgba(255,255,255,0), rgba(156,163,175,0.8))',
            opacity,
            transform: 'rotate(15deg)',
            animation: `fall ${duration}s linear infinite`,
            animationDelay: `${delay}s`,
            pointerEvents: 'none',
          }}
        />
      );
    });
  };

  // Snow particles generator
  const renderSnow = (count: number) => {
    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100;
      const delay = Math.random() * 5;
      const duration = 3 + Math.random() * 4;
      const size = 2 + Math.random() * 6;
      const opacity = 0.4 + Math.random() * 0.5;
      
      return (
        <div
          key={`snow-${i}`}
          style={{
            position: 'absolute',
            top: '-10px',
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: 'white',
            opacity,
            animation: `snow-fall ${duration}s linear infinite, drift 3s ease-in-out infinite alternate`,
            animationDelay: `${delay}s`,
            pointerEvents: 'none',
          }}
        />
      );
    });
  };

  // Stars generator
  const renderStars = (count: number) => {
    return Array.from({ length: count }).map((_, i) => {
      const left = Math.random() * 100;
      const top = Math.random() * 60; // Top half of screen
      const delay = Math.random() * 3;
      const duration = 1.5 + Math.random() * 2.5;
      const size = 1 + Math.random() * 2.5;
      
      return (
        <div
          key={`star-${i}`}
          style={{
            position: 'absolute',
            top: `${top}%`,
            left: `${left}%`,
            width: `${size}px`,
            height: `${size}px`,
            borderRadius: '50%',
            background: 'white',
            boxShadow: '0 0 4px rgba(255,255,255,0.8)',
            animation: `pulse-slow ${duration}s ease-in-out infinite`,
            animationDelay: `${delay}s`,
            pointerEvents: 'none',
          }}
        />
      );
    });
  };

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: -1, overflow: 'hidden' }}>
      {/* Fallback base layer */}
      <div 
        style={{
          position: 'absolute',
          inset: 0,
          background: 'var(--theme-bg-gradient)',
          transition: 'background 1s ease',
        }}
        data-theme={prevTheme}
      />
      
      {/* Animated active layer cross-fade */}
      <AnimatePresence mode="popLayout">
        <motion.div
          key={activeTheme}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1.2, ease: 'easeInOut' }}
          style={{
            position: 'absolute',
            inset: 0,
            background: 'var(--theme-bg-gradient)',
          }}
          data-theme={activeTheme}
        />
      </AnimatePresence>

      {/* Ambient background light glows */}
      <div
        style={{
          position: 'absolute',
          top: '-10%',
          right: '-10%',
          width: '50vw',
          height: '50vw',
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(255,255,255,0.08) 0%, rgba(255,255,255,0) 70%)',
          pointerEvents: 'none',
        }}
      />
      
      {/* Weather Effects Render Layer */}
      <div style={{ position: 'absolute', inset: 0, pointerEvents: 'none' }}>
        {/* Clear Day Effects */}
        {activeTheme === 'clear-day' && (
          <div className="absolute inset-0">
            {/* Glowing Sun Accent */}
            <motion.div
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 0.15 }}
              transition={{ duration: 2 }}
              style={{
                position: 'absolute',
                top: '5%',
                right: '10%',
                width: '300px',
                height: '300px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #fcd34d 0%, rgba(251,191,36,0) 70%)',
                filter: 'blur(20px)',
              }}
            />
            {/* Floating Warm Flares */}
            <div style={{ position: 'absolute', inset: 0 }}>
              {Array.from({ length: 4 }).map((_, i) => (
                <div
                  key={`flare-${i}`}
                  style={{
                    position: 'absolute',
                    top: `${20 + i * 15}%`,
                    left: `${15 + i * 20}%`,
                    width: `${40 + i * 20}px`,
                    height: `${40 + i * 20}px`,
                    borderRadius: '50%',
                    background: 'rgba(253, 224, 71, 0.05)',
                    filter: 'blur(8px)',
                    animation: `float ${8 + i * 2}s ease-in-out infinite alternate`,
                    animationDelay: `${i * 1.5}s`,
                  }}
                />
              ))}
            </div>
          </div>
        )}

        {/* Clear Night Effects */}
        {activeTheme === 'clear-night' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            {renderStars(45)}
            {/* Moon Glow */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.08 }}
              style={{
                position: 'absolute',
                top: '10%',
                right: '15%',
                width: '250px',
                height: '250px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #e2e8f0 0%, rgba(255,255,255,0) 75%)',
                filter: 'blur(15px)',
              }}
            />
          </div>
        )}

        {/* Cloudy Effects */}
        {activeTheme === 'cloudy' && (
          <div style={{ position: 'absolute', inset: 0, opacity: 0.35 }}>
            <div
              style={{
                position: 'absolute',
                top: '10%',
                left: '-10%',
                width: '600px',
                height: '300px',
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 70%)',
                animation: 'drift-horizontal 30s linear infinite',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '15%',
                right: '-10%',
                width: '700px',
                height: '350px',
                background: 'radial-gradient(ellipse, rgba(255,255,255,0.1) 0%, rgba(255,255,255,0) 70%)',
                animation: 'drift-horizontal-reverse 45s linear infinite',
              }}
            />
          </div>
        )}

        {/* Fog Effects */}
        {activeTheme === 'fog' && (
          <div style={{ position: 'absolute', inset: 0, opacity: 0.45 }}>
            <div
              style={{
                position: 'absolute',
                bottom: 0,
                left: 0,
                right: 0,
                height: '60vh',
                background: 'linear-gradient(to top, rgba(255,255,255,0.1), rgba(255,255,255,0))',
                filter: 'blur(10px)',
              }}
            />
            <div
              style={{
                position: 'absolute',
                top: '30%',
                left: '-5%',
                width: '110%',
                height: '250px',
                background: 'radial-gradient(ellipse at center, rgba(45,212,191,0.06) 0%, rgba(255,255,255,0) 80%)',
                animation: 'drift-slow 20s ease-in-out infinite alternate',
              }}
            />
          </div>
        )}

        {/* Drizzle & Rain Effects */}
        {(activeTheme === 'drizzle' || activeTheme === 'rain') && (
          <div style={{ position: 'absolute', inset: 0 }}>
            {renderRain(activeTheme === 'rain' ? 80 : 35)}
          </div>
        )}

        {/* Snow Effects */}
        {activeTheme === 'snow' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            {renderSnow(40)}
          </div>
        )}

        {/* Thunderstorm Effects */}
        {activeTheme === 'thunderstorm' && (
          <div style={{ position: 'absolute', inset: 0 }}>
            {renderRain(90, true)}
            {/* Lightning Flasher */}
            <div
              style={{
                position: 'absolute',
                inset: 0,
                background: '#ffffff',
                opacity: 0,
                animation: 'lightning-flash 12s cubic-bezier(0.1, 0.8, 0.1, 1) infinite',
                pointerEvents: 'none',
              }}
            />
          </div>
        )}
      </div>

      {/* Styled animation keyframes embedded in a style block */}
      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes fall {
          0% { transform: translateY(-50px) translateX(0) rotate(15deg); }
          100% { transform: translateY(105vh) translateX(280px) rotate(15deg); }
        }
        @keyframes snow-fall {
          0% { transform: translateY(-20px) rotate(0deg); }
          100% { transform: translateY(105vh) rotate(360deg); }
        }
        @keyframes drift {
          0% { transform: translateX(-15px); }
          100% { transform: translateX(15px); }
        }
        @keyframes drift-horizontal {
          0% { transform: translateX(-500px); }
          100% { transform: translateX(100vw); }
        }
        @keyframes drift-horizontal-reverse {
          0% { transform: translateX(100vw); }
          100% { transform: translateX(-500px); }
        }
        @keyframes drift-slow {
          0% { transform: translateX(-3%); }
          100% { transform: translateX(3%); }
        }
        @keyframes lightning-flash {
          0%, 94%, 98%, 100% { opacity: 0; }
          95%, 97% { opacity: 0.18; }
          96% { opacity: 0.45; }
        }
      `}} />
    </div>
  );
};
