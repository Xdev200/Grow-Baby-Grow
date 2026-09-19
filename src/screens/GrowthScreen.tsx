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

  const currentWeightVal = activeChild.currentWeightKg ?? activeChild.birthWeightKg ?? 3.3;
  const currentHeightVal = activeChild.currentHeightCm ?? activeChild.birthHeightCm ?? 49.9;

  const [editWeight, setEditWeight] = useState(currentWeightVal.toString());
  const [editHeight, setEditHeight] = useState(currentHeightVal.toString());

  // Keep edit fields synced whenever activeChild changes
  React.useEffect(() => {
    if (activeChild) {
      const w = activeChild.currentWeightKg ?? activeChild.birthWeightKg ?? 3.3;
      const h = activeChild.currentHeightCm ?? activeChild.birthHeightCm ?? 49.9;
      setEditWeight(w.toString());
      setEditHeight(h.toString());
    }
  }, [activeChild]);

  if (!activeChild || !ageData) return null;

  const month = ageData.assessmentAgeMonths;

  const weightPoints = [
    { month: 0, value: activeChild.birthWeightKg || 3.3 },
    { month, value: currentWeightVal }
  ];

  const heightPoints = [
    { month: 0, value: activeChild.birthHeightCm || 49.9 },
    { month, value: currentHeightVal }
  ];

  const handleStartEdit = () => {
    setEditWeight(currentWeightVal.toString());
    setEditHeight(currentHeightVal.toString());
    setIsEditing(true);
  };

  const handleSave = async () => {
    await updateGrowth(
      editWeight ? parseFloat(editWeight) : currentWeightVal,
      editHeight ? parseFloat(editHeight) : currentHeightVal
    );
    setIsEditing(false);
  };

  return (
    <div className={styles.growthScreen}>
      <header className={styles.header}>
        <div className={styles.headerTitleRow}>
          <h1 className={styles.title}>{t('growth.title')}</h1>
        </div>
        <p className={styles.subtitle}>{t('growth.subtitle', { age: ageData.displayAge })}</p>
      </header>

      {/* Current measurements placed ABOVE graph */}
      <div className={styles.inputGroup}>
        <div className={styles.sectionHeader}>
          <h3 className={styles.sectionTitle}>{t('growth.latest_measurements')}</h3>
          <button
            className={styles.editButton}
            onClick={() => isEditing ? handleSave() : handleStartEdit()}
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
                placeholder={currentWeightVal.toString()}
                onChange={(e) => setEditWeight(e.target.value)}
              />
            ) : (
              <span className={styles.value}>{`${currentWeightVal} kg`}</span>
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
                placeholder={currentHeightVal.toString()}
                onChange={(e) => setEditHeight(e.target.value)}
              />
            ) : (
              <span className={styles.value}>{`${currentHeightVal} cm`}</span>
            )}
          </div>
        </div>
      </div>

      {/* Weight/Height toggle directly above chart */}
      <div className={styles.chartToggleRow}>
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
      </div>

      <GrowthChart
        gender={activeChild.gender}
        type={activeTab === 'weight' ? "weight_for_age" : "height_for_age"}
        currentData={activeTab === 'weight' ? weightPoints : heightPoints}
        childAgeMonths={month}
      />
    </div>
  );
};
