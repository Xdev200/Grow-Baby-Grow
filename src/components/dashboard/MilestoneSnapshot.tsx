import type { MilestoneMaster } from '../../types';
import { formatDomainName } from '../../utils/childHelpers';
import styles from './Dashboard.module.css';

export interface MilestoneSnapshotProps {
  childName: string;
  activeTab: 'upcoming' | 'latest';
  nextStageLabel: string;
  upcomingMilestones: MilestoneMaster[];
  latestAchievedMilestones: MilestoneMaster[];
  onTabChange: (tab: 'upcoming' | 'latest') => void;
}

export const MilestoneSnapshot = ({
  childName,
  activeTab,
  nextStageLabel,
  upcomingMilestones,
  latestAchievedMilestones,
  onTabChange,
}: MilestoneSnapshotProps) => {
  return (
    <div className={styles.milestoneHighlightSection}>
      <div className={styles.sectionHeader}>
        <h3>Milestones</h3>
      </div>

      {/* Sleek Material Design full-width tab bar OUTSIDE the card area */}
      <div className={styles.materialTabHeader}>
        <button
          type="button"
          className={`${styles.materialTabButton} ${activeTab === 'upcoming' ? styles.materialTabButtonActive : ''
            }`}
          onClick={() => onTabChange('upcoming')}
        >
          Upcoming
        </button>
        <button
          type="button"
          className={`${styles.materialTabButton} ${activeTab === 'latest' ? styles.materialTabButtonActive : ''
            }`}
          onClick={() => onTabChange('latest')}
        >
          Last
        </button>
      </div>

      {/* Card area below the full-width tabs */}
      <div className={styles.tabContentCard}>
        <div className={styles.tabContent}>
          {activeTab === 'upcoming' ? (
            <>
              <div className={styles.targetStageSubheader}>
                <span>Milestones expected at next assessment stage :</span>
                <span className={styles.targetStageBadge}>{nextStageLabel}</span>
              </div>
              <div className={styles.highlightCardList}>
                {upcomingMilestones.length > 0 ? (
                  upcomingMilestones.map((m) => (
                    <div key={m.id} className={styles.highlightCardItem}>
                      <div className={styles.highlightItemMeta}>
                        <span className={styles.domainChip}>{formatDomainName(m.domain)}</span>
                        <span className={styles.ageChip}>{m.ageMonths}m</span>
                      </div>
                      <p className={styles.highlightItemText}>{m.milestone}</p>
                    </div>
                  ))
                ) : (
                  <p className={styles.emptyText} style={{ margin: 0, fontSize: '12px' }}>
                    All target milestones for {nextStageLabel} achieved!
                  </p>
                )}
              </div>
            </>
          ) : (
            <div className={styles.highlightCardList}>
              {latestAchievedMilestones.length > 0 ? (
                latestAchievedMilestones.map((m) => (
                  <div key={m.id} className={styles.highlightCardItem}>
                    <div className={styles.highlightItemMeta}>
                      <span className={styles.domainChip}>{formatDomainName(m.domain)}</span>
                      <span className={styles.ageChip}>{m.ageMonths}m</span>
                    </div>
                    <p className={styles.highlightItemText}>{m.milestone}</p>
                  </div>
                ))
              ) : (
                <p className={styles.emptyText} style={{ margin: 0, fontSize: '12px' }}>
                  No milestones logged as achieved yet.
                </p>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
