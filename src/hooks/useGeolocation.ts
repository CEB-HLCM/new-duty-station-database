// Custom hook for browser geolocation access
import { useState, useEffect, useCallback } from 'react';
import type { MapCoordinates } from '../types/dutyStation';

interface GeolocationState {
  coordinates: MapCoordinates | null;
  loading: boolean;
  error: string | null;
  accuracy: number | null;
}

interface UseGeolocationReturn extends GeolocationState {
  getCurrentPosition: () => void;
  watchPosition: () => void;
  clearWatch: () => void;
  isSupported: boolean;
}

export const useGeolocation = (): UseGeolocationReturn => {
  const [state, setState] = useState<GeolocationState>({
    coordinates: null,
    loading: false,
    error: null,
    accuracy: null
  });

  const [watchId, setWatchId] = useState<number | null>(null);

  const isSupported = 'geolocation' in navigator;

  const handleSuccess = useCallback((position: GeolocationPosition) => {
    setState({
      coordinates: {
        latitude: position.coords.latitude,
        longitude: position.coords.longitude
      },
      loading: false,
      error: null,
      accuracy: position.coords.accuracy
    });
  }, []);

  const handleError = useCallback((error: GeolocationPositionError) => {
    let errorMessage = 'An unknown error occurred';

    switch (error.code) {
      case error.PERMISSION_DENIED:
        errorMessage = 'Location permission denied by user';
        break;
      case error.POSITION_UNAVAILABLE:
        errorMessage = 'Location information unavailable';
        break;
      case error.TIMEOUT:
        errorMessage = 'Location request timed out';
        break;
    }

    setState(prev => ({
      ...prev,
      loading: false,
      error: errorMessage
    }));
  }, []);

  const getCurrentPosition = useCallback(() => {
    if (!isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser'
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(handleSuccess, handleError, {
      enableHighAccuracy: true,
      timeout: 10000,
      maximumAge: 0
    });
  }, [isSupported, handleSuccess, handleError]);

  const watchPosition = useCallback(() => {
    if (!isSupported) {
      setState(prev => ({
        ...prev,
        error: 'Geolocation is not supported by your browser'
      }));
      return;
    }

    setState(prev => ({ ...prev, loading: true, error: null }));

    const id = navigator.geolocation.watchPosition(
      handleSuccess,
      handleError,
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0
      }
    );

    setWatchId(id);
  }, [isSupported, handleSuccess, handleError]);

  const clearWatch = useCallback(() => {
    if (watchId !== null) {
      navigator.geolocation.clearWatch(watchId);
      setWatchId(null);
    }
  }, [watchId]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (watchId !== null) {
        navigator.geolocation.clearWatch(watchId);
      }
    };
  }, [watchId]);

  return {
    ...state,
    getCurrentPosition,
    watchPosition,
    clearWatch,
    isSupported
  };
};


