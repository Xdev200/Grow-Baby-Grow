import React, { useState, useMemo } from 'react';
import type { Child } from '../../types';
import { calculateAge, getLocalISODate } from '../../utils/age';
import styles from './Onboarding.module.css';

interface ProfileFormProps {
  onSubmit: (child: Child) => void;
}

export const ProfileForm: React.FC<ProfileFormProps> = ({ onSubmit }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [name, setName] = useState('');
  const [dob, setDob] = useState(getLocalISODate());
  const [gender, setGender] = useState<'boy' | 'girl' | 'other'>('boy');
  const [isPremature, setIsPremature] = useState(false);
  const [gestationalWeeks, setGestationalWeeks] = useState(40);
  const [birthWeightKg, setBirthWeightKg] = useState<string>('');
  const [birthHeightCm, setBirthHeightCm] = useState<string>('');
  const [currentWeightKg, setCurrentWeightKg] = useState<string>('');
  const [currentHeightCm, setCurrentHeightCm] = useState<string>('');

  const agePreview = useMemo(() => {
    try {
      return calculateAge(new Date(dob), gestationalWeeks);
    } catch {
      return null;
    }
  }, [dob, gestationalWeeks]);

  const isOlderThan28Days = useMemo(() => {
    if (!agePreview) return false;
    return agePreview.chronologicalTotalDays > 28;
  }, [agePreview]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Use crypto.randomUUID if available, else fallback for older mobile browsers
    const generateId = () => {
      if (typeof crypto !== 'undefined' && crypto.randomUUID) {
        return crypto.randomUUID();
      }
      return `id-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    };

    const newChild: Child = {
      id: generateId(),
      name: name.trim(),
      dob,
      gender,
      isPremature,
      gestationalWeeks: isPremature ? gestationalWeeks : 40,
      birthWeightKg: birthWeightKg ? parseFloat(birthWeightKg) : undefined,
      birthHeightCm: birthHeightCm ? parseFloat(birthHeightCm) : undefined,
      currentWeightKg: currentWeightKg ? parseFloat(currentWeightKg) : undefined,
      currentHeightCm: currentHeightCm ? parseFloat(currentHeightCm) : undefined,
      createdAt: new Date().toISOString()
    };

    setIsSubmitting(true);
    try {
      onSubmit(newChild);
    } catch (error) {
      console.error("Submission failed", error);
      setIsSubmitting(false);
    }
  };

  return (
    <form className={styles.onboardingContainer} onSubmit={handleSubmit}>
      <header className={styles.formHeader}>
        <h1>About Your Baby</h1>
        <p>Let's personalize your tracking experience.</p>
      </header>

      <div className={styles.formSection}>
        <div className={styles.formGroup}>
          <label htmlFor="name">Baby's Name</label>
          <input
            id="name"
            type="text"
            className={styles.inputField}
            placeholder="Enter name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className={styles.formGroup}>
          <label>Gender</label>
          <div className={styles.toggleGroup}>
            {(['boy', 'girl', 'other'] as const).map((g) => (
              <div
                key={g}
                className={`${styles.toggleLabel} ${gender === g ? styles.toggleLabelSelected : ''}`}
                onClick={() => setGender(g)}
              >
                {g.charAt(0).toUpperCase() + g.slice(1)}
              </div>
            ))}
          </div>
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="dob">Date of Birth</label>
          <input
            id="dob"
            type="date"
            className={styles.inputField}
            max={getLocalISODate()}
            value={dob}
            onChange={(e) => setDob(e.target.value)}
            required
          />
        </div>
      </div>

      <div className={styles.formSection}>
        <h3 className={styles.sectionTitle}>Birth Details</h3>
        <div className={styles.row}>
          <div className={styles.formGroup}>
            <label htmlFor="weight">Weight (kg)</label>
            <input
              id="weight"
              type="number"
              step="0.01"
              className={styles.inputField}
              placeholder="0.00"
              value={birthWeightKg}
              onChange={(e) => setBirthWeightKg(e.target.value)}
            />
          </div>
          <div className={styles.formGroup}>
            <label htmlFor="height">Height (cm)</label>
            <input
              id="height"
              type="number"
              step="0.1"
              className={styles.inputField}
              placeholder="0.0"
              value={birthHeightCm}
              onChange={(e) => setBirthHeightCm(e.target.value)}
            />
          </div>
        </div>
      </div>

      {isOlderThan28Days && (
        <div className={`${styles.formSection} ${styles.highlightSection}`}>
          <h3 className={styles.sectionTitle}>Current Growth Info</h3>
          <p className={styles.sectionNote}>Required for babies older than 28 days</p>
          <div className={styles.row}>
            <div className={styles.formGroup}>
              <label htmlFor="currentWeight">Current Weight (kg)</label>
              <input
                id="currentWeight"
                type="number"
                step="0.01"
                className={styles.inputField}
                placeholder="0.00"
                value={currentWeightKg}
                onChange={(e) => setCurrentWeightKg(e.target.value)}
                required={isOlderThan28Days}
              />
            </div>
            <div className={styles.formGroup}>
              <label htmlFor="currentHeight">Current Height (cm)</label>
              <input
                id="currentHeight"
                type="number"
                step="0.1"
                className={styles.inputField}
                placeholder="0.0"
                value={currentHeightCm}
                onChange={(e) => setCurrentHeightCm(e.target.value)}
                required={isOlderThan28Days}
              />
            </div>
          </div>
        </div>
      )}

      <div className={styles.formSection}>
        <div 
          className={`${styles.toggleLabel} ${isPremature ? styles.toggleLabelSelected : ''}`}
          onClick={() => setIsPremature(!isPremature)}
        >
          Was the baby born premature? (Before 37 weeks)
        </div>
        
        {isPremature && (
          <div className={styles.accentBox}>
            <label htmlFor="weeks">Gestational Weeks ({gestationalWeeks} weeks)</label>
            <input
              id="weeks"
              type="range"
              min="24"
              max="36"
              step="1"
              value={gestationalWeeks}
              onChange={(e) => setGestationalWeeks(parseInt(e.target.value))}
              style={{ width: '100%' }}
            />
          </div>
        )}
      </div>

      {agePreview && (
        <div className={styles.agePreview}>
          <span className={styles.previewLabel}>Current Age:</span>
          <strong>{agePreview.displayAge}</strong>
        </div>
      )}

      <button 
        type="submit" 
        className={styles.submitButton}
        disabled={isSubmitting}
      >
        {isSubmitting ? 'Initializing...' : 'Start Tracking'}
      </button>
    </form>
  );
};
