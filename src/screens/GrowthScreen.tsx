import React, { useMemo, useState } from 'react';
import { useChild } from '../context/ChildContext';
import { GrowthChart } from '../components/growth/GrowthChart';
import { calculateAge } from '../utils/age';
import styles from '../components/growth/Growth.module.css';

export const GrowthScreen: React.FC = () => {
  const { activeChild, updateGrowth } = useChild();
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
          <h1 className={styles.title}>Growth Tracking</h1>
          <p className={styles.subtitle}>WHO Z-Score Reference ({ageData.displayAge})</p>
        </div>
        <div className={styles.tabToggle}>
          <button 
            className={`${styles.tabButton} ${activeTab === 'weight' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('weight')}
          >
            Weight
          </button>
          <button 
            className={`${styles.tabButton} ${activeTab === 'height' ? styles.tabActive : ''}`}
            onClick={() => setActiveTab('height')}
          >
            Height
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
          <h3 className={styles.sectionTitle}>Latest Measurements</h3>
          <button 
            className={styles.editButton}
            onClick={() => isEditing ? handleSave() : setIsEditing(true)}
          >
            {isEditing ? 'Save' : 'Edit'}
          </button>
        </div>
        
        <div className={styles.row}>
          <div className={styles.inputCard}>
            <span className={styles.label}>Weight (kg)</span>
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
            <span className={styles.label}>Length (cm)</span>
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
