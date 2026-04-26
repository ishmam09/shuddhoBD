import React, { createContext, useContext } from 'react';
import { useLoadScript } from '@react-google-maps/api';
import type { Libraries } from '@react-google-maps/api';

interface GoogleMapsContextType {
  isLoaded: boolean;
  loadError: Error | undefined;
}

const GoogleMapsContext = createContext<GoogleMapsContextType>({
  isLoaded: false,
  loadError: undefined,
});

const libraries: Libraries = ["places"];

export const GoogleMapsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || "",
    libraries,
  });

  return (
    <GoogleMapsContext.Provider value={{ isLoaded, loadError }}>
      {children}
    </GoogleMapsContext.Provider>
  );
};

export const useGoogleMapsLoad = () => useContext(GoogleMapsContext);
