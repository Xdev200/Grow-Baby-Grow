import React, { useState } from 'react';
import type { VaccineMaster, VaccineLog } from '../../types';
import styles from './Vaccination.module.css';
import { format, isAfter, startOfDay } from 'date-fns';

interface VaccineLogModalProps {
  vaccine: VaccineMaster;
  log?: VaccineLog;
  initialDueDate: Date;
  onClose: () => void;
  onSave: (date: Date, notes: string, status: 'completed' | 'upcoming') => void;
}

export const VaccineLogModal: React.FC<VaccineLogModalProps> = ({ 
  vaccine, 
  log, 
  initialDueDate,
  onClose, 
  onSave 
}) => {
  const [today] = useState(startOfDay(new Date()));
  const [date, setDate] = useState(
    log?.administeredDate 
      ? format(new Date(log.administeredDate), 'yyyy-MM-dd') 
      : (log?.dueDate ? format(new Date(log.dueDate), 'yyyy-MM-dd') : format(initialDueDate, 'yyyy-MM-dd'))
  );
  const [notes, setNotes] = useState(log?.notes || '');
  const [isCompleted, setIsCompleted] = useState(log?.status === 'completed');

  const handleSave = () => {
    onSave(new Date(date), notes, isCompleted ? 'completed' : 'upcoming');
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>{isCompleted ? 'Edit Logistics' : 'Log Vaccination'}</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 24 }}>✕</button>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Vaccine</label>
          <p style={{ margin: 0, fontWeight: 600 }}>{vaccine.name}</p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>
            {isCompleted ? 'Date Administered' : 'Scheduled Date'}
          </label>
          <input 
            type="date" 
            className={styles.input}
            value={date}
            onChange={e => setDate(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Status</label>
          <div style={{ display: 'flex', gap: 12 }}>
            <button 
              className={`${styles.logButton} ${isAfter(new Date(date), today) ? styles.disabledButton : ''}`} 
              style={{ flex: 1, backgroundColor: isCompleted ? 'var(--slate-900)' : 'var(--slate-200)', color: isCompleted ? 'white' : 'var(--slate-700)' }}
              onClick={() => !isAfter(new Date(date), today) && setIsCompleted(true)}
              disabled={isAfter(new Date(date), today)}
            >
              Completed
            </button>
            <button 
              className={styles.logButton} 
              style={{ flex: 1, backgroundColor: !isCompleted ? 'var(--slate-900)' : 'var(--slate-200)', color: !isCompleted ? 'white' : 'var(--slate-700)' }}
              onClick={() => setIsCompleted(false)}
            >
              Upcoming
            </button>
          </div>
          {isAfter(new Date(date), today) && (
            <p style={{ fontSize: 11, color: 'var(--amber)', marginTop: 4, fontWeight: 600 }}>
              Future vaccines cannot be marked as completed yet.
            </p>
          )}
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Notes (Optional)</label>
          <textarea 
            className={styles.input}
            style={{ height: 80, resize: 'none' }}
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="E.g. Fever after dose, hospital name..."
          />
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.saveButton} onClick={handleSave}>
            Save Vaccination Info
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
};
