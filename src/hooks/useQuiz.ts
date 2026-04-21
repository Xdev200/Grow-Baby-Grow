import { useState, useMemo } from 'react';
import { useChild } from '../context/ChildContext';
import { calculateAge } from '../utils/age';
import { storageService } from '../services/storage';
import type { MilestoneStatus, Domain, MilestoneLog, MilestoneMaster } from '../types';
import { PROCESSED_MILESTONES as ALL_MILESTONES } from '../data/milestoneProcessor';

export const useQuiz = () => {
  const { activeChild } = useChild();
  const [currentIndex, setCurrentIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<string, MilestoneStatus>>({});
  const [isComplete, setIsComplete] = useState(false);

  // Group milestones by domain and filter for latest age bracket for EACH domain
  const { relevantMilestones, childAgeMonths, allAssessmentMilestones } = useMemo(() => {
    if (!activeChild) return { relevantMilestones: [], childAgeMonths: 0, allAssessmentMilestones: [] };
    const ageData = calculateAge(new Date(activeChild.dob), activeChild.gestationalWeeks);
    const assessmentAge = ageData.assessmentAgeMonths;
    
    // AIIMS Standard: Assessment is done for milestones up to the current age band
    const allForAge = ALL_MILESTONES.filter(m => m.ageMonths <= assessmentAge);
    
    // Get latest milestone for EACH domain
    const domains: Domain[] = ['hearing_vision', 'gross_motor', 'fine_motor', 'language', 'socio_adaptive'];
    const questonableMilestones: MilestoneMaster[] = [];

    domains.forEach(domain => {
      const domainMilestones = allForAge.filter(m => m.domain === domain);
      if (domainMilestones.length > 0) {
        // Find the latest age bracket for this domain
        const latestAge = Math.max(...domainMilestones.map(m => m.ageMonths));
        // Include all milestones from this latest age for this domain
        const latestDomainMilestones = domainMilestones.filter(m => m.ageMonths === latestAge);
        questonableMilestones.push(...latestDomainMilestones);
      }
    });

    // Sort by domain: Prioritizing Hearing & Vision as requested
    const domainOrder: Domain[] = ['hearing_vision', 'gross_motor', 'fine_motor', 'language', 'socio_adaptive'];
    const sorted = [...questonableMilestones].sort((a, b) => {
      if (a.domain !== b.domain) {
        return domainOrder.indexOf(a.domain) - domainOrder.indexOf(b.domain);
      }
      return 0;
    });

    return { 
      relevantMilestones: sorted, 
      childAgeMonths: assessmentAge,
      allAssessmentMilestones: allForAge
    };
  }, [activeChild]);

  const currentMilestone = relevantMilestones[currentIndex];
  const progress = relevantMilestones.length > 0 
    ? ((currentIndex) / relevantMilestones.length) * 100 
    : 0;

  const saveResults = async (finalAnswers: Record<string, MilestoneStatus>) => {
    if (!activeChild) return;

    // 1. Create logs for the answered milestones
    const answeredLogs: MilestoneLog[] = Object.entries(finalAnswers).map(([id, s]) => ({
      id: crypto?.randomUUID ? crypto.randomUUID() : `log-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      childId: activeChild.id,
      milestoneId: id,
      status: s as MilestoneStatus,
      loggedAt: new Date().toISOString()
    }));

    // 2. "Fast Onboarding" Logic: Auto-achieve all milestones OLDER than the ones being quizzed
    const quizzedIds = new Set(relevantMilestones.map(m => m.id));
    const autoAchievedLogs: MilestoneLog[] = allAssessmentMilestones
      .filter(m => !quizzedIds.has(m.id))
      .map(m => ({
        id: crypto?.randomUUID ? crypto.randomUUID() : `log-auto-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        childId: activeChild.id,
        milestoneId: m.id,
        status: 'achieved' as MilestoneStatus,
        loggedAt: new Date().toISOString(),
        notes: 'Auto-achieved during fast onboarding'
      }));

    const allLogs = [...answeredLogs, ...autoAchievedLogs];

    for (const log of allLogs) {
      await storageService.saveMilestoneLog(log);
    }

    setIsComplete(true);
  };

  const handleAnswer = async (status: MilestoneStatus) => {
    if (!currentMilestone || !activeChild) return;

    const newAnswers = {
      ...answers,
      [currentMilestone.id]: status
    };
    
    setAnswers(newAnswers);

    if (currentIndex < relevantMilestones.length - 1) {
      setCurrentIndex(prev => prev + 1);
    } else {
      await saveResults(newAnswers);
    }
  };

  const skipQuiz = async () => {
    // Still perform auto-achievement even if quiz is skipped
    await saveResults({});
    setIsComplete(true);
  };

  const calculateResults = () => {
    let status: 'on_track' | 'watch' | 'lagging' = 'on_track';
    const redFlags: MilestoneMaster[] = [];
    const watchItems: MilestoneMaster[] = [];

    relevantMilestones.forEach(m => {
      const answer = answers[m.id];
      if (!answer) return;
      
      if (m.isRedFlag && (answer === 'not_yet' || answer === 'partial')) {
        status = 'lagging';
        redFlags.push(m);
      } else if (answer === 'not_yet') {
        if (status !== 'lagging') status = 'watch';
        watchItems.push(m);
      } else if (answer === 'partial') {
        if (status !== 'lagging' && status !== 'watch') status = 'watch';
        watchItems.push(m);
      }
    });

    return { status, redFlags, watchItems };
  };

  return {
    relevantMilestones,
    currentMilestone,
    currentIndex,
    progress,
    handleAnswer,
    skipQuiz,
    isComplete,
    calculateResults,
    childAgeMonths,
    resetQuiz: () => {
      setCurrentIndex(0);
      setAnswers({});
      setIsComplete(false);
    }
  };
};
