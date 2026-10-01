import type { ButtonHTMLAttributes } from 'react';
import styles from './CloseButton.module.css';

export interface CloseButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  size?: 'sm' | 'md' | 'lg';
  ariaLabel?: string;
}

export const CloseButton = ({
  size = 'md',
  ariaLabel = 'Close',
  className = '',
  onClick,
  ...props
}: CloseButtonProps) => {
  return (
    <button
      type="button"
      className={`${styles.closeBtn} ${styles[size]} ${className}`}
      onClick={onClick}
      aria-label={ariaLabel}
      {...props}
    >
      ✕
    </button>
  );
};
