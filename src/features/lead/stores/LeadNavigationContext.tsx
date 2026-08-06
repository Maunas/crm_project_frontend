import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react';
import { getFilteredLeads, getLeads } from 'features/lead/leadService';
import type { LeadFilter, LeadListParams } from 'src/types/shared';

// leadIds/currentId son public_uuid de Lead desde Fase 3, ver backend/AGENTS.md §18.
interface NavState {
  leadIds: string[];
  filters: LeadFilter[];
  baseParams: LeadListParams | null;
  minPageLoaded: number;
  maxPageLoaded: number;
  totalPages: number;
}

interface LeadNavigationContextProps {
  leadIds: string[];
  isLoadingNavigation: boolean;
  setListContext: (
    ids: string[],
    params: LeadListParams,
    filters: LeadFilter[],
    totalPages: number
  ) => void;
  getNextLeadId: (currentId: string) => Promise<string | null>;
  getPrevLeadId: (currentId: string) => Promise<string | null>;
  isFirstItem: (currentId: string) => boolean;
  isLastItem: (currentId: string) => boolean;
  isNavigationValid: (currentId: string) => boolean;
}

const LeadNavigationContext = createContext<LeadNavigationContextProps | undefined>(undefined);

const STORAGE_KEY = 'crm_lead_navigation_state';

const DEFAULT_STATE = {
  leadIds: [],
  filters: [],
  baseParams: {},
  minPageLoaded: 1,
  maxPageLoaded: 1,
  totalPages: 1,
}

export const LeadNavigationProvider = ({ children }: { children: ReactNode }) => {

  // Recupera el estado de sessionStorage
  const [navState, setNavState] = useState<NavState>(() => {
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing stored lead navigation state", e);
        return DEFAULT_STATE
      }
    }
    return DEFAULT_STATE;
  });

  const [isLoadingNavigation, setIsLoadingNavigation] = useState(false);

  // Guardar en sessionStorage cada vez que el estado cambia
  useEffect(() => {
    if (navState.leadIds.length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(navState));
    }
  }, [navState]);

  // Sincronizar desde la tabla (LeadListPage)
  const setListContext = useCallback((
    ids: string[],
    params: LeadListParams,
    filters: LeadFilter[],
    totalPages: number
  ) => {
    setNavState({
      leadIds: ids,
      filters: filters,
      baseParams: params,
      minPageLoaded: params.page ?? 1,
      maxPageLoaded: params.page ?? 1,
      totalPages: totalPages,
    });
  }, []);

  const fetchAdjacentPage = async (pageToFetch: number, direction: 'next' | 'prev'): Promise<string[]> => {
    if (!navState.baseParams) return [];

    setIsLoadingNavigation(true);
    try {
      const newParams = { ...navState.baseParams, page: pageToFetch };
      const response = navState.filters.length > 0
        ? await getFilteredLeads({ filters: navState.filters }, newParams)
        : await getLeads(newParams);

      const fetchedIds = response.items.map((lead) => lead.id);

      setNavState(prev => ({
        ...prev,
        leadIds: direction === 'next'
          ? [...prev.leadIds, ...fetchedIds]
          : [...fetchedIds, ...prev.leadIds],
        minPageLoaded: direction === 'prev' ? pageToFetch : prev.minPageLoaded,
        maxPageLoaded: direction === 'next' ? pageToFetch : prev.maxPageLoaded,
      }));

      return fetchedIds;
    } catch (error) {
      console.error("Error fetching adjacent lead page:", error);
      return [];
    } finally {
      setIsLoadingNavigation(false);
    }
  };


  const getNextLeadId = async (currentId: string): Promise<string | null> => {
    const currentIndex = navState.leadIds.indexOf(currentId);
    if (currentIndex === -1) return null;

    // Si tenemos el siguiente ID en memoria, lo devolvemos inmediatamente
    if (currentIndex < navState.leadIds.length - 1) {
      return navState.leadIds[currentIndex + 1];
    }
    // Si estamos al final del arreglo, verificamos si hay más páginas en el backend
    if (navState.maxPageLoaded < navState.totalPages) {
      const newIds = await fetchAdjacentPage(navState.maxPageLoaded + 1, 'next');
      return newIds.length > 0 ? newIds[0] : null;
    }

    return null; // No hay más leads ni más páginas
  };

  const getPrevLeadId = async (currentId: string): Promise<string | null> => {
    const currentIndex = navState.leadIds.indexOf(currentId);
    if (currentIndex === -1) return null;

    // Si tenemos el ID anterior en memoria, lo devolvemos inmediatamente
    if (currentIndex > 0) {
      return navState.leadIds[currentIndex - 1];
    }

    // Si estamos al principio del arreglo, verificamos si hay páginas previas
    if (navState.minPageLoaded > 1) {
      const newIds = await fetchAdjacentPage(navState.minPageLoaded - 1, 'prev');
      return newIds.length > 0 ? newIds[newIds.length - 1] : null;
    }

    return null; // Estamos en el primer lead de la página 1
  };


  // Funcionalidades para el front end
  const isFirstItem = useCallback((currentId: string) => {
    const currentIdx = navState.leadIds.indexOf(currentId);
    if (currentIdx === -1 || navState.minPageLoaded > 1) return false
    return currentIdx === 0
  }, [navState.minPageLoaded, navState.leadIds])

  const isLastItem = useCallback((currentId: string) => {
    const currentIdx = navState.leadIds.indexOf(currentId);
    if (currentIdx === -1 || navState.maxPageLoaded < navState.totalPages) return false
    return currentIdx === navState.leadIds.length - 1
  }, [navState.leadIds, navState.maxPageLoaded, navState.totalPages])

  const isNavigationValid = useCallback((currentId: string) => {
    const currentIdx = navState.leadIds.indexOf(currentId);
    return currentIdx !== -1;
  }, [navState.leadIds])

  return (
    <LeadNavigationContext.Provider value={{
      leadIds: navState.leadIds,
      isLoadingNavigation,
      setListContext, getNextLeadId, getPrevLeadId,
      isFirstItem, isLastItem, isNavigationValid
    }}>
      {children}
    </LeadNavigationContext.Provider>
  );
};

export const useLeadNavigation = () => {
  const context = useContext(LeadNavigationContext);
  if (context === undefined) {
    throw new Error('useLeadNavigation debe usarse dentro de un LeadNavigationProvider');
  }
  return context;
};