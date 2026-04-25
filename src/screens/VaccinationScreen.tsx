import React, { useEffect, useState, useMemo } from 'react';
import { useChild } from '../context/ChildContext';
import { vaccineService } from '../services/vaccineService';
import type { VaccineMaster, VaccineLog } from '../types';
import { VaccineNode } from '../components/vaccination/VaccineNode';
import { VaccineLogModal } from '../components/vaccination/VaccineLogModal';
import { VaccineReminderModal } from '../components/vaccination/VaccineReminderModal';
import { VaccineCatchupModal } from '../components/vaccination/CatchupModal';
import { notificationService } from '../services/notificationService';
import { storageService } from '../services/storage';
import styles from '../components/vaccination/Vaccination.module.css';
import { isBefore, startOfDay } from 'date-fns';

type ScheduleItem = VaccineMaster & { log?: VaccineLog; dueDate: Date };

export const VaccinationScreen: React.FC = () => {
  const { activeChild } = useChild();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVaccine, setSelectedVaccine] = useState<ScheduleItem | null>(null);
  const [showCatchup, setShowCatchup] = useState(false);
   const [remindersEnabled, setRemindersEnabled] = useState(
     localStorage.getItem(`vax_reminders_${activeChild?.id}`) === 'true'
   );
   const [showReminderModal, setShowReminderModal] = useState(false);

  const fetchSchedule = async () => {
    if (!activeChild) return;
    setLoading(true);
    const data = await vaccineService.getVaccineSchedule(activeChild);
    setSchedule(data);
    setLoading(false);

    // Check if we need to show catch-up modal
    const logs = await storageService.getVaccineLogs(activeChild.id);
    const hasVisited = localStorage.getItem(`vax_visited_${activeChild.id}`);
    
    if (logs.length === 0 && !hasVisited) {
      const today = startOfDay(new Date());
      const pastVaccines = data.filter(item => isBefore(item.dueDate, today));
      if (pastVaccines.length > 0) {
        setShowCatchup(true);
      }
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [activeChild]);

   const handleCatchupConfirm = async (logs: VaccineLog[]) => {
     for (const log of logs) {
       await storageService.saveVaccineLog(log);
     }
     localStorage.setItem(`vax_visited_${activeChild?.id}`, 'true');
     setShowCatchup(false);
     fetchSchedule();
   };
 
   const nextVaccine = useMemo(() => {
     const today = startOfDay(new Date());
     return schedule.find(item => !item.log && !isBefore(item.dueDate, today));
   }, [schedule]);
 
   const handleToggleReminders = async (enabled: boolean) => {
     if (enabled) {
       const hasPermission = await notificationService.requestPermissions();
       if (!hasPermission) {
         alert('Notification permissions are required for reminders.');
         return;
       }
       if (nextVaccine) {
         setShowReminderModal(true);
       } else {
         setRemindersEnabled(true);
         localStorage.setItem(`vax_reminders_${activeChild?.id}`, 'true');
       }
     } else {
       setRemindersEnabled(false);
       localStorage.setItem(`vax_reminders_${activeChild?.id}`, 'false');
       await notificationService.cancelAll();
     }
   };
 
   const handleSaveReminder = async (scheduledDate: Date, offsetDays: number, reminderTime: string) => {
     if (!activeChild || !nextVaccine) return;
 
     // Save to storage as an 'upcoming' log if it doesn't exist
     const log: VaccineLog = {
       id: nextVaccine.log?.id || crypto.randomUUID(),
       childId: activeChild.id,
       vaccineId: nextVaccine.id,
       status: 'upcoming',
       dueDate: scheduledDate.toISOString(),
       loggedAt: new Date().toISOString()
     };
 
     await storageService.saveVaccineLog(log);
     
     // Schedule notification
     // Generate a simple numeric ID from vaccine hash or index
     const notificationId = Math.abs(nextVaccine.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0));
     
     await notificationService.scheduleVaccineReminder(
       notificationId,
       nextVaccine.name,
       scheduledDate,
       offsetDays,
       reminderTime
     );
 
     setRemindersEnabled(true);
     localStorage.setItem(`vax_reminders_${activeChild.id}`, 'true');
     setShowReminderModal(false);
     fetchSchedule();
     
     alert(`Reminder set for ${nextVaccine.name}!`);
   };

  const groupedSchedule = useMemo(() => {
    const groups: Record<string, ScheduleItem[]> = {};
    schedule.forEach(item => {
      const label = item.ageLabel;
      if (!groups[label]) groups[label] = [];
      groups[label].push(item);
    });
    return groups;
  }, [schedule]);

  const handleSaveLog = async (date: Date, notes: string, status: 'completed' | 'upcoming') => {
    if (!activeChild || !selectedVaccine) return;

    const log: VaccineLog = {
      id: selectedVaccine.log?.id || crypto.randomUUID(),
      childId: activeChild.id,
      vaccineId: selectedVaccine.id,
      status: status,
      dueDate: status === 'upcoming' ? date.toISOString() : (selectedVaccine.log?.dueDate || selectedVaccine.dueDate.toISOString()),
      administeredDate: status === 'completed' ? date.toISOString() : undefined,
      notes: notes,
      loggedAt: new Date().toISOString()
    };

    await storageService.saveVaccineLog(log);

    if (status === 'completed') {
      // Cancel notification for this vaccine
      const notificationId = Math.abs(selectedVaccine.id.split('').reduce((a, b) => { a = ((a << 5) - a) + b.charCodeAt(0); return a & a; }, 0));
      await notificationService.cancelNotification(notificationId);
    }

    setSelectedVaccine(null);
    fetchSchedule();
  };

  if (loading) {
    return <div className={styles.timelineContainer}>Loading schedule...</div>;
  }

  const today = startOfDay(new Date());

  return (
    <div className={styles.timelineContainer}>
      <header className={styles.timelineHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.timelineTitle}>Vaccinations</h1>
        </div>
        <p className={styles.timelineSubtitle}>
          National Immunization Schedule for {activeChild?.name}
        </p>
      </header>

      <div className={styles.scrollArea}>
        <div className={styles.reminderToggleArea}>
          <div className={styles.reminderInfo}>
            <span className={styles.reminderIcon}>🔔</span>
            <span className={styles.reminderLabel}>Reminders for upcoming vaccines</span>
          </div>
          <label className={styles.toggleSwitch}>
            <input 
              type="checkbox" 
              checked={remindersEnabled} 
              onChange={(e) => handleToggleReminders(e.target.checked)}
            />
            <span className={styles.toggleSlider}></span>
          </label>
        </div>

        {Object.entries(groupedSchedule).map(([ageLabel, vaccines]) => (
          <div key={ageLabel} className={styles.ageGroup}>
            <span className={styles.ageGroupLabel}>{ageLabel}</span>
            {vaccines.map(vaccine => {
              const isFuture = !isBefore(vaccine.dueDate, today);
              return (
                <VaccineNode 
                  key={vaccine.id}
                  vaccine={vaccine}
                  log={vaccine.log}
                  dueDate={vaccine.dueDate}
                  onLog={() => {
                    if (isFuture && !vaccine.log) {
                      // Optionally show info or reminder settings for future vaccines
                      // But the requirement says "No future date vaccine should be enabled for logging"
                      return; 
                    }
                    setSelectedVaccine(vaccine);
                  }}
                  isFuture={isFuture}
                />
              );
            })}
          </div>
        ))}
      </div>

      {selectedVaccine && (
        <VaccineLogModal 
          vaccine={selectedVaccine}
          log={selectedVaccine.log}
          initialDueDate={selectedVaccine.dueDate}
          onClose={() => setSelectedVaccine(null)}
          onSave={handleSaveLog}
        />
      )}

       {showCatchup && activeChild && (
         <VaccineCatchupModal 
           childId={activeChild.id}
           pastVaccines={schedule
             .filter(s => isBefore(s.dueDate, today))
             .map(s => ({ vaccine: s, dueDate: s.dueDate }))}
           onConfirm={handleCatchupConfirm}
           onClose={() => {
             localStorage.setItem(`vax_visited_${activeChild.id}`, 'true');
             setShowCatchup(false);
           }}
         />
       )}
 
       {showReminderModal && nextVaccine && (
         <VaccineReminderModal
           vaccine={nextVaccine}
           initialDueDate={nextVaccine.dueDate}
           onClose={() => setShowReminderModal(false)}
           onSave={handleSaveReminder}
         />
       )}
     </div>
  );
};
