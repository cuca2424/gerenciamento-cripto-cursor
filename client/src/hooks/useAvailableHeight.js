import { useState, useEffect } from 'react';

const useAvailableHeight = (topOffset = 0) => {
  // Calcula a altura inicial imediatamente
  const calculateHeight = () => {
    const windowHeight = window.innerHeight;
    return windowHeight - topOffset;
  };

  const [availableHeight, setAvailableHeight] = useState(calculateHeight());

  useEffect(() => {
    const handleResize = () => {
      setAvailableHeight(calculateHeight());
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [topOffset]);

  return availableHeight;
};

export default useAvailableHeight; 