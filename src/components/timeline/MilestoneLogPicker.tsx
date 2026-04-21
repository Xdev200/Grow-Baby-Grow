import React, { useState, useMemo } from 'react';
import { useChild } from '../../context/ChildContext';
import { storageService } from '../../services/storage';
import type { MilestoneMaster, Domain } from '../../types';
import milestonesData from '../../data/milestones_aiims.json';
import styles from './MilestonePicker.module.css';

const ALL_MILESTONES = milestonesData as MilestoneMaster[];
const DOMAINS: Domain[] = ['gross_motor', 'fine_motor', 'language', 'socio_adaptive', 'hearing_vision'];

interface MilestoneLogPickerProps {
  onClose: () => void;
}

export const MilestoneLogPicker: React.FC<MilestoneLogPickerProps> = ({ onClose }) => {
  const { activeChild } = useChild();
  const [search, setSearch] = useState('');
  const [selectedDomain, setSelectedDomain] = useState<Domain | 'all'>('all');

  const filteredMilestones = useMemo(() => {
    return ALL_MILESTONES.filter(m => {
      const matchesSearch = m.milestone.toLowerCase().includes(search.toLowerCase());
      const matchesDomain = selectedDomain === 'all' || m.domain === selectedDomain;
      return matchesSearch && matchesDomain;
    }).slice(0, 50); // Performance optimization
  }, [search, selectedDomain]);

  const handleLog = async (milestone: MilestoneMaster) => {
    if (!activeChild) return;

    await storageService.saveMilestoneLog({
      id: crypto.randomUUID(),
      childId: activeChild.id,
      milestoneId: milestone.id,
      status: 'achieved',
      achievedDate: new Date().toISOString(),
      loggedAt: new Date().toISOString()
    });

    onClose();
    // In a real app, we'd trigger a global state update or toast here
  };

  return (
    <div className={styles.pickerOverlay}>
      <header className={styles.header}>
        <h2 style={{ fontSize: 18, fontWeight: 800 }}>Quick Log</h2>
        <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 24 }}>✕</button>
      </header>

      <div className={styles.searchBar}>
        <input 
          type="text" 
          placeholder="Search milestones..." 
          className={styles.searchInput}
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      <div className={styles.filterChips}>
        <div 
          className={`${styles.chip} ${selectedDomain === 'all' ? styles.chipActive : ''}`}
          onClick={() => setSelectedDomain('all')}
        >
          ALL
        </div>
        {DOMAINS.map(d => (
          <div 
            key={d}
            className={`${styles.chip} ${selectedDomain === d ? styles.chipActive : ''}`}
            onClick={() => setSelectedDomain(d)}
          >
            {d.replace('_', ' ').toUpperCase()}
          </div>
        ))}
      </div>

      <div className={styles.scrollArea}>
        {filteredMilestones.map(m => (
          <div key={m.id} className={styles.milestoneItem}>
            <span className={styles.milestoneText}>{m.milestone}</span>
            <button 
              className={styles.logButton}
              onClick={() => handleLog(m)}
            >
              Log
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};
