import React from 'react';
import { useTranslation } from 'react-i18next';
import { useChild } from '../context/ChildContext';
import { storageService } from '../services/storage';
// import { LanguageSwitcher } from '../components/navigation/LanguageSwitcher';
import styles from './Profile.module.css';

export const ProfileScreen: React.FC = () => {
  const { activeChild, setChild } = useChild();
  const { t } = useTranslation();

  const handleExport = async () => {
    try {
      const children = await storageService.getChildren();
      const data = {
        exportDate: new Date().toISOString(),
        children
      };
      
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `GrowBabyGrow_Backup_${new Date().toLocaleDateString()}.json`;
      a.click();
    } catch (err) {
      alert('Export failed');
    }
  };

  const handleImport = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const data = JSON.parse(event.target?.result as string);
        if (data.children && data.children.length > 0) {
          await storageService.saveChild(data.children[0]);
          setChild(data.children[0]);
          alert('Data imported successfully!');
        }
      } catch (err) {
        alert('Invalid backup file');
      }
    };
    reader.readAsText(file);
  };

  if (!activeChild) return null;

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.avatar}>👶</div>
        <h1>{t('profile.child_profile')}</h1>
      </header>

      <section className={styles.infoCard}>
        <div className={styles.field}>
          <label>{t('profile.name')}</label>
          <p>{activeChild.name}</p>
        </div>
        <div className={styles.field}>
          <label>{t('profile.dob')}</label>
          <p>{new Date(activeChild.dob).toLocaleDateString()}</p>
        </div>
        <div className={styles.field}>
          <label>{t('profile.gender')}</label>
          <p>{activeChild.gender}</p>
        </div>
      </section>

      {/* <section className={styles.backupSection}>
        <h2>{t('common.language')}</h2>
        <LanguageSwitcher />
      </section> */}

      <section className={styles.backupSection}>
        <h2>{t('profile.data_management')}</h2>
        <p className={styles.backupNote}>
          {t('profile.backup_note')}
        </p>
        
        <div className={styles.buttonGroup}>
          <button onClick={handleExport} className={styles.btnSecondary}>
            📤 {t('profile.export_backup')}
          </button>
          
          <label className={styles.btnSecondary}>
            📥 {t('profile.import_backup')}
            <input type="file" accept=".json" onChange={handleImport} hidden />
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
