import React, { useEffect, useState, useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useChild } from '../context/ChildContext';
import { useToast } from '../context/ToastContext';
import { vaccineService, isBirthDose } from '../services/vaccineService';
import type { VaccineMaster, VaccineLog } from '../types';
import { VaccineNode } from '../components/vaccination/VaccineNode';
import { VaccineLogModal } from '../components/vaccination/VaccineLogModal';
import { VaccineReminderModal } from '../components/vaccination/VaccineReminderModal';
import { VaccineCatchupModal } from '../components/vaccination/CatchupModal';
import { notificationService, generateNotificationId } from '../services/notificationService';
import { storageService } from '../services/storage';
import { preferencesService } from '../services/preferencesService';
import styles from '../components/vaccination/Vaccination.module.css';
import { isBefore, isAfter, startOfDay } from 'date-fns';

type ScheduleItem = VaccineMaster & { log?: VaccineLog; dueDate: Date };

export const VaccinationScreen: React.FC = () => {
  const { activeChild } = useChild();
  const { showToast } = useToast();
  const { t } = useTranslation();
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedVaccine, setSelectedVaccine] = useState<ScheduleItem | null>(null);
  const [showCatchup, setShowCatchup] = useState(false);
  
  const [remindersEnabled, setRemindersEnabled] = useState(
    activeChild ? preferencesService.getVaccineReminders(activeChild.id) : false
  );
  const [showReminderModal, setShowReminderModal] = useState(false);

  const fetchSchedule = async () => {
    if (!activeChild) return;
    setLoading(true);
    const data = await vaccineService.getVaccineSchedule(activeChild);
    setSchedule(data);
    setLoading(false);

    // Auto-trigger catch-up drawer if unlogged due vaccines exist for child's age
    const today = startOfDay(new Date());
    const hasVisited = preferencesService.getVaccineVisited(activeChild.id);
    const unloggedDue = data.filter(s => {
      const isCompleted = s.log?.status === 'completed';
      if (isCompleted) return false;
      return isBirthDose(s) || !isAfter(s.dueDate, today);
    });

    if (unloggedDue.length > 0 && !hasVisited) {
      setShowCatchup(true);
    }
  };

  useEffect(() => {
    fetchSchedule();
  }, [activeChild]);

  const handleCatchupConfirm = async (logs: VaccineLog[]) => {
    for (const log of logs) {
      await storageService.saveVaccineLog(log);
    }
    if (activeChild) preferencesService.setVaccineVisited(activeChild.id);
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
        showToast({ status: 'warning', title: 'Permission Required', message: t('vaccines.permission_required') });
        return;
      }
      if (nextVaccine) {
        setShowReminderModal(true);
      } else if (activeChild) {
        setRemindersEnabled(true);
        preferencesService.setVaccineReminders(activeChild.id, true);
      }
    } else if (activeChild) {
      setRemindersEnabled(false);
      preferencesService.setVaccineReminders(activeChild.id, false);
      await notificationService.cancelAll();
    }
  };

  const handleSaveReminder = async (scheduledDate: Date, offsetDays: number, reminderTime: string) => {
    if (!activeChild || !nextVaccine) return;

    const log: VaccineLog = {
      id: nextVaccine.log?.id || crypto.randomUUID(),
      childId: activeChild.id,
      vaccineId: nextVaccine.id,
      status: 'upcoming',
      dueDate: scheduledDate.toISOString(),
      loggedAt: new Date().toISOString()
    };

    await storageService.saveVaccineLog(log);
    const notificationId = generateNotificationId(nextVaccine.id);
    
    await notificationService.scheduleVaccineReminder(
      notificationId,
      nextVaccine.name,
      scheduledDate,
      offsetDays,
      reminderTime
    );

    setRemindersEnabled(true);
    preferencesService.setVaccineReminders(activeChild.id, true);
    setShowReminderModal(false);
    fetchSchedule();
    
    showToast({ status: 'success', title: 'Reminder Set', message: t('vaccines.reminder_set', { name: nextVaccine.name }) });
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
      const notificationId = generateNotificationId(selectedVaccine.id);
      await notificationService.cancelNotification(notificationId);
    }

    setSelectedVaccine(null);
    fetchSchedule();
  };

  const handleMarkNotGiven = async () => {
    if (!activeChild || !selectedVaccine?.log) return;
    await storageService.deleteVaccineLog(selectedVaccine.log.id);
    setSelectedVaccine(null);
    fetchSchedule();
  };

  if (loading) {
    return <div className={styles.timelineContainer}>{t('vaccines.loading_schedule')}</div>;
  }

  const today = startOfDay(new Date());

  return (
    <div className={styles.timelineContainer}>
      <header className={styles.timelineHeader}>
        <div className={styles.titleRow}>
          <h1 className={styles.timelineTitle}>{t('vaccines.title')}</h1>
        </div>
        <p className={styles.timelineSubtitle}>
          {t('vaccines.subtitle', { name: activeChild?.name })}
        </p>
      </header>

      <div className={styles.scrollArea}>
        <div className={styles.reminderToggleArea}>
          <div className={styles.reminderInfo}>
            <span className={styles.reminderIcon}>🔔</span>
            <span className={styles.reminderLabel}>{t('vaccines.reminders_label')}</span>
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
              const isBirth = isBirthDose(vaccine);
              const isFuture = !isBirth && isAfter(vaccine.dueDate, today);
              return (
                <VaccineNode 
                  key={vaccine.id}
                  vaccine={vaccine}
                  log={vaccine.log}
                  dueDate={vaccine.dueDate}
                  onLog={() => {
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
          onMarkNotGiven={handleMarkNotGiven}
        />
      )}

      {showCatchup && activeChild && (
        <VaccineCatchupModal 
          childId={activeChild.id}
          pastVaccines={schedule
            .filter(s => s.log?.status !== 'completed' && (isBirthDose(s) || !isAfter(s.dueDate, today)))
            .map(s => ({ vaccine: s, dueDate: s.dueDate }))}
          onConfirm={handleCatchupConfirm}
          onClose={() => {
            if (activeChild) preferencesService.setVaccineVisited(activeChild.id);
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
