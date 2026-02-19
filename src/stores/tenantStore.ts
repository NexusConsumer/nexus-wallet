import { create } from 'zustand';
import type { TenantConfig } from '../types/tenant.types';

interface TenantState {
  tenantId: string | null;
  config: TenantConfig | null;
  isLoading: boolean;

  setTenant: (id: string, config: TenantConfig) => void;
  clearTenant: () => void;
  setLoading: (loading: boolean) => void;
}

const STORAGE_KEY = 'nexus_tenant';

function loadPersistedTenant(): { tenantId: string | null; config: TenantConfig | null } {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return { tenantId: null, config: null };
    return JSON.parse(raw);
  } catch {
    return { tenantId: null, config: null };
  }
}

function persistTenant(tenantId: string | null, config: TenantConfig | null) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ tenantId, config }));
  } catch {
    // silently fail
  }
}

function clearPersistedTenant() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {
    // silently fail
  }
}

const persisted = loadPersistedTenant();

export const useTenantStore = create<TenantState>((set) => ({
  tenantId: persisted.tenantId,
  config: persisted.config,
  isLoading: false,

  setTenant: (id, config) => {
    persistTenant(id, config);
    set({ tenantId: id, config, isLoading: false });
  },

  clearTenant: () => {
    clearPersistedTenant();
    set({ tenantId: null, config: null, isLoading: false });
  },

  setLoading: (loading) => set({ isLoading: loading }),
}));
