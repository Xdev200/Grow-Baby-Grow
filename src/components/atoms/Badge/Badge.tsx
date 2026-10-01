import type { ReactNode } from 'react';
import styles from './Badge.module.css';

export interface BadgeProps {
  variant?: 'active' | 'success' | 'warning' | 'info' | 'danger' | 'neutral';
  size?: 'sm' | 'md' | 'lg';
  showDot?: boolean;
  children: ReactNode;
  className?: string;
}

export const Badge = ({
  variant = 'neutral',
  size = 'md',
  showDot = false,
  children,
  className = '',
}: BadgeProps) => {
  return (
    <span className={`${styles.badge} ${styles[variant]} ${styles[size]} ${className}`}>
      {showDot && <span className={styles.dot} aria-hidden="true" />}
      {children}
    </span>
  );
};
