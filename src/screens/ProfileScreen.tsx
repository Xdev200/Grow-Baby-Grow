import React from 'react';
import { useChild } from '../context/ChildContext';
import { storageService } from '../services/storage';
import styles from './Profile.module.css';

export const ProfileScreen: React.FC = () => {
  const { activeChild, setChild } = useChild();

  const handleExport = async () => {
    try {
      const children = await storageService.getChildren();
      // We'll export child profile + logs for simplicity in this demo
      // In production, we'd loop through all logs/growth measurements
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
          // Simplistic import: save the first child
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
        <h1>Child Profile</h1>
      </header>

      <section className={styles.infoCard}>
        <div className={styles.field}>
          <label>Name</label>
          <p>{activeChild.name}</p>
        </div>
        <div className={styles.field}>
          <label>Date of Birth</label>
          <p>{new Date(activeChild.dob).toLocaleDateString()}</p>
        </div>
        <div className={styles.field}>
          <label>Gender</label>
          <p>{activeChild.gender}</p>
        </div>
      </section>

      <section className={styles.backupSection}>
        <h2>Data Management</h2>
        <p className={styles.backupNote}>
          Grow Baby Grow is offline-first. Your data never leaves this device unless you export a backup.
        </p>
        
        <div className={styles.buttonGroup}>
          <button onClick={handleExport} className={styles.btnSecondary}>
            📤 Export Backup (JSON)
          </button>
          
          <label className={styles.btnSecondary}>
            📥 Import Backup
            <input type="file" accept=".json" onChange={handleImport} hidden />
          </label>
        </div>
      </section>

      <section className={styles.credits}>
        <h3>Clinical Standards</h3>
        <ul>
          <li><strong>Milestones:</strong> AIIMS New Delhi / IAP standards.</li>
          <li><strong>Growth:</strong> WHO Child Growth Standards (2006).</li>
        </ul>
        <p className={styles.version}>Version 1.0.0 (Beta)</p>
      </section>
    </div>
  );
};
