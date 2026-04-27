import { useState, useEffect, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
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
  const { t } = useTranslation();
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
      { domain: 'gross_motor' as Domain, name: t('domains.gross_motor'), color: '#1D9E75' },
      { domain: 'fine_motor' as Domain, name: t('domains.fine_motor'), color: '#BA7517' },
      { domain: 'language' as Domain, name: t('domains.language'), color: '#3b82f6' },
      { domain: 'socio_adaptive' as Domain, name: t('domains.socio_adaptive'), color: '#D85A30' },
      { domain: 'hearing_vision' as Domain, name: t('domains.hearing_vision'), color: '#8b5cf6' },
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
  }, [ageData, logs, t]);

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
