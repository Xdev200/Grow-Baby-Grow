import React from 'react';
import type { VaccineMaster, VaccineLog } from '../../types';
import styles from './Vaccination.module.css';
import { format } from 'date-fns';

interface VaccineNodeProps {
  vaccine: VaccineMaster;
  log?: VaccineLog;
  dueDate: Date;
  onLog: () => void;
  isFuture: boolean;
}

export const VaccineNode: React.FC<VaccineNodeProps> = ({ 
  vaccine, 
  log, 
  dueDate,
  onLog,
  isFuture
}) => {
  const isCompleted = log?.status === 'completed';
  const isMissed = !isCompleted && !isFuture;
  const displayDate = isCompleted && log.administeredDate 
    ? new Date(log.administeredDate) 
    : (log?.dueDate ? new Date(log.dueDate) : dueDate);

  const canLog = !isFuture || isCompleted;

  return (
    <div className={`${styles.vaccineCard} ${isCompleted ? styles.vaccineCardCompleted : ''} ${isMissed ? styles.vaccineCardMissed : ''} ${vaccine.isOptional ? styles.vaccineCardOptional : ''}`}>
      {vaccine.isOptional && <span className={styles.optionalBadge}>Optional</span>}
      
      <div className={styles.cardHeader}>
        <h3 className={styles.vaccineName}>{vaccine.name}</h3>
        <span className={styles.dueDate}>
          {isCompleted ? 'Administered' : 'Due'}: {format(displayDate, 'dd MMM yyyy')}
        </span>
      </div>

      <p className={styles.description}>{vaccine.description}</p>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Dose</span>
          <span className={styles.metaValue}>{vaccine.dose}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Route</span>
          <span className={styles.metaValue}>{vaccine.route}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>Site</span>
          <span className={styles.metaValue}>{vaccine.site}</span>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div className={`${styles.statusLabel} ${isCompleted ? styles.statusCompleted : isMissed ? styles.statusMissed : styles.statusUpcoming}`}>
          {isCompleted ? (
            <><span>✓</span> Completed</>
          ) : isMissed ? (
            <><span>⚠</span> Missed</>
          ) : (
            <><span>○</span> {isFuture ? 'Upcoming' : 'Scheduled'}</>
          )}
        </div>
        <button 
          className={`${styles.logButton} ${!canLog ? styles.disabledButton : ''} ${isMissed ? styles.missedLogButton : ''}`} 
          onClick={onLog}
          disabled={!canLog}
        >
          {isCompleted ? 'Edit' : isMissed ? 'Log Missed' : isFuture ? 'Upcoming' : 'Log Vaccine'}
        </button>
      </div>
    </div>
  );
};
