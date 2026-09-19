import type { Child } from '../../types';
import { getChildEmoji } from '../../utils/childHelpers';
import { calculateAge } from '../../utils/age';
import styles from './Dashboard.module.css';

export interface ChildCardStats {
  achieved: number;
  redFlags: number;
  pendingVaccines: number;
  weight: number | null;
  height: number | null;
  lastEntry: string;
  latestAchievedTitle?: string;
  nextUpcomingTitle?: string;
}

export interface ChildHeroSectionProps {
  childrenList: Child[];
  activeChild: Child;
  childStats: Record<string, ChildCardStats>;
  expandedChildId: string | null;
  onSelectChild: (id: string) => void;
  onToggleExpand: (id: string) => void;
  onAddChild: () => void;
}

export const ChildHeroSection = ({
  childrenList,
  activeChild,
  childStats,
  expandedChildId,
  onSelectChild,
  onToggleExpand,
  onAddChild,
}: ChildHeroSectionProps) => {
  return (
    <section className={styles.heroSection}>
      <div className={styles.heroHeader}>
        <div className={styles.heroTitleGroup}>
          <h2 className={styles.heroGreeting}>My Children</h2>
          <span className={styles.childCountBadge}>
            {childrenList.length} {childrenList.length === 1 ? 'child' : 'children'}
          </span>
        </div>

        <button
          type="button"
          className={styles.heroAddChildBtn}
          onClick={onAddChild}
          title="Register another child"
        >
          <span>➕</span>
          <span>Add Child</span>
        </button>
      </div>

      <div className={styles.heroChildList}>
        {childrenList.map((child) => {
          const isActive = child.id === activeChild.id;
          const isExpanded = expandedChildId === child.id;
          const cAge = calculateAge(new Date(child.dob), child.gestationalWeeks);
          const stats = childStats[child.id] || {
            achieved: 0,
            redFlags: 0,
            pendingVaccines: 0,
            weight: child.currentWeightKg ?? child.birthWeightKg ?? null,
            height: child.currentHeightCm ?? child.birthHeightCm ?? null,
            lastEntry: 'No entries yet',
          };

          return (
            <div
              key={child.id}
              className={`${styles.childHeroCard} ${isActive ? styles.childHeroCardActive : ''}`}
            >
              <div
                className={styles.cardMainRow}
                onClick={() => onSelectChild(child.id)}
                title={isActive ? undefined : 'Switch active child'}
              >
                <div className={styles.childInfo}>
                  <div className={styles.heroAvatar}>{getChildEmoji(child.gender)}</div>
                  <div>
                    <div className={styles.nameBadgeRow}>
                      <h3 className={styles.heroName}>{child.name}</h3>
                      {isActive ? (
                        <span className={styles.activeBadge}>Active</span>
                      ) : (
                        <span className={styles.switchBadge}>Tap to select</span>
                      )}
                    </div>
                    <p className={styles.heroAge}>{cAge.displayAge}</p>
                  </div>
                </div>

                <button
                  type="button"
                  className={styles.expandToggleBtn}
                  onClick={(e) => {
                    e.stopPropagation();
                    onToggleExpand(child.id);
                  }}
                  aria-label={isExpanded ? 'Collapse details' : 'Expand details'}
                >
                  <span className={styles.expandLabel}>{isExpanded ? 'Less' : 'Details'}</span>
                  <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>
                    ▼
                  </span>
                </button>
              </div>

              {/* Primary KPI status: milestones, red flags, pending vaccines */}
              <div className={styles.heroSummaryRow}>
                <div className={styles.summaryBadge}>
                  <span className={styles.badgeIcon}>🎯</span>
                  <span className={styles.badgeText}>
                    <strong>{stats.achieved}</strong> milestones
                  </span>
                </div>

                <div
                  className={`${styles.summaryBadge} ${
                    stats.redFlags > 0 ? styles.redFlagBadge : styles.neutralBadge
                  }`}
                >
                  <span className={styles.badgeIcon}>{stats.redFlags > 0 ? '⚠️' : '✓'}</span>
                  <span className={styles.badgeText}>
                    <strong>{stats.redFlags}</strong>{' '}
                    {stats.redFlags === 1 ? 'red flag' : 'red flags'}
                  </span>
                </div>

                <div
                  className={`${styles.summaryBadge} ${
                    stats.pendingVaccines > 0 ? styles.pendingVaxBadge : styles.neutralBadge
                  }`}
                >
                  <span className={styles.badgeIcon}>{stats.pendingVaccines > 0 ? '💉' : '✓'}</span>
                  <span className={styles.badgeText}>
                    {stats.pendingVaccines > 0
                      ? `${stats.pendingVaccines} ${
                          stats.pendingVaccines === 1 ? 'vaccine' : 'vaccines'
                        } pending...`
                      : 'Vaccines up to date'}
                  </span>
                </div>
              </div>

              {/* Expandable details: weight, height, last entry, latest achieved & next target */}
              {isExpanded && (
                <div className={styles.expandedDetails}>
                  <div className={styles.expandDetailGrid}>
                    <div className={styles.expandDetailItem}>
                      <span className={styles.detailItemLabel}>Weight</span>
                      <span className={styles.detailItemVal}>
                        {stats.weight ? `${stats.weight} kg` : '--'}
                      </span>
                    </div>
                    <div className={styles.expandDetailItem}>
                      <span className={styles.detailItemLabel}>Height / Length</span>
                      <span className={styles.detailItemVal}>
                        {stats.height ? `${stats.height} cm` : '--'}
                      </span>
                    </div>
                    <div className={styles.expandDetailItem}>
                      <span className={styles.detailItemLabel}>Last Entry</span>
                      <span className={styles.detailItemVal}>{stats.lastEntry}</span>
                    </div>
                    <div className={styles.expandDetailItem} style={{ gridColumn: 'span 3' }}>
                      <span className={styles.detailItemLabel}>Latest Achieved Milestone</span>
                      <span className={styles.detailItemVal} style={{ fontSize: '12px' }}>
                        {stats.latestAchievedTitle
                          ? `✓ ${stats.latestAchievedTitle}`
                          : 'None logged yet'}
                      </span>
                    </div>
                    <div className={styles.expandDetailItem} style={{ gridColumn: 'span 3' }}>
                      <span className={styles.detailItemLabel}>Next Target Milestone</span>
                      <span className={styles.detailItemVal} style={{ fontSize: '12px' }}>
                        {stats.nextUpcomingTitle
                          ? `🎯 ${stats.nextUpcomingTitle}`
                          : 'All age targets met!'}
                      </span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
};
