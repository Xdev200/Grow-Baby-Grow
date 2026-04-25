import React from 'react';
import { NavLink } from 'react-router-dom';
import styles from './BottomNav.module.css';

export const BottomNav: React.FC = () => {
  return (
    <nav className={styles.navContainer}>
      <NavLink 
        to="/" 
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        <span className={styles.icon}>🏠</span>
        <span className={styles.label}>Home</span>
      </NavLink>
      
      <NavLink 
        to="/timeline" 
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        <span className={styles.icon}>📈</span>
        <span className={styles.label}>Track</span>
      </NavLink>

      <NavLink 
        to="/growth" 
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        <span className={styles.icon}>📏</span>
        <span className={styles.label}>Growth</span>
      </NavLink>

      <NavLink 
        to="/vaccination" 
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        <span className={styles.icon}>💉</span>
        <span className={styles.label}>Vaccines</span>
      </NavLink>

      <NavLink 
        to="/profile" 
        className={({ isActive }) => `${styles.navLink} ${isActive ? styles.active : ''}`}
      >
        <span className={styles.icon}>👶</span>
        <span className={styles.label}>Profile</span>
      </NavLink>
    </nav>
  );
};
