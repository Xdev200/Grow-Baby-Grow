import React from 'react';
import type { MilestoneMaster, MilestoneStatus } from '../../types';
import styles from './Quiz.module.css';

interface QuestionCardProps {
  milestone: MilestoneMaster;
  onAnswer: (status: MilestoneStatus) => void;
  childAgeMonths: number;
  selectedAnswer?: MilestoneStatus;
}

export const QuestionCard: React.FC<QuestionCardProps> = ({ 
  milestone, 
  onAnswer, 
  childAgeMonths,
  selectedAnswer
}) => {
  const isOverdue = childAgeMonths > milestone.ageMonths;
  const isUpcoming = childAgeMonths < milestone.ageMonths;
  const isMatchesAge = childAgeMonths === milestone.ageMonths;

  return (
    <div className={styles.questionCard}>
      <div className={styles.clinicalHeader}>
        {isOverdue && <span className={styles.overdueBadge}>Past Stage Verification</span>}
        {isMatchesAge && <span className={styles.currentBadge}>Current Stage</span>}
        {isUpcoming && <span className={styles.futureBadge}>Early Achievement Check</span>}
      </div>

      <h2 className={styles.questionText}>
        {milestone.laymanDescription || milestone.milestone}
      </h2>
      
      {milestone.howToTest && (
        <div className={styles.howToTestContainer}>
          <details className={styles.testDetails}>
            <summary className={styles.testSummary}>
              <span>💡 How to test at home</span>
              <svg className={styles.chevronIcon} viewBox="0 0 20 20" fill="currentColor" width="16" height="16">
                <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
              </svg>
            </summary>
            <p className={styles.testInstructions}>{milestone.howToTest}</p>
          </details>
        </div>
      )}
      
      <div className={styles.milestoneMeta}>
        <div className={styles.ageInfo}>
          Expected by: <strong>{milestone.ageMonths} month{milestone.ageMonths !== 1 ? 's' : ''}</strong>
        </div>
        
        {milestone.isRedFlag && (
          <div className={styles.redFlagIndicator}>
            🚩 Red Flag Milestone
          </div>
        )}
      </div>

      <div className={styles.optionsGrid}>
        <button 
          className={`${styles.optionButton} ${styles.optAchieved} ${selectedAnswer === 'achieved' ? styles.optionSelected : ''}`}
          onClick={() => onAnswer('achieved')}
        >
          ✅ Yes, definitely
        </button>
        <button 
          className={`${styles.optionButton} ${styles.optPartial} ${selectedAnswer === 'partial' ? styles.optionSelected : ''}`}
          onClick={() => onAnswer('partial')}
        >
          🟡 Sometimes / Partially
        </button>
        <button 
          className={`${styles.optionButton} ${styles.optNotYet} ${selectedAnswer === 'not_yet' ? styles.optionSelected : ''}`}
          onClick={() => onAnswer('not_yet')}
        >
          ❌ Not yet
        </button>
        <button 
          className={`${styles.optionButton} ${styles.optNotSure} ${selectedAnswer === 'deferred' ? styles.optionSelected : ''}`}
          onClick={() => onAnswer('deferred')}
        >
          ❔ Not sure
        </button>
      </div>
    </div>
  );
};
