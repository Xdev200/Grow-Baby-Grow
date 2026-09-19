import { useTranslation } from 'react-i18next';
import { StatCard } from '../molecules/StatCard/StatCard';
import styles from './Dashboard.module.css';

export interface DashboardStatsProps {
  totalAchieved: number;
  redFlagsCount: number;
}

export const DashboardStats = ({ totalAchieved, redFlagsCount }: DashboardStatsProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.statsRow}>
      <StatCard
        label={t('dashboard.milestones_achieved', 'Milestones Achieved')}
        value={totalAchieved}
        icon="🎯"
        variant="primary"
      />
      <StatCard
        label={t('dashboard.red_flags', 'Red Flags')}
        value={redFlagsCount}
        icon={redFlagsCount > 0 ? '⚠️' : '✓'}
        variant={redFlagsCount > 0 ? 'danger' : 'default'}
      />
    </div>
  );
};
