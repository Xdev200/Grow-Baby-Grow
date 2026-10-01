import { useMemo, useState, useEffect } from 'react';
import { useChild } from '../context/ChildContext';
import { storageService } from '../services/storage';
import type { MilestoneLog } from '../types';
import { PROCESSED_MILESTONES as ALL_MILESTONES } from '../data/milestoneProcessor';

export const useTimeline = () => {
  const { activeChild, ageData } = useChild();
  const [milestoneLogs, setMilestoneLogs] = useState<MilestoneLog[]>([]);

  useEffect(() => {
    if (activeChild) {
      storageService.getMilestoneLogs(activeChild.id).then(setMilestoneLogs);
    }
  }, [activeChild]);

  const info = useMemo(() => {
    if (!activeChild || !ageData) return { timelineData: [], assessmentAgeMonths: 0, childAgeMonths: 0, milestoneLogs: [] };

    const assessmentAge = ageData.assessmentAgeMonths;

    // Return milestones up to 36 months to allow scrolling
    const relevant = ALL_MILESTONES.filter(m => m.ageMonths <= 36);

    return {
      timelineData: relevant.sort((a, b) => a.ageMonths - b.ageMonths),
      assessmentAgeMonths: assessmentAge,
      childAgeMonths: assessmentAge,
      milestoneLogs
    };
  }, [activeChild, milestoneLogs]);

  return info;
};
