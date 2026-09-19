import type { ReactNode } from 'react';
import styles from './FAB.module.css';

export interface FABProps {
  onClick: () => void;
  icon?: ReactNode;
  label?: string;
  ariaLabel: string;
  variant?: 'primary' | 'secondary';
  className?: string;
}

export const FAB = ({
  onClick,
  icon = '+',
  label,
  ariaLabel,
  variant = 'primary',
  className = '',
}: FABProps) => {
  return (
    <button
      type="button"
      className={`${styles.fab} ${styles[variant]} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
    >
      {icon && <span className={styles.icon}>{icon}</span>}
      {label && <span>{label}</span>}
    </button>
  );
};
