'use client';

import { useEffect } from 'react';

const PwaRegistration = () => {
  useEffect(() => {
    const register = () => {
      navigator.serviceWorker.register('/sw.js').then(
        (registration) => {
          console.log('ServiceWorker registration successful with scope: ', registration.scope);
        },
        (err) => {
          console.log('ServiceWorker registration failed: ', err);
        }
      );
    };

    if ('serviceWorker' in navigator && (window.location.hostname === 'localhost' || window.location.protocol === 'https:')) {
      if (document.readyState === 'complete') {
        register();
      } else {
        window.addEventListener('load', register);
        return () => window.removeEventListener('load', register);
      }
    }
  }, []);

  return null;
};

export default PwaRegistration;
