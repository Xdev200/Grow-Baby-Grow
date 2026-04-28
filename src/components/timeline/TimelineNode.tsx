import React from 'react';
import type { MilestoneMaster } from '../../types';
import styles from './Timeline.module.css';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();

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

  const translatedMilestoneTitle = t(`milestones_data.${milestone.id}.milestone`, { defaultValue: milestone.milestone });
  const translatedLaymanDesc = t(`milestones_data.${milestone.id}.laymanDescription`, { defaultValue: milestone.laymanDescription });
  const translatedHowToTest = t(`milestones_data.${milestone.id}.howToTest`, { defaultValue: milestone.howToTest });

  // For domain text, since domain is in the format 'gross_motor' etc., we can translate it if needed. 
  // Let's use `t` for domain, or leave as is if not in translation file. 
  // Wait, domain is translated in `onboarding` or `dashboard` perhaps?
  // Let's just use `domain.replace('_', ' ')` for now, or check translation later. We'll use t(`domain.${milestone.domain}`, { defaultValue: milestone.domain.replace('_', ' ') })
  const translatedDomain = t(`domains.${milestone.domain}`, { defaultValue: milestone.domain.replace('_', ' ') });

  return (
    <div 
      ref={innerRef}
      className={`${styles.nodeWrapper} ${isUpcoming ? styles.nodeFocus : ''}`}
    >
      {ageMonthGroup !== undefined && (
        <span className={styles.ageGroupLabel}>{t('timeline_node.month_label', { month: ageMonthGroup, defaultValue: `Month ${ageMonthGroup}` })}</span>
      )}
      
      <div className={`${styles.milestoneCard} ${(milestone.isRedFlag && milestone.ageMonths <= (assessmentAgeMonths || 0) && !isAchieved) ? styles.redFlag : ''}`}>
        {(milestone.isRedFlag && milestone.ageMonths <= (assessmentAgeMonths || 0) && !isAchieved) && <span className={styles.redFlagTag}>{t('timeline_node.red_flag', 'RED FLAG')}</span>}
        
        <p className={styles.milestoneTitle}>
          {translatedMilestoneTitle.trim().charAt(0).toUpperCase() + translatedMilestoneTitle.trim().slice(1)}
        </p>
        
        {(translatedLaymanDesc || translatedHowToTest) && (
          <div className={styles.detailsContainer}>
            <details className={styles.details}>
              <summary className={styles.summary}>
                <span>{t('timeline_node.parent_friendly_info', 'Parent-friendly info & test')}</span>
              </summary>
              <div className={styles.detailsContent}>
                {translatedLaymanDesc && (
                  <div className={styles.description}>
                    <strong>{t('timeline_node.what_it_means', 'What it means:')}</strong> {translatedLaymanDesc}
                  </div>
                )}
                {translatedHowToTest && (
                  <div className={styles.test}>
                    <strong>{t('timeline_node.how_to_test', 'How to test:')}</strong> {translatedHowToTest}
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
            {translatedDomain}
          </span>

          {isAchieved && (
            <span className={styles.statusIndicator}>
              ✓ {t('timeline_node.achieved', 'Achieved')}
            </span>
          )}
          {isUpcoming && !isAchieved && (
            <span className={styles.statusIndicator} style={{ color: 'var(--amber)' }}>
              {t('timeline_node.next_up', 'Next Up')}
            </span>
          )}
        </div>
      </div>
    </div>
  );
};
