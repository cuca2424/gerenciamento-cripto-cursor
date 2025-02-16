import { useEffect } from 'react';
import debounce from 'lodash.debounce';

function resizeJanela() {

  const handleResize = debounce(() => {
  }, 300); 

  useEffect(() => {
    window.addEventListener('resize', handleResize);
    return () => {
      window.removeEventListener('resize', handleResize);
    };
  }, []);
  
}

export default resizeJanela;