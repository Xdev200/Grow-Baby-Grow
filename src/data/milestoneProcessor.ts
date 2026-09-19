import milestonesData from './milestones_aiims.json';
import type { MilestoneMaster } from '../types';

/**
 * AIIMS standard milestones sometimes group tasks with semicolons.
 * This processor splits them into individual atomic tasks for better tracking.
 */
/**
 * Domains whose milestones should NEVER be split on semicolons.
 * Hearing & Vision birth milestones are compound clinical descriptions
 * (e.g. "Startles to loud sounds; quiets to mother's voice") that
 * describe a single assessment item — splitting them creates
 * duplicate quiz questions.
 */
const NEVER_SPLIT_DOMAINS: string[] = ['hearing', 'vision'];

export const getProcessedMilestones = (): MilestoneMaster[] => {
  return (milestonesData as MilestoneMaster[]).flatMap(m => {
    // Don't split hearing/vision milestones — they are compound descriptions
    if (NEVER_SPLIT_DOMAINS.includes(m.domain)) {
      return [m];
    }
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
