import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import { getFilteredLeads, getLeads } from '../components/lead/leadService'; 
import type { LeadFilter, LeadListParams } from '../types/common';

interface NavState {
  leadIds: number[];
  filters: LeadFilter[];
  baseParams: LeadListParams | null;
  minPageLoaded: number;
  maxPageLoaded: number;
  totalPages: number;
}

interface LeadNavigationContextProps {
  leadIds: number[];
  isLoadingNavigation: boolean;
  setListContext: (
    ids: number[], 
    params: LeadListParams, 
    filters: LeadFilter[], 
    totalPages: number
  ) => void;
  getNextLeadId: (currentId: number) => Promise<number | null>;
  getPrevLeadId: (currentId: number) => Promise<number | null>;
}

const LeadNavigationContext = createContext<LeadNavigationContextProps | undefined>(undefined);

const STORAGE_KEY = 'crm_lead_navigation_state';

export const LeadNavigationProvider = ({ children }: { children: ReactNode }) => {
  const [navState, setNavState] = useState<NavState>(() => {
    // Recuperar el estado del sessionStorage al recargar la página (F5)
    const stored = sessionStorage.getItem(STORAGE_KEY);
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (e) {
        console.error("Error parsing stored lead navigation state", e);
      }
    }
    return {
      leadIds: [],
      filters: [],
      baseParams: null,
      minPageLoaded: 1,
      maxPageLoaded: 1,
      totalPages: 1,
    };
  });

  const [isLoadingNavigation, setIsLoadingNavigation] = useState(false);

  // Guardar en sessionStorage cada vez que el estado cambia
  useEffect(() => {
    if (navState.leadIds.length > 0) {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(navState));
    }
  }, [navState]);

  // Sincronizar desde la tabla (LeadList)
  const setListContext = useCallback((
    ids: number[], 
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

  const fetchAdjacentPage = async (pageToFetch: number, direction: 'next' | 'prev'): Promise<number[]> => {
    if (!navState.baseParams) return [];
    
    setIsLoadingNavigation(true);
    try {
      const newParams = { ...navState.baseParams, page: pageToFetch };
      const response = navState.filters.length > 0
        ? await getFilteredLeads({ filters: navState.filters }, newParams)
        : await getLeads(newParams);

      const fetchedIds = response.items.map((lead: any) => lead.id);

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

  const getNextLeadId = async (currentId: number): Promise<number | null> => {
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

  const getPrevLeadId = async (currentId: number): Promise<number | null> => {
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

  return (
    <LeadNavigationContext.Provider value={{
      leadIds: navState.leadIds,
      isLoadingNavigation,
      setListContext,
      getNextLeadId,
      getPrevLeadId
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