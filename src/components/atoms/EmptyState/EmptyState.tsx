import type { ReactNode } from 'react';
import styles from './EmptyState.module.css';

export interface EmptyStateProps {
  icon?: ReactNode;
  title?: string;
  message: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export const EmptyState = ({
  icon = '📋',
  title,
  message,
  actionLabel,
  onAction,
  className = '',
}: EmptyStateProps) => {
  return (
    <div className={`${styles.container} ${className}`}>
      {icon && <div className={styles.icon}>{icon}</div>}
      {title && <h3 className={styles.title}>{title}</h3>}
      <p className={styles.message}>{message}</p>
      {actionLabel && onAction && (
        <button type="button" className={styles.actionBtn} onClick={onAction}>
          {actionLabel}
        </button>
      )}
    </div>
  );
};
