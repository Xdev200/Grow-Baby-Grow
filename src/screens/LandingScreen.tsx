import React from 'react';
import { useNavigate } from 'react-router-dom';
import styles from './Landing.module.css';

export const LandingScreen: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className={styles.container}>
      <div className={styles.content}>
        
          <img 
            src="/GBG_NoText-no_bg.png" 
            alt="Grow Baby Grow Logo" 
            className={styles.logo} 
          />
        
        
        <h1 className={styles.title}>Grow Baby Grow</h1>
        <p className={styles.subtitle}>
          Your offline-first clinical companion. Track your baby's growth, 
          developmental milestones, and health records securely on your device.
        </p>

        
      </div>
 
      <div className={styles.bottomSection}>
       

        <div className={styles.featuresList}>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>📈</span>
            <span>Growth Charts</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>🧠</span>
            <span>Milestone Tracking</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>🔒</span>
            <span>Offline & Private</span>
          </div>
          <div className={styles.featureItem}>
            <span className={styles.featureIcon}>📄</span>
            <span>Health Reports</span>
          </div>
        </div>
<button 
          className={styles.primaryButton}
          onClick={() => navigate('/onboarding')}
        >
          Get Started
        </button>
        <div className={styles.legalLinks}>
          <button onClick={() => navigate('/privacy')} className={styles.link}>Privacy Policy</button>
          <span className={styles.dot}>•</span>
          <button onClick={() => navigate('/terms')} className={styles.link}>Terms of Service</button>
        </div>

        <p className={styles.copyright}>
          © {new Date().getFullYear()} Grow Baby Grow. All rights reserved.
        </p>
      </div>
    </div>
  );
};
