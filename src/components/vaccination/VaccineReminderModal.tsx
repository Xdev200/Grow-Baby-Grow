import React, { useState } from 'react';
import type { VaccineMaster } from '../../types';
import styles from './Vaccination.module.css';
import { format } from 'date-fns';

interface VaccineReminderModalProps {
  vaccine: VaccineMaster;
  initialDueDate: Date;
  onClose: () => void;
  onSave: (scheduledDate: Date, offsetDays: number, reminderTime: string) => void;
}

export const VaccineReminderModal: React.FC<VaccineReminderModalProps> = ({
  vaccine,
  initialDueDate,
  onClose,
  onSave
}) => {
  const [scheduledDate, setScheduledDate] = useState(format(initialDueDate, 'yyyy-MM-dd'));
  const [offsetDays, setOffsetDays] = useState(1); // Default 1 day before
  const [reminderTime, setReminderTime] = useState('09:00');

  const handleSave = () => {
    onSave(new Date(scheduledDate), offsetDays, reminderTime);
  };

  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Set Vaccine Reminder</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer' }}>✕</button>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Next Vaccine</label>
          <p style={{ margin: 0, fontWeight: 700, fontSize: '1.1rem', color: 'var(--primary-dark)' }}>{vaccine.name}</p>
          <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--slate-500)' }}>{vaccine.description}</p>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Scheduled Date</label>
          <input 
            type="date" 
            className={styles.input}
            value={scheduledDate}
            onChange={e => setScheduledDate(e.target.value)}
          />
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Remind Me</label>
          <div className={styles.segmentedControl}>
            {[
              { label: 'On day', value: 0 },
              { label: '1 day before', value: 1 },
              { label: '2 days before', value: 2 },
              { label: '1 week before', value: 7 }
            ].map(option => (
              <button
                key={option.value}
                type="button"
                className={`${styles.segmentButton} ${offsetDays === option.value ? styles.segmentButtonActive : ''}`}
                onClick={() => setOffsetDays(option.value)}
              >
                {option.label}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Reminder Time</label>
          <input 
            type="time" 
            className={styles.input}
            value={reminderTime}
            onChange={e => setReminderTime(e.target.value)}
          />
        </div>

        <div className={styles.buttonGroup}>
          <button className={styles.saveButton} onClick={handleSave}>
            Confirm & Set Reminder
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Maybe Later
          </button>
        </div>
      </div>
    </div>
  );
};
