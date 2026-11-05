import { useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

export const useReferrerTracking = () => {
  const location = useLocation();
  
  useEffect(() => {
    const currentPath = location.pathname;
    const hasIdParam = currentPath.match(/\/[^/]+\/[^/]+$/);
    
    if (hasIdParam) {
      const previousPath = sessionStorage.getItem('_previousPath');
      
      if (previousPath && previousPath !== currentPath && !previousPath.match(/\/[^/]+\/[^/]+$/)) {
        sessionStorage.setItem('_referrerPath', previousPath);
        console.log('Stored referrer:', previousPath);
      }
    }
    
    sessionStorage.setItem('_previousPath', currentPath);
  }, [location.pathname]);
};

export const useCountryChangeRedirect = (country) => {
  const navigate = useNavigate();
  const location = useLocation();
  const previousCountryRef = useRef(country);
  
  useEffect(() => {
    // Check if country actually changed
    if (previousCountryRef.current !== country) {
      console.log('Country changed from', previousCountryRef.current, 'to', country);
      
      const currentPath = location.pathname;
      const hasIdParam = currentPath.match(/\/[^/]+\/[^/]+$/);
      
      if (hasIdParam) {
        const referrerPath = sessionStorage.getItem('_referrerPath');
        console.log('Current path:', currentPath, 'Referrer path:', referrerPath);
        
        if (referrerPath) {
          sessionStorage.removeItem('_referrerPath');
          sessionStorage.removeItem('_previousPath');
          console.log('Navigating to:', referrerPath);
          navigate(referrerPath);
        }
      }
      
      // Update the ref to the new country
      previousCountryRef.current = country;
    }
  }, [country, navigate, location.pathname]);
};
