import { create } from 'zustand';

export type GeolocationPermission =
  | 'prompt'
  | 'granted'
  | 'denied'
  | 'loading'
  | 'unavailable';

interface GeoCoordinates {
  lat: number;
  lng: number;
}

interface GeolocationState {
  permission: GeolocationPermission;
  coords: GeoCoordinates | null;
  error: string | null;
  lastUpdated: number | null;

  setCoords: (coords: GeoCoordinates) => void;
  setPermission: (permission: GeolocationPermission) => void;
  setError: (error: string | null) => void;
  reset: () => void;
}

const STORAGE_KEY = 'nexus_geolocation';

/** Dev fallback: Tel Aviv center */
export const TEL_AVIV_FALLBACK: GeoCoordinates = {
  lat: 32.0853,
  lng: 34.7818,
};

function loadPersisted(): Partial<GeolocationState> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    return JSON.parse(raw);
  } catch {
    return {};
  }
}

function persist(
  coords: GeoCoordinates | null,
  permission: GeolocationPermission,
) {
  try {
    localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ coords, permission, lastUpdated: Date.now() }),
    );
  } catch {
    /* silently fail */
  }
}

const persisted = loadPersisted();

export const useGeolocationStore = create<GeolocationState>((set) => ({
  permission:
    (persisted.permission as GeolocationPermission) ?? 'prompt',
  coords: (persisted.coords as GeoCoordinates) ?? null,
  error: null,
  lastUpdated: (persisted.lastUpdated as number) ?? null,

  setCoords: (coords) => {
    set({
      coords,
      permission: 'granted',
      error: null,
      lastUpdated: Date.now(),
    });
    persist(coords, 'granted');
  },

  setPermission: (permission) => {
    set({ permission });
    persist(null, permission);
  },

  setError: (error) => set({ error }),

  reset: () => {
    localStorage.removeItem(STORAGE_KEY);
    set({
      permission: 'prompt',
      coords: null,
      error: null,
      lastUpdated: null,
    });
  },
}));
