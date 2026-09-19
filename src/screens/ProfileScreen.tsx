import React from 'react';
import { useTranslation } from 'react-i18next';
import { useChild } from '../context/ChildContext';
import { useToast } from '../context/ToastContext';
import { storageService } from '../services/storage';
import { generateClinicalReport } from '../services/report';
import { calculateAge } from '../utils/age';
import { getChildEmoji } from '../utils/childHelpers';
import type { Child } from '../types';
import styles from './Profile.module.css';

export const ProfileScreen: React.FC = () => {
  const { activeChild, children, selectChild, setChild } = useChild();
  const { showToast } = useToast();
  const { t } = useTranslation();

  const handleExportChildPdf = async (child: Child) => {
    try {
      const logs = await storageService.getMilestoneLogs(child.id);
      const age = calculateAge(new Date(child.dob), child.gestationalWeeks);
      generateClinicalReport(child, logs, age.displayAge, age.assessmentAgeMonths);
      showToast({ status: 'success', title: 'Export Successful', message: `Report generated for ${child.name}` });
    } catch (err) {
      console.error('Export PDF error:', err);
      showToast({ status: 'danger', title: 'Export Failed', message: 'Failed to export clinical report PDF' });
    }
  };

  const handleExportBackup = async () => {
    try {
      const allChildren = await storageService.getAllChildren();
      const milestoneLogs: any[] = [];
      const growthMeasurements: any[] = [];
      const quizSessions: any[] = [];
      const vaccineLogs: any[] = [];

      for (const child of allChildren) {
        const mLogs = await storageService.getMilestoneLogs(child.id);
        const gMeas = await storageService.getGrowthMeasurements(child.id);
        const qSess = await storageService.getQuizSessions(child.id);
        const vLogs = await storageService.getVaccineLogs(child.id);

        milestoneLogs.push(...mLogs);
        growthMeasurements.push(...gMeas);
        quizSessions.push(...qSess);
        vaccineLogs.push(...vLogs);
      }

      const data = {
        version: 2,
        exportDate: new Date().toISOString(),
        children: allChildren,
        milestoneLogs,
        growthMeasurements,
        quizSessions,
        vaccineLogs,
      };

      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GrowBabyGrow_FullBackup_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      showToast({ status: 'success', title: 'Backup Exported', message: 'Complete data backup exported successfully' });
    } catch (err) {
      showToast({ status: 'danger', title: 'Export Failed', message: 'Export backup failed' });
    }
  };

  const handleImportBackup = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.children && data.children.length > 0) {
          for (const c of data.children) {
            await storageService.saveChild(c);
          }

          if (Array.isArray(data.milestoneLogs)) {
            for (const log of data.milestoneLogs) {
              await storageService.saveMilestoneLog(log);
            }
          }

          if (Array.isArray(data.growthMeasurements)) {
            for (const g of data.growthMeasurements) {
              await storageService.saveGrowthMeasurement(g);
            }
          }

          if (Array.isArray(data.quizSessions)) {
            for (const q of data.quizSessions) {
              await storageService.saveQuizSession(q);
            }
          }

          if (Array.isArray(data.vaccineLogs)) {
            for (const v of data.vaccineLogs) {
              await storageService.saveVaccineLog(v);
            }
          }

          await setChild(data.children[0]);
          showToast({ status: 'success', title: 'Import Complete', message: 'All child profiles & history restored!' });
        }
      } catch (err) {
        showToast({ status: 'danger', title: 'Import Error', message: 'Invalid backup file' });
      }
    };
    reader.readAsText(file);
  };



  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.avatar}>👶</div>
        <h1>{t('profile.child_profile')}</h1>
      </header>

      {/* Children List with per-child PDF export */}
      <section className={styles.childrenSection}>
        <h2 className={styles.sectionTitle}>Registered Children ({children.length})</h2>
        <div className={styles.childrenList}>
          {children.map(child => {
            const isActive = child.id === activeChild?.id;
            const age = calculateAge(new Date(child.dob), child.gestationalWeeks);

            return (
              <div 
                key={child.id} 
                className={`${styles.childCard} ${isActive ? styles.childCardActive : ''}`}
              >
                <div className={styles.cardHeader}>
                  <div className={styles.childBrief}>
                    <span className={styles.childEmoji}>{getChildEmoji(child.gender)}</span>
                    <div>
                      <h3 className={styles.childName}>{child.name}</h3>
                      <span className={styles.childAge}>{age.displayAge}</span>
                    </div>
                  </div>
                  {isActive ? (
                    <span className={styles.activeTag}>Active Child</span>
                  ) : (
                    <button 
                      onClick={() => selectChild(child.id)} 
                      className={styles.selectChildBtn}
                    >
                      Set Active
                    </button>
                  )}
                </div>

                <div className={styles.infoGrid}>
                  <div className={styles.field}>
                    <label>{t('profile.dob')}</label>
                    <p>{new Date(child.dob).toLocaleDateString()}</p>
                  </div>
                  <div className={styles.field}>
                    <label>{t('profile.gender')}</label>
                    <p>{child.gender.toUpperCase()}</p>
                  </div>
                  {child.isPremature && (
                    <div className={styles.field}>
                      <label>Premature</label>
                      <p>{child.gestationalWeeks} Weeks</p>
                    </div>
                  )}
                </div>

                <button 
                  onClick={() => handleExportChildPdf(child)} 
                  className={styles.pdfExportBtn}
                  title={`Download Clinical Report (PDF) for ${child.name}`}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" width="16" height="16">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="12" y1="18" x2="12" y2="12" />
                    <polyline points="9 15 12 18 15 15" />
                  </svg>
                  Export PDF Report
                </button>
              </div>
            );
          })}
        </div>
      </section>

      <section className={styles.backupSection}>
        <h2>{t('profile.data_management')}</h2>
        <p className={styles.backupNote}>
          {t('profile.backup_note')}
        </p>
        
        <div className={styles.buttonGroup}>
          <button onClick={handleExportBackup} className={styles.btnSecondary}>
            📤 {t('profile.export_backup')}
          </button>
          
          <label className={styles.btnSecondary}>
            📥 {t('profile.import_backup')}
            <input type="file" accept=".json" onChange={handleImportBackup} hidden />
          </label>
        </div>
      </section>

      <section className={styles.credits}>
        <h3>{t('profile.clinical_standards')}</h3>
        <ul>
          <li><strong>{t('profile.milestones')}:</strong> AIIMS New Delhi / IAP standards.</li>
          <li><strong>{t('profile.growth_standards')}:</strong> WHO Child Growth Standards (2006).</li>
        </ul>
        <p className={styles.version}>{t('common.version')} 1.0.0 (Beta)</p>
      </section>
    </div>
  );
};
