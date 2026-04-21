import React from 'react';
import type { Domain, MilestoneMaster, MilestoneLog } from '../../types';
import styles from './Dashboard.module.css';

interface DomainDetailModalProps {
  domain: Domain;
  milestones: MilestoneMaster[];
  logs: MilestoneLog[];
  onClose: () => void;
}

export const DomainDetailModal: React.FC<DomainDetailModalProps> = ({ 
  domain, 
  milestones, 
  logs, 
  onClose 
}) => {
  const domainTitle = domain.replace('_', ' ').toUpperCase();
  
  const getStatus = (milestoneId: string) => {
    const log = logs.find(l => l.milestoneId === milestoneId);
    return log?.status || 'not_assessed';
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <header className={styles.modalHeader}>
          <h2>{domainTitle} Details</h2>
          <button className={styles.closeButton} onClick={onClose}>&times;</button>
        </header>

        <div className={styles.milestoneList}>
          {milestones.length === 0 && <p className={styles.emptyText}>No milestones logged for this domain.</p>}
          
          {milestones.map(m => {
            const status = getStatus(m.id);
            return (
              <div key={m.id} className={`${styles.detailCard} ${styles[`status_${status}`]}`}>
                <div className={styles.detailHeader}>
                  <span className={styles.achievedBadge}>
                    {status === 'achieved' && '✅'}
                    {status === 'partial' && '🟡'}
                    {status === 'not_yet' && '❌'}
                    {status === 'not_assessed' && '⚪'}
                  </span>
                  <span className={styles.ageBadge}>{m.ageMonths}m</span>
                </div>
                <p className={styles.milestoneText}>{m.laymanDescription || m.milestone}</p>
                {m.isRedFlag && <span className={styles.redFlagMini}>🚩 Clinical Red Flag</span>}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};
