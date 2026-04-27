import React from 'react';
import { NavLink } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import styles from './BottomNav.module.css';

export const BottomNav: React.FC = () => {
  const { t } = useTranslation();

  return (
    <nav className={styles.navContainer}>
      <NavLink 
        to="/" 
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        <span className={styles.icon}>🏠</span>
        <span className={styles.label}>{t('common.home')}</span>
      </NavLink>
      
      <NavLink 
        to="/timeline" 
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        <span className={styles.icon}>📈</span>
        <span className={styles.label}>{t('common.track')}</span>
      </NavLink>

      <NavLink 
        to="/growth" 
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        <span className={styles.icon}>📏</span>
        <span className={styles.label}>{t('common.growth')}</span>
      </NavLink>

      <NavLink 
        to="/vaccination" 
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        <span className={styles.icon}>💉</span>
        <span className={styles.label}>{t('common.vaccines')}</span>
      </NavLink>

      <NavLink 
        to="/profile" 
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        <span className={styles.icon}>👶</span>
        <span className={styles.label}>{t('common.profile')}</span>
      </NavLink>
    </nav>
  );
};
