import React from 'react';
import type { MilestoneMaster } from '../../types';
import styles from './Timeline.module.css';

interface TimelineNodeProps {
  milestone: MilestoneMaster;
  isAchieved: boolean;
  isUpcoming: boolean;
  ageMonthGroup?: number;
  assessmentAgeMonths?: number;
  innerRef?: React.RefObject<HTMLDivElement | null>;
}

export const TimelineNode: React.FC<TimelineNodeProps> = ({ 
  milestone, 
  isAchieved, 
  isUpcoming,
  ageMonthGroup,
  assessmentAgeMonths,
  innerRef
}) => {
  const domainColors: Record<string, string> = {
    gross_motor: 'var(--primary-light)',
    fine_motor: '#f0fdf4',
    language: '#eff6ff',
    socio_adaptive: '#faf5ff',
    hearing_vision: '#fff1f2'
  };

  const domainText: Record<string, string> = {
    gross_motor: 'var(--primary-dark)',
    fine_motor: '#16a34a',
    language: '#2563eb',
    socio_adaptive: '#9333ea',
    hearing_vision: '#e11d48'
  };

  return (
    <div 
      ref={innerRef}
      className={`${styles.nodeWrapper} ${isUpcoming ? styles.nodeFocus : ''}`}
    >
      {ageMonthGroup !== undefined && (
        <span className={styles.ageGroupLabel}>Month {ageMonthGroup}</span>
      )}
      
      <div className={`${styles.milestoneCard} ${(milestone.isRedFlag && milestone.ageMonths <= (assessmentAgeMonths || 0) && !isAchieved) ? styles.redFlag : ''}`}>
        {(milestone.isRedFlag && milestone.ageMonths <= (assessmentAgeMonths || 0) && !isAchieved) && <span className={styles.redFlagTag}>RED FLAG</span>}
        
        <p className={styles.milestoneTitle}>
          {milestone.milestone.trim().charAt(0).toUpperCase() + milestone.milestone.trim().slice(1)}
        </p>
        
        {(milestone.laymanDescription || milestone.howToTest) && (
          <div className={styles.detailsContainer}>
            <details className={styles.details}>
              <summary className={styles.summary}>
                <span>Parent-friendly info & test</span>
              </summary>
              <div className={styles.detailsContent}>
                {milestone.laymanDescription && (
                  <div className={styles.description}>
                    <strong>What it means:</strong> {milestone.laymanDescription}
                  </div>
                )}
                {milestone.howToTest && (
                  <div className={styles.test}>
                    <strong>How to test:</strong> {milestone.howToTest}
                  </div>
                )}
              </div>
            </details>
          </div>
        )}
        
        <div className={styles.footer}>
          <span 
            className={styles.domainBadge}
            style={{ 
              backgroundColor: domainColors[milestone.domain], 
              color: domainText[milestone.domain] 
            }}
          >
            {milestone.domain.replace('_', ' ')}
          </span>

          {isAchieved && (
            <span className={styles.statusIndicator}>
              ✓ Achieved
            </span>
          )}
          {isUpcoming && !isAchieved && (
            <span className={styles.statusIndicator} style={{ color: 'var(--amber)' }}>
              Next Up
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
