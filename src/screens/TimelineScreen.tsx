import React, { useMemo } from 'react';
import { useTimeline } from '../hooks/useTimeline';
import { TimelineNode } from '../components/timeline/TimelineNode';
import { MilestoneLogPicker } from '../components/timeline/MilestoneLogPicker';
import type { MilestoneMaster } from '../types';
import styles from '../components/timeline/Timeline.module.css';

export const TimelineScreen: React.FC = () => {
  const { timelineData, childAgeMonths, assessmentAgeMonths, milestoneLogs } = useTimeline();
  const [showPicker, setShowPicker] = React.useState(false);
  
  const currentAgeRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (currentAgeRef.current) {
      currentAgeRef.current.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  }, [timelineData]);

  const groupedData = useMemo(() => {
    const groups: Record<number, Record<string, MilestoneMaster[]>> = {};
    
    timelineData.forEach(m => {
      const age = m.ageMonths;
      if (!groups[age]) groups[age] = {};
      if (!groups[age][m.domain]) groups[age][m.domain] = [];
      groups[age][m.domain].push(m);
    });
    
    return groups;
  }, [timelineData]);

  const ages = Object.keys(groupedData).map(Number).sort((a, b) => a - b);

  return (
    <div className={styles.timelineContainer}>
      <header className={styles.timelineHeader}>
        <h1 className={styles.timelineTitle}>Development Track</h1>
        <p className={styles.timelineSubtitle}>
          Expected milestones for {childAgeMonths} months
        </p>
      </header>

      <div className={styles.list}>
        {ages.length > 0 ? (
          ages.map((age) => (
            <div key={age} className={styles.ageGroup} ref={age === assessmentAgeMonths ? currentAgeRef : undefined}>
              <div className={styles.ageDivider}>
                <span>{age === 0 ? 'Birth' : `${age} Month${age !== 1 ? 's' : ''}`}</span>
              </div>
              
              {Object.entries(groupedData[age]).map(([domain, milestones]) => (
                <div key={domain} className={styles.domainGroup}>
                  <h4 className={styles.domainHeaderSmall}>{domain.replace('_', ' ').toUpperCase()}</h4>
                  {milestones.map(m => {
                    const log = milestoneLogs.find((l: any) => l.milestoneId === m.id);
                    const isAchieved = log?.status === 'achieved';
                    
                    return (
                      <TimelineNode 
                        key={m.id} 
                        milestone={m} 
                        isAchieved={isAchieved}
                        isUpcoming={m.ageMonths === assessmentAgeMonths}
                        assessmentAgeMonths={assessmentAgeMonths}
                      />
                    );
                  })}
                </div>
              ))}
            </div>
          ))
        ) : (
          <div className={styles.emptyState}>
            <p>No clinical milestones found.</p>
          </div>
        )}
      </div>

      <button 
        className={styles.fab} 
        onClick={() => setShowPicker(true)}
      >
        +
      </button>

      {showPicker && (
        <MilestoneLogPicker onClose={() => setShowPicker(false)} />
      )}
    </div>
  );
};
