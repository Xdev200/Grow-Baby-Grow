import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import type { Child } from '../types';
import { storageService } from '../services/storage';

interface ChildContextType {
  activeChild: Child | null;
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
      const activeId = localStorage.getItem('activeChildId');
      if (activeId) {
        const found = data.find(c => c.id === activeId);
        if (found) setActiveChild(found);
      } else if (data.length > 0) {
        setActiveChild(data[0]);
        localStorage.setItem('activeChildId', data[0].id);
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
    localStorage.setItem('activeChildId', child.id);
  };

  const selectChild = (id: string) => {
    const found = allChildren.find(c => c.id === id);
    if (found) {
      setActiveChild(found);
      localStorage.setItem('activeChildId', id);
    }
  };

  const deleteChild = async (id: string) => {
    await storageService.deleteChild(id);
    if (activeChild?.id === id) {
      setActiveChild(null);
      localStorage.removeItem('activeChildId');
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

  return (
    <ChildContext.Provider value={{ 
      activeChild, 
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
