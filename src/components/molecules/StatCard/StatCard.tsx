import type { ReactNode } from 'react';
import styles from './StatCard.module.css';

export interface StatCardProps {
  icon?: ReactNode;
  value: string | number;
  label: string;
  subtext?: string;
  variant?: 'default' | 'primary' | 'warning' | 'danger';
  onClick?: () => void;
  className?: string;
}

export const StatCard = ({
  icon,
  value,
  label,
  subtext,
  variant = 'default',
  onClick,
  className = '',
}: StatCardProps) => {
  return (
    <div
      className={`${styles.card} ${styles[variant]} ${onClick ? styles.clickable : ''} ${className}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick();
              }
            }
          : undefined
      }
    >
      <div className={styles.header}>
        <span className={styles.label}>{label}</span>
        {icon && <span className={styles.icon}>{icon}</span>}
      </div>
      <div className={styles.value}>{value}</div>
      {subtext && <span className={styles.subtext}>{subtext}</span>}
    </div>
  );
};
