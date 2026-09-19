import React from 'react';
import type { VaccineMaster, VaccineLog } from '../../types';
import { isBirthDose } from '../../services/vaccineService';
import styles from './Vaccination.module.css';
import { format, isBefore, startOfDay } from 'date-fns';
import { useTranslation } from 'react-i18next';

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
  const { t } = useTranslation();
  
  const isBirth = isBirthDose(vaccine);
  const isCompleted = log?.status === 'completed';
  const today = startOfDay(new Date());
  const isMissed = !isCompleted && !isFuture && !isBirth && isBefore(dueDate, today);
  const isPendingBirth = !isCompleted && isBirth;
  
  const displayDate = isCompleted && log?.administeredDate 
    ? new Date(log.administeredDate) 
    : (log?.dueDate ? new Date(log.dueDate) : dueDate);

  const canLog = true;
  
  const translatedName = t(`vaccines_data.${vaccine.id}.name`, { defaultValue: vaccine.name });
  const translatedDesc = t(`vaccines_data.${vaccine.id}.description`, { defaultValue: vaccine.description });

  return (
    <div className={`${styles.vaccineCard} ${isCompleted ? styles.vaccineCardCompleted : ''} ${isMissed ? styles.vaccineCardMissed : ''} ${isPendingBirth ? styles.vaccineCardPendingBirth : ''} ${vaccine.isOptional ? styles.vaccineCardOptional : ''}`}>
      {vaccine.isOptional && <span className={styles.optionalBadge}>{t('vaccine_node.optional', 'Optional')}</span>}
      
      <div className={styles.cardHeader}>
        <h3 className={styles.vaccineName}>{translatedName}</h3>
        <span className={styles.dueDate}>
          {isCompleted ? t('vaccine_node.administered', 'Administered') : t('vaccine_node.due', 'Due')}: {format(displayDate, 'dd MMM yyyy')}
        </span>
      </div>

      <p className={styles.description}>{translatedDesc}</p>

      <div className={styles.metaGrid}>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{t('vaccine_node.dose', 'Dose')}</span>
          <span className={styles.metaValue}>{vaccine.dose}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{t('vaccine_node.route', 'Route')}</span>
          <span className={styles.metaValue}>{vaccine.route}</span>
        </div>
        <div className={styles.metaItem}>
          <span className={styles.metaLabel}>{t('vaccine_node.site', 'Site')}</span>
          <span className={styles.metaValue}>{vaccine.site}</span>
        </div>
      </div>

      <div className={styles.cardFooter}>
        <div className={`${styles.statusLabel} ${
          isCompleted 
            ? styles.statusCompleted 
            : isMissed 
            ? styles.statusMissed 
            : isPendingBirth
            ? styles.statusPendingBirth
            : styles.statusUpcoming
        }`}>
          {isCompleted ? (
            <><span>✓</span> {t('vaccine_node.completed', 'Completed')}</>
          ) : isMissed ? (
            <><span>⚠</span> {t('vaccine_node.missed', 'Missed')}</>
          ) : isPendingBirth ? (
            <><span>⏰</span> {t('vaccine_node.pending_birth', 'Due at Birth (Pending)')}</>
          ) : (
            <><span>○</span> {isFuture ? t('vaccine_node.upcoming', 'Upcoming') : t('vaccine_node.scheduled', 'Scheduled')}</>
          )}
        </div>
        <button 
          className={`${styles.logButton} ${isPendingBirth ? styles.birthLogButton : ''} ${isMissed ? styles.missedLogButton : ''}`} 
          onClick={onLog}
          disabled={!canLog}
        >
          {isCompleted 
            ? t('vaccine_node.edit_date', 'Edit Date') 
            : isMissed 
            ? t('vaccine_node.enter_date_given', 'Enter Date Given') 
            : isPendingBirth
            ? t('vaccine_node.log_birth_dose', 'Log Vaccine')
            : isFuture 
            ? t('vaccine_node.view_upcoming', 'Log / View') 
            : t('vaccine_node.log_vaccine', 'Log Vaccine')}
        </button>
      </div>
    </div>
  );
};
