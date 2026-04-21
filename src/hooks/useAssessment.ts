import { useState, useEffect, useMemo } from 'react';
import { useChild } from '../context/ChildContext';
import { calculateAge } from '../utils/age';
import { storageService } from '../services/storage';
import type { Domain, MilestoneLog } from '../types';
import { PROCESSED_MILESTONES as ALL_MILESTONES } from '../data/milestoneProcessor';

export interface DomainProgress {
  domain: Domain;
  name: string;
  total: number;
  achieved: number;
  color: string;
}

export const useAssessment = () => {
  const { activeChild } = useChild();
  const [logs, setLogs] = useState<MilestoneLog[]>([]);

  const ageData = useMemo(() => {
    if (!activeChild) return null;
    return calculateAge(new Date(activeChild.dob), activeChild.gestationalWeeks);
  }, [activeChild]);

  useEffect(() => {
    if (activeChild) {
      storageService.getMilestoneLogs(activeChild.id).then(setLogs);
    }
  }, [activeChild]);

  const domainProgress: DomainProgress[] = useMemo(() => {
    if (!ageData) return [];

    const domains: { domain: Domain; name: string; color: string }[] = [
      { domain: 'gross_motor', name: 'Gross Motor', color: '#1D9E75' },
      { domain: 'fine_motor', name: 'Fine Motor', color: '#BA7517' },
      { domain: 'language', name: 'Language', color: '#3b82f6' },
      { domain: 'socio_adaptive', name: 'Social', color: '#D85A30' },
      { domain: 'hearing_vision', name: 'Sensory', color: '#8b5cf6' },
    ];

    // Filter milestones up to current age band
    const relevantMilestones = ALL_MILESTONES.filter(m => m.ageMonths <= ageData.assessmentAgeMonths);

    return domains.map(d => {
      const milestonesInDomain = relevantMilestones.filter(m => m.domain === d.domain);
      const achievedInDomain = logs.filter(l => 
        milestonesInDomain.some(m => m.id === l.milestoneId) && l.status === 'achieved'
      ).length;

      return {
        ...d,
        total: milestonesInDomain.length,
        achieved: achievedInDomain
      };
    });
  }, [ageData, logs]);

  const triggeredRedFlags = useMemo(() => {
    if (!ageData) return [];
    
    // Check all milestones with isRedFlag=true up to current assessment age
    const redFlagMilestones = ALL_MILESTONES.filter(m => m.isRedFlag && m.ageMonths <= ageData.assessmentAgeMonths);
    
    // Find those that are NOT achieved (either not present in logs or status is not 'achieved')
    return redFlagMilestones.filter(m => {
      const log = logs.find(l => l.milestoneId === m.id);
      return !log || log.status !== 'achieved';
    });
  }, [ageData, logs]);

  return {
    ageData,
    domainProgress,
    triggeredRedFlags,
    refreshLogs: () => activeChild && storageService.getMilestoneLogs(activeChild.id).then(setLogs)
  };
};
