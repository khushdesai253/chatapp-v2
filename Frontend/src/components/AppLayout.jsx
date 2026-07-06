import React, { useState, useEffect } from 'react';

// Custom hook to track window width
function useMediaQuery(query) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    if (media.matches !== matches) {
      setMatches(media.matches);
    }
    const listener = () => setMatches(media.matches);
    window.addEventListener('resize', listener);
    return () => window.removeEventListener('resize', listener);
  }, [matches, query]);

  return matches;
}

export const useIsMobile = () => useMediaQuery('(max-width: 768px)');

export default function AppLayout({ children, sidebar: Sidebar, bottomNav: BottomNav }) {
  const isMobile = useIsMobile();

  return (
    <div className="w-full h-full flex flex-col md:flex-row bg-background">
      {/* Desktop Sidebar */}
      {!isMobile && Sidebar && <Sidebar />}

      {/* Main Content Area */}
      <main className="flex-grow flex flex-col relative overflow-hidden">
        {children}
      </main>

      {/* Mobile Bottom Navigation */}
      {isMobile && BottomNav && <BottomNav />}
    </div>
  );
}
