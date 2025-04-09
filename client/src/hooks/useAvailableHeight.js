import { useState, useEffect } from 'react';

const useAvailableHeight = (topOffset = 0) => {
  const [availableHeight, setAvailableHeight] = useState(0);

  useEffect(() => {
    const calculateHeight = () => {
      const windowHeight = window.innerHeight;
      const availableSpace = windowHeight - topOffset;
      setAvailableHeight(availableSpace);
    };

    calculateHeight();
    window.addEventListener('resize', calculateHeight);

    return () => window.removeEventListener('resize', calculateHeight);
  }, [topOffset]);

  return availableHeight;
};

export default useAvailableHeight; 