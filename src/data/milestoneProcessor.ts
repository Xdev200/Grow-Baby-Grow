import milestonesData from './milestones_aiims.json';
import type { MilestoneMaster } from '../types';

/**
 * AIIMS standard milestones sometimes group tasks with semicolons.
 * This processor splits them into individual atomic tasks for better tracking.
 */
export const getProcessedMilestones = (): MilestoneMaster[] => {
  return (milestonesData as MilestoneMaster[]).flatMap(m => {
    if (m.milestone.includes(';')) {
      return m.milestone.split(';').map((text, i) => ({
        ...m,
        id: `${m.id}_${i}`,
        milestone: text.trim(),
        originalId: m.id // Keep track of parent for reporting
      }));
    }
    return [m];
  });
};

export const PROCESSED_MILESTONES = getProcessedMilestones();
