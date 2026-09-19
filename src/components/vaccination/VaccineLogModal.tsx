import React, { useState } from 'react';
import type { VaccineMaster, VaccineLog } from '../../types';
import styles from './Vaccination.module.css';
import { format, isAfter, isBefore, startOfDay } from 'date-fns';

interface VaccineLogModalProps {
  vaccine: VaccineMaster;
  log?: VaccineLog;
  initialDueDate: Date;
  onClose: () => void;
  onSave: (date: Date, notes: string, status: 'completed' | 'upcoming') => void;
  onMarkNotGiven?: () => void;
}

export const VaccineLogModal: React.FC<VaccineLogModalProps> = ({ 
  vaccine, 
  log, 
  initialDueDate,
  onClose, 
  onSave,
  onMarkNotGiven
}) => {
  const [today] = useState(startOfDay(new Date()));
  const isCompleted = log?.status === 'completed';
  const isMissed = !isCompleted && isBefore(log?.dueDate ? new Date(log.dueDate) : initialDueDate, today);

  const [date, setDate] = useState(
    log?.administeredDate 
      ? format(new Date(log.administeredDate), 'yyyy-MM-dd') 
      : isMissed 
        ? format(today, 'yyyy-MM-dd') 
        : (log?.dueDate ? format(new Date(log.dueDate), 'yyyy-MM-dd') : format(initialDueDate, 'yyyy-MM-dd'))
  );
  const [notes, setNotes] = useState(log?.notes || '');
  const [selectedStatus, setSelectedStatus] = useState<'completed' | 'upcoming'>(
    isCompleted || isMissed ? 'completed' : 'upcoming'
  );

  const maxDateStr = format(today, 'yyyy-MM-dd');

  const handleSave = () => {
    if (isCompleted) {
      onSave(new Date(date), log?.notes || '', 'completed');
    } else if (isMissed) {
      onSave(new Date(date), notes, 'completed');
    } else {
      onSave(new Date(date), notes, selectedStatus);
    }
  };

  // Case 1: Completed vaccine editing
  // QA Rule: Edit should only allow changing the date given or marking it "Not Given" - no other fields editable.
  if (isCompleted) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Edit Administered Vaccine</h2>
            <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer' }}>✕</button>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Vaccine</label>
            <div className={styles.readonlyField}>{vaccine.name}</div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Date Given</label>
            <input 
              type="date" 
              className={styles.input}
              value={date}
              max={maxDateStr}
              onChange={e => setDate(e.target.value)}
            />
            <p className={styles.helperNote}>Only the administered date can be adjusted for a completed dose.</p>
          </div>

          <div className={styles.buttonGroup}>
            <button className={styles.saveButton} onClick={handleSave}>
              Save New Date
            </button>
            {onMarkNotGiven && (
              <button 
                type="button" 
                className={styles.notGivenButton} 
                onClick={onMarkNotGiven}
              >
                Mark as Not Given
              </button>
            )}
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 2: Missed vaccine
  // QA Rule: Add an option to enter the date it was actually given, converting it to completed.
  if (isMissed) {
    return (
      <div className={styles.modalOverlay} onClick={onClose}>
        <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
          <div className={styles.modalHeader}>
            <h2 className={styles.modalTitle}>Record Missed Vaccine</h2>
            <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer' }}>✕</button>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Vaccine</label>
            <div className={styles.readonlyField}>{vaccine.name}</div>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Date Actually Given</label>
            <input 
              type="date" 
              className={styles.input}
              value={date}
              max={maxDateStr}
              onChange={e => setDate(e.target.value)}
            />
            <p className={styles.helperNote}>Entering the administration date will convert this missed vaccine to completed.</p>
          </div>

          <div className={styles.formGroup}>
            <label className={styles.label}>Notes (Optional)</label>
            <textarea 
              className={styles.input}
              style={{ height: 70, resize: 'none' }}
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="E.g., Given at clinic, brand, batch..."
            />
          </div>

          <div className={styles.buttonGroup}>
            <button className={styles.saveButton} onClick={handleSave}>
              ✓ Record as Completed
            </button>
            <button className={styles.cancelButton} onClick={onClose}>
              Cancel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // Case 3: Scheduled / Upcoming vaccine logging
  return (
    <div className={styles.modalOverlay} onClick={onClose}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Log Vaccination</h2>
          <button onClick={onClose} style={{ border: 'none', background: 'none', fontSize: 24, cursor: 'pointer' }}>✕</button>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Vaccine</label>
          <div className={styles.readonlyField}>{vaccine.name}</div>
        </div>

        <div className={styles.formGroup}>
          <label className={styles.label}>Scheduled / Administered Date</label>
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
              type="button"
              className={`${styles.logButton} ${isAfter(new Date(date), today) ? styles.disabledButton : ''}`} 
              style={{ flex: 1, backgroundColor: selectedStatus === 'completed' ? 'var(--slate-900)' : 'var(--slate-200)', color: selectedStatus === 'completed' ? 'white' : 'var(--slate-700)' }}
              onClick={() => !isAfter(new Date(date), today) && setSelectedStatus('completed')}
              disabled={isAfter(new Date(date), today)}
            >
              Completed
            </button>
            <button 
              type="button"
              className={styles.logButton} 
              style={{ flex: 1, backgroundColor: selectedStatus === 'upcoming' ? 'var(--slate-900)' : 'var(--slate-200)', color: selectedStatus === 'upcoming' ? 'white' : 'var(--slate-700)' }}
              onClick={() => setSelectedStatus('upcoming')}
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
            style={{ height: 70, resize: 'none' }}
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
