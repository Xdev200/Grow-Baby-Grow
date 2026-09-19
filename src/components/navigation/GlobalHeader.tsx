import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useChild } from '../../context/ChildContext';
import styles from './GlobalHeader.module.css';

export const GlobalHeader: React.FC = () => {
  const { activeChild, children, selectChild } = useChild();
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  if (!activeChild) return null;

  // In quiz screen, hide global header to avoid distractions during assessment
  if (location.pathname === '/quiz') return null;

  const getChildEmoji = (gender: string) => {
    if (gender === 'girl') return '👧';
    if (gender === 'boy') return '👦';
    return '👶';
  };

  return (
    <>
      <header className={styles.headerContainer}>
        <div className={styles.brand} onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
          <span className={styles.brandLogo}>🌱</span>
          <span className={styles.brandName}>Grow Baby Grow</span>
        </div>

        <div className={styles.switcherWrapper}>
          <button 
            type="button"
            className={styles.switcherButton} 
            onClick={() => setDropdownOpen(prev => !prev)}
            aria-expanded={dropdownOpen}
            aria-label="Switch child profile"
          >
            <span className={styles.childAvatar}>{getChildEmoji(activeChild.gender)}</span>
            <span className={styles.childName}>{activeChild.name}</span>
            <svg 
              className={`${styles.chevron} ${dropdownOpen ? styles.chevronOpen : ''}`} 
              viewBox="0 0 20 20" 
              fill="currentColor" 
              width="14" 
              height="14"
            >
              <path fillRule="evenodd" d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" clipRule="evenodd" />
            </svg>
          </button>

          {dropdownOpen && (
            <div className={styles.dropdownMenu}>
              <p className={styles.dropdownTitle}>Child Profiles ({children.length})</p>
              <div className={styles.childList}>
                {children.map(child => {
                  const isActive = child.id === activeChild.id;
                  return (
                    <button
                      key={child.id}
                      type="button"
                      className={`${styles.childItem} ${isActive ? styles.childItemActive : ''}`}
                      onClick={() => {
                        selectChild(child.id);
                        setDropdownOpen(false);
                      }}
                    >
                      <div className={styles.itemLeft}>
                        <span>{getChildEmoji(child.gender)}</span>
                        <span className={styles.itemName}>{child.name}</span>
                      </div>
                      {isActive && <span className={styles.activeCheck}>✓</span>}
                    </button>
                  );
                })}
              </div>

              <div className={styles.divider} />

              <button
                type="button"
                className={styles.addChildButton}
                onClick={() => {
                  setDropdownOpen(false);
                  navigate('/onboarding');
                }}
              >
                <span>➕</span>
                <span>Add Another Child</span>
              </button>
            </div>
          )}
        </div>
      </header>

      {dropdownOpen && (
        <div className={styles.backdrop} onClick={() => setDropdownOpen(false)} />
      )}
    </>
  );
};
