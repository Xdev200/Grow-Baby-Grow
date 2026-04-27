import React, { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useChild } from '../context/ChildContext';
import { GrowthChart } from '../components/growth/GrowthChart';
import { calculateAge } from '../utils/age';
import styles from '../components/growth/Growth.module.css';

export const GrowthScreen: React.FC = () => {
  const { activeChild, updateGrowth } = useChild();
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'weight' | 'height'>('weight');
  const [isEditing, setIsEditing] = useState(false);
  
  const ageData = useMemo(() => {
    if (!activeChild) return null;
    return calculateAge(new Date(activeChild.dob), activeChild.gestationalWeeks);
  }, [activeChild]);

  const [editWeight, setEditWeight] = useState(activeChild?.currentWeightKg?.toString() || '');
  const [editHeight, setEditHeight] = useState(activeChild?.currentHeightCm?.toString() || '');

  if (!activeChild || !ageData) return null;

  const month = ageData.assessmentAgeMonths;

  const weightPoints = [
    { month: 0, value: activeChild.birthWeightKg || 3.3 },
    { month, value: activeChild.currentWeightKg || (activeChild.birthWeightKg || 3.3) }
  ];

  const heightPoints = [
    { month: 0, value: activeChild.birthHeightCm || 49.9 },
    { month, value: activeChild.currentHeightCm || (activeChild.birthHeightCm || 49.9) }
  ];

  const handleSave = async () => {
    await updateGrowth(
      editWeight ? parseFloat(editWeight) : undefined,
      editHeight ? parseFloat(editHeight) : undefined
    );
    setIsEditing(false);
  };

  return (
    <div className={styles.growthScreen}>
      <header className={styles.header}>
        <div>
          <h1 className={styles.title}>{t('growth.title')}</h1>
          <p className={styles.subtitle}>{t('growth.subtitle', { age: ageData.displayAge })}</p>
        </div>
        <div className={styles.tabToggle}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'weight' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('weight')}
          >
            {t('growth.weight')}
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'height' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('height')}
          >
            {t('growth.height')}
          </button>
        </div>
      </header>

      <GrowthChart 
        gender={activeChild.gender} 
        type={activeTab === 'weight' ? "weight_for_age" : "height_for_age"} 
        currentData={activeTab === 'weight' ? weightPoints : heightPoints}
        childAgeMonths={month}
      />

      <div className={styles.inputGroup}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>{t('growth.latest_measurements')}</h3>
          <button 
            className={styles.editButton}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? t('common.save') : t('common.edit')}
          </button>
        </div>
        
        <div className={styles.row}>
          <div className={styles.inputCard}>
            <span className={styles.label}>{t('growth.weight_kg')}</span>
            {isEditing ? (
              <input 
                type="number" 
                step="0.01"
                className={styles.editInput}
                value={editWeight}
                onChange={(e) => setEditWeight(e.target.value)}
              />
            ) : (
              <span className={styles.value}>{activeChild.currentWeightKg || '--'}</span>
            )}
          </div>
          
          <div className={styles.inputCard}>
            <span className={styles.label}>{t('growth.length_cm')}</span>
            {isEditing ? (
              <input 
                type="number" 
                step="0.1"
                className={styles.editInput}
                value={editHeight}
                onChange={(e) => setEditHeight(e.target.value)}
              />
            ) : (
              <span className={styles.value}>{activeChild.currentHeightCm || '--'}</span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
