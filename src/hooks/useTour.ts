import { useState, useEffect } from 'react';

const useTour = () => {
  const [tourRun, setTourRun] = useState<boolean>(() => {
    if (typeof window !== 'undefined') {
      const hasVisited = localStorage.getItem('hasVisited');
      return !hasVisited;
    }
    return false;
  });

  useEffect(() => {
    if (!tourRun) {
      localStorage.setItem('hasVisited', 'true');
    }
  }, [tourRun]);

  return { tourRun, setTourRun };
};

export default useTour;