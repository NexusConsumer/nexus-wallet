import { useCallback, useEffect } from 'react';
import {
  useGeolocationStore,
  TEL_AVIV_FALLBACK,
  type GeolocationPermission,
} from '../stores/geolocationStore';

interface UseGeolocationReturn {
  coords: { lat: number; lng: number } | null;
  permission: GeolocationPermission;
  error: string | null;
  requestLocation: () => void;
  isLoading: boolean;
}

const isDev = import.meta.env.DEV;

/**
 * IP-based geolocation fallback using free API.
 * Less accurate (~city level) but works over HTTP.
 */
async function ipGeolocation(): Promise<{ lat: number; lng: number } | null> {
  try {
    const res = await fetch('https://ipapi.co/json/', { signal: AbortSignal.timeout(5000) });
    if (!res.ok) return null;
    const data = await res.json();
    if (data.latitude && data.longitude) {
      return { lat: data.latitude, lng: data.longitude };
    }
  } catch {
    // silently fail
  }
  return null;
}

export function useGeolocation(): UseGeolocationReturn {
  const { coords, permission, error, setCoords, setPermission, setError } =
    useGeolocationStore();

  const requestLocation = useCallback(async () => {
    if (!navigator.geolocation) {
      setPermission('unavailable');
      setError('Geolocation is not supported by this browser');
      return;
    }

    // Set loading state
    setPermission('loading');

    // Try native geolocation first (works on HTTPS + localhost)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        });
      },
      async (err) => {
        // If permission denied → try IP fallback, then mark denied
        if (err.code === err.PERMISSION_DENIED) {
          const ipCoords = await ipGeolocation();
          if (ipCoords) {
            setCoords(ipCoords);
            return;
          }
          setPermission('denied');
          setError('Location permission denied');
          return;
        }

        // Timeout or position unavailable → try IP fallback
        if (err.code === err.TIMEOUT || err.code === err.POSITION_UNAVAILABLE) {
          const ipCoords = await ipGeolocation();
          if (ipCoords) {
            setCoords(ipCoords);
            return;
          }
        }

        // Dev desktop fallback (no touch = no GPS)
        const isDesktop = !('ontouchstart' in window) && !navigator.maxTouchPoints;
        if (isDev && isDesktop) {
          setCoords(TEL_AVIV_FALLBACK);
          return;
        }

        // All failed
        setPermission('prompt');
        setError('Location request failed. Please try again.');
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 0,
      },
    );
  }, [setCoords, setPermission, setError, permission]);

  // On mount: if permission was previously granted, silently refresh coords
  useEffect(() => {
    if (permission === 'granted' && !coords) {
      requestLocation();
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return {
    coords,
    permission,
    error,
    requestLocation,
    isLoading: permission === 'loading',
  };
}
