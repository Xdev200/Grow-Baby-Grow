import React from 'react';
import type { MilestoneMaster } from '../../types';
import styles from './RedFlagBanner.module.css';

interface RedFlagBannerProps {
  flags: MilestoneMaster[];
  onDownload?: () => void;
}

export const RedFlagBanner: React.FC<RedFlagBannerProps> = ({ flags, onDownload }) => {
  if (flags.length === 0) return null;

  return (
    <div className={styles.bannerContainer}>
      <span className={styles.icon}>⚠️</span>
      <div className={styles.content}>
        <h3 className={styles.title}>Clinical Attention Required</h3>
        <p className={styles.message}>
          Your baby has missed {flags.length} critical growth marker(s). 
          AIIMS Delhi & IAP recommend consulting your pediatrician for a developmental screening.
        </p>
        <button onClick={onDownload} className={styles.actionButton}>
          View Report for Doctor
        </button>
      </div>
    </div>
  );
};
