import type { Child, MilestoneMaster } from '../../types';
import styles from './Dashboard.module.css';

export interface RecentAssessment {
  status: 'on_track' | 'watch' | 'lagging';
  redFlags: MilestoneMaster[];
  watchItems: MilestoneMaster[];
  date: string;
}

export interface AssessmentSummaryProps {
  recentAssessment: RecentAssessment;
  activeChild: Child;
}

export const AssessmentSummary = ({ recentAssessment, activeChild }: AssessmentSummaryProps) => {
  return (
    <section className={styles.assessmentSection}>
      <div className={styles.assessmentHeader}>
        <h3 className={styles.assessmentTitle}>Recent Assessment Status</h3>
        <span
          className={`${styles.assessmentStatusBadge} ${
            styles[`status_${recentAssessment.status}`]
          }`}
        >
          {recentAssessment.status === 'on_track'
            ? 'On Track'
            : recentAssessment.status === 'watch'
            ? 'Watch & Stimulate'
            : 'Review Advised'}
        </span>
      </div>
      <p className={styles.assessmentMessage}>
        {recentAssessment.status === 'on_track'
          ? `${activeChild.name} is progressing smoothly according to clinical milestones.`
          : 'Review stimulation recommendations below and practice with your child.'}
      </p>

      {(recentAssessment.redFlags.length > 0 || recentAssessment.watchItems.length > 0) && (
        <div className={styles.recommendationsList}>
          {[...recentAssessment.redFlags, ...recentAssessment.watchItems].slice(0, 3).map((item, idx) => (
            <div key={idx} className={styles.recommendationCard}>
              <p className={styles.recMilestone}>{item.milestone}</p>
              <p className={styles.recSuggestion}>
                {item.suggestion ||
                  item.laymanDescription ||
                  'Encourage playtime and activities to support this milestone.'}
              </p>
            </div>
          ))}
        </div>
      )}
    </section>
  );
};
