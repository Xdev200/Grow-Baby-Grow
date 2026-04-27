import React from 'react';
import { useTranslation } from 'react-i18next';
import { ProgressRing } from './ProgressRing';
import styles from './Dashboard.module.css';

interface DomainCardProps {
  name: string;
  total: number;
  achieved: number;
  color: string;
  onClick?: () => void;
}

export const DomainCard: React.FC<DomainCardProps> = ({ name, total, achieved, color, onClick }) => {
  const { t } = useTranslation();
  const progress = total > 0 ? (achieved / total) * 100 : 0;

  return (
    <div className={styles.card} onClick={onClick}>
      <ProgressRing radius={40} stroke={6} progress={progress} color={color} />
      <span className={styles.domainName}>{name}</span>
      <span className={styles.statusText}>{achieved} / {total} {t('common.done')}</span>
    </div>
  );
};
