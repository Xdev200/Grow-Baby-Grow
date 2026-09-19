import React, { createContext, useContext, useState, useEffect, useMemo, type ReactNode } from 'react';
import type { Child } from '../types';
import { storageService } from '../services/storage';
import { preferencesService } from '../services/preferencesService';
import { calculateAge, type AgeResult } from '../utils/age';

interface ChildContextType {
  activeChild: Child | null;
  ageData: AgeResult | null;
  children: Child[];
  loading: boolean;
  setChild: (child: Child) => Promise<void>;
  selectChild: (id: string) => void;
  deleteChild: (id: string) => Promise<void>;
  updateGrowth: (weight?: number, height?: number) => Promise<void>;
  refreshChildren: () => Promise<void>;
}

const ChildContext = createContext<ChildContextType | undefined>(undefined);

export const ChildProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [activeChild, setActiveChild] = useState<Child | null>(null);
  const [allChildren, setAllChildren] = useState<Child[]>([]);
  const [loading, setLoading] = useState(true);

  const refreshChildren = async () => {
    try {
      const data = await storageService.getAllChildren();
      setAllChildren(data);
      
      // Auto-select latest child if none active
      const activeId = preferencesService.getActiveChildId();
      if (activeId) {
        const found = data.find(c => c.id === activeId);
        if (found) setActiveChild(found);
      } else if (data.length > 0) {
        setActiveChild(data[0]);
        preferencesService.setActiveChildId(data[0].id);
      }
    } catch (error) {
      console.error('Failed to load children:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshChildren();
  }, []);

  const setChild = async (child: Child) => {
    await storageService.saveChild(child);
    await refreshChildren();
    setActiveChild(child);
    preferencesService.setActiveChildId(child.id);
  };

  const selectChild = (id: string) => {
    const found = allChildren.find(c => c.id === id);
    if (found) {
      setActiveChild(found);
      preferencesService.setActiveChildId(id);
    }
  };

  const deleteChild = async (id: string) => {
    await storageService.deleteChild(id);
    if (activeChild?.id === id) {
      setActiveChild(null);
      preferencesService.removeActiveChildId();
    }
    await refreshChildren();
  };

  const updateGrowth = async (weight?: number, height?: number) => {
    if (!activeChild) return;
    const updated = {
      ...activeChild,
      currentWeightKg: weight ?? activeChild.currentWeightKg,
      currentHeightCm: height ?? activeChild.currentHeightCm
    };
    await storageService.saveChild(updated);
    setActiveChild(updated);
    setAllChildren(prev => prev.map(c => c.id === updated.id ? updated : c));
  };

  const ageData = useMemo(() => {
    if (!activeChild) return null;
    return calculateAge(new Date(activeChild.dob), activeChild.gestationalWeeks);
  }, [activeChild]);

  return (
    <ChildContext.Provider value={{ 
      activeChild, 
      ageData,
      children: allChildren, 
      loading, 
      setChild, 
      selectChild, 
      deleteChild,
      updateGrowth,
      refreshChildren 
    }}>
      {children}
    </ChildContext.Provider>
  );
};

export const useChild = () => {
  const context = useContext(ChildContext);
  if (context === undefined) {
    throw new Error('useChild must be used within a ChildProvider');
  }
  return context;
};
