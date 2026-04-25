import React, { useState } from 'react';
import type { VaccineMaster, VaccineLog } from '../../types';
import styles from './Vaccination.module.css';
import { format } from 'date-fns';

interface CatchupItem {
  vaccine: VaccineMaster;
  dueDate: Date;
  status: 'completed' | 'skipped';
  administeredDate: string;
}

interface VaccineCatchupModalProps {
  pastVaccines: { vaccine: VaccineMaster; dueDate: Date }[];
  onConfirm: (logs: VaccineLog[]) => void;
  onClose: () => void;
  childId: string;
}

export const VaccineCatchupModal: React.FC<VaccineCatchupModalProps> = ({ 
  pastVaccines, 
  onConfirm, 
  onClose,
  childId
}) => {
  const [items, setItems] = useState<CatchupItem[]>(
    pastVaccines.map(pv => ({
      vaccine: pv.vaccine,
      dueDate: pv.dueDate,
      status: 'completed',
      administeredDate: format(pv.dueDate, 'yyyy-MM-dd')
    }))
  );

  const handleStatusToggle = (index: number) => {
    const newItems = [...items];
    newItems[index].status = newItems[index].status === 'completed' ? 'skipped' : 'completed';
    setItems(newItems);
  };

  const handleDateChange = (index: number, date: string) => {
    const newItems = [...items];
    newItems[index].administeredDate = date;
    setItems(newItems);
  };

  const handleSubmit = () => {
    const logs: VaccineLog[] = items
      .filter(item => item.status === 'completed')
      .map(item => ({
        id: crypto.randomUUID(),
        childId,
        vaccineId: item.vaccine.id,
        status: 'completed',
        dueDate: item.dueDate.toISOString(),
        administeredDate: new Date(item.administeredDate).toISOString(),
        notes: 'Confirmed during catch-up',
        loggedAt: new Date().toISOString()
      }));
    
    // Also save "skipped" logs if we want to track intent
    const skippedLogs: VaccineLog[] = items
      .filter(item => item.status === 'skipped')
      .map(item => ({
        id: crypto.randomUUID(),
        childId,
        vaccineId: item.vaccine.id,
        status: 'upcoming', // Keep it upcoming but maybe mark as skipped in notes
        dueDate: item.dueDate.toISOString(),
        notes: 'Marked as not given during catch-up',
        loggedAt: new Date().toISOString()
      }));

    onConfirm([...logs, ...skippedLogs]);
  };

  return (
    <div className={styles.modalOverlay}>
      <div className={`${styles.modalContent} ${styles.catchupModal}`}>
        <div className={styles.modalHeader}>
          <h2 className={styles.modalTitle}>Welcome to Vaccine Tracker</h2>
          <p className={styles.modalSubtitle}>Let's catch up on vaccines due till today</p>
        </div>

        <div className={styles.catchupList}>
          {items.map((item, index) => (
            <div key={item.vaccine.id} className={styles.catchupItem}>
              <div className={styles.catchupInfo}>
                <span className={styles.catchupName}>{item.vaccine.name}</span>
                <span className={styles.catchupAge}>{item.vaccine.ageLabel}</span>
              </div>
              
              <div className={styles.catchupControls}>
                <input 
                  type="date" 
                  className={styles.catchupDateInput}
                  value={item.administeredDate}
                  onChange={(e) => handleDateChange(index, e.target.value)}
                  disabled={item.status === 'skipped'}
                />
                <button 
                  className={`${styles.statusToggle} ${item.status === 'completed' ? styles.statusGiven : styles.statusNotGiven}`}
                  onClick={() => handleStatusToggle(index)}
                >
                  {item.status === 'completed' ? 'Given' : 'Not Given'}
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className={styles.modalFooter}>
          <button className={styles.saveButton} onClick={handleSubmit}>
            Confirm & Continue
          </button>
          <button className={styles.cancelButton} onClick={onClose}>
            Skip for now
          </button>
        </div>
      </div>
    </div>
  );
};
