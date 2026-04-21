import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Legal.module.css';

export const PrivacyScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <button onClick={() => navigate(-1)} className={styles.backButton}>
        ← Back
      </button>
      
      <h1 className={styles.title}>Privacy Policy</h1>
      
      <div className={styles.section}>
        <h2>Data Sovereignty & Offline-First</h2>
        <p>
          Grow Baby Grow is designed with a "Privacy by Design" approach. 
          Unlike traditional apps that sync your sensitive health data to a cloud server, 
          this application is **offline-first**.
        </p>
        <ul>
          <li><strong>Local Storage:</strong> All data you enter (child profile, milestones, growth metrics, photos) is stored exclusively on your device using IndexedDB.</li>
          <li><strong>No Cloud Sync:</strong> We do not have a backend server. Your data never leaves your device unless you explicitly use the "Export Backup" feature.</li>
          <li><strong>Zero Telemetry:</strong> We do not track your usage, clicks, or behavior. There are no analytics scripts or cookies in this application.</li>
        </ul>
      </div>

      <div className={styles.section}>
        <h2>Access to Device Features</h2>
        <p>
          The app may request access to your local storage to persist data and your file system if you choose to export a report or import a backup. All photo attachments are converted to local data and are not accessible by external parties.
        </p>
      </div>

      <div className={styles.section}>
        <h2>Your Rights</h2>
        <p>
          Since all data is on your device, you have full control:
        </p>
        <ul>
          <li><strong>Export:</strong> You can download a JSON backup of your data at any time.</li>
          <li><strong>Delete:</strong> You can wipe all data by clearing your browser cache or using the "Delete Profile" feature within the app.</li>
        </ul>
      </div>

      <div className={styles.footer}>
        Last updated: April 2026
      </div>
    </div>
  );
};
