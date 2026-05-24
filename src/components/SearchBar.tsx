import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, MapPin, Loader2 } from 'lucide-react';
import { searchLocations } from '../utils/weatherApi';
import type { Location } from '../utils/weatherApi';

interface SearchBarProps {
  onSelectLocation: (location: Location) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ onSelectLocation }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<Location[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Debounce API calls
  useEffect(() => {
    if (query.trim().length < 2) {
      setResults([]);
      setIsLoading(false);
      setIsOpen(false);
      return;
    }

    setIsLoading(true);
    const delayDebounce = setTimeout(async () => {
      try {
        const data = await searchLocations(query);
        setResults(data);
        setIsOpen(data.length > 0);
        setActiveIndex(-1);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    }, 450);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  // Click outside listener
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Keyboard navigation handler
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIndex((prev) => (prev < results.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIndex((prev) => (prev > 0 ? prev - 1 : results.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIndex >= 0 && activeIndex < results.length) {
        handleSelect(results[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      setIsOpen(false);
    }
  };

  const handleSelect = (location: Location) => {
    onSelectLocation(location);
    setQuery('');
    setResults([]);
    setIsOpen(false);
    setActiveIndex(-1);
  };

  return (
    <div ref={dropdownRef} style={{ position: 'relative', width: '100%', maxWidth: '500px', margin: '0 auto' }}>
      <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
        <span style={{ position: 'absolute', left: '16px', color: 'var(--theme-text-secondary)', display: 'flex', alignItems: 'center', pointerEvents: 'none' }}>
          <Search size={18} />
        </span>
        
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={handleKeyDown}
          onFocus={() => query.trim().length >= 2 && results.length > 0 && setIsOpen(true)}
          placeholder="Search city, region or country..."
          className="glass-input"
          style={{
            width: '100%',
            padding: '16px 48px',
            fontSize: '16px',
            fontWeight: 400,
            border: '1px solid rgba(255,255,255,0.08)',
            outline: 'none',
          }}
        />

        <AnimatePresence>
          {isLoading && (
            <motion.span
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              style={{ position: 'absolute', right: '16px', color: 'var(--theme-accent)', display: 'flex', alignItems: 'center' }}
            >
              <Loader2 className="animate-spin" size={18} style={{ animation: 'spin 1s linear infinite' }} />
            </motion.span>
          )}
        </AnimatePresence>
      </div>

      <AnimatePresence>
        {isOpen && results.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 12, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 8, scale: 0.98 }}
            transition={{ duration: 0.25, ease: 'easeOut' }}
            style={{
              position: 'absolute',
              top: 'calc(100% + 8px)',
              left: 0,
              right: 0,
              zIndex: 50,
              borderRadius: '16px',
              overflow: 'hidden',
              boxShadow: 'var(--shadow-premium)',
            }}
            className="glass-panel"
          >
            <motion.ul
              style={{ listStyle: 'none', padding: '6px 0', margin: 0, maxHeight: '320px', overflowY: 'auto' }}
              variants={{
                show: { transition: { staggerChildren: 0.04 } }
              }}
              initial="hidden"
              animate="show"
            >
              {results.map((loc, index) => {
                const isActive = index === activeIndex;
                return (
                  <motion.li
                    key={loc.id}
                    variants={{
                      hidden: { opacity: 0, y: 8 },
                      show: { opacity: 1, y: 0 }
                    }}
                    onClick={() => handleSelect(loc)}
                    onMouseEnter={() => setActiveIndex(index)}
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: '14px 18px',
                      cursor: 'pointer',
                      background: isActive ? 'rgba(255, 255, 255, 0.08)' : 'transparent',
                      color: isActive ? 'var(--theme-text-primary)' : 'var(--theme-text-secondary)',
                      borderLeft: isActive ? '3px solid var(--theme-accent)' : '3px solid transparent',
                      transition: 'background 0.15s ease, color 0.15s ease, border-left-color 0.15s ease',
                    }}
                  >
                    <span style={{ color: isActive ? 'var(--theme-accent)' : 'inherit', flexShrink: 0, display: 'flex', alignItems: 'center' }}>
                      <MapPin size={16} />
                    </span>
                    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', overflow: 'hidden' }}>
                      <span style={{ fontWeight: 500, fontSize: '15px', color: 'var(--theme-text-primary)', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%', textAlign: 'left' }}>
                        {loc.name}
                      </span>
                      <span style={{ fontSize: '12px', whiteSpace: 'nowrap', textOverflow: 'ellipsis', overflow: 'hidden', width: '100%', textAlign: 'left', opacity: 0.8 }}>
                        {[loc.admin1, loc.country].filter(Boolean).join(', ')}
                      </span>
                    </div>
                  </motion.li>
                );
              })}
            </motion.ul>
          </motion.div>
        )}
      </AnimatePresence>

      <style dangerouslySetInnerHTML={{ __html: `
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}} />
    </div>
  );
};
