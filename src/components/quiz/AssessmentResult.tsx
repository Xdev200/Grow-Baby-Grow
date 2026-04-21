import React from 'react';
import { useNavigate } from 'react-router-dom';
import type { MilestoneMaster } from '../../types';
import styles from './Quiz.module.css';

interface AssessmentResultProps {
  status: 'on_track' | 'watch' | 'lagging';
  redFlags: MilestoneMaster[];
  watchItems: MilestoneMaster[];
}

export const AssessmentResult: React.FC<AssessmentResultProps> = ({ 
  status, 
  redFlags, 
  watchItems 
}) => {
  const navigate = useNavigate();

  const getStatusInfo = () => {
    switch (status) {
      case 'on_track':
        return {
          title: 'Development On Track',
          message: 'Your baby is reaching milestones appropriately for their age. Keep up the great stimulation!',
          class: styles.statusOnTrack
        };
      case 'watch':
        return {
          title: 'Watch & Stimulate',
          message: 'Some milestones are pending. Try the suggested activities below and re-assess in 4 weeks.',
          class: styles.statusWatch
        };
      case 'lagging':
        return {
          title: 'Action Recommended',
          message: 'Certain markers suggest a clinical review is needed. Please consult your pediatrician with this report.',
          class: styles.statusLagging
        };
    }
  };

  const info = getStatusInfo();

  return (
    <div className={styles.resultContainer}>
      <div className={`${styles.statusBanner} ${info.class}`}>
        <h2>{info.title}</h2>
        <p>{info.message}</p>
      </div>

      {(redFlags.length > 0 || watchItems.length > 0) && (
        <div style={{ textAlign: 'left', marginTop: '32px' }}>
          <h3 style={{ fontSize: '18px', marginBottom: '16px' }}>Suggestions & Recommendations</h3>
          
          {[...redFlags, ...watchItems].map((m, i) => (
            <div key={i} style={{ 
              background: '#f8fafc', 
              padding: '16px', 
              borderRadius: '16px', 
              marginBottom: '12px',
              borderLeft: `4px solid ${m.isRedFlag ? 'var(--coral)' : 'var(--amber)'}`
            }}>
              <p style={{ fontWeight: 600, fontSize: '14px', marginBottom: '4px' }}>{m.milestone}</p>
              <p style={{ fontSize: '13px', color: '#64748b' }}>
                {m.suggestion || "Encourage more floor time and social interaction to help your baby reach this goal."}
              </p>
            </div>
          ))}
        </div>
      )}

      <button 
        style={{
          width: '100%',
          padding: '16px',
          background: '#1e293b',
          color: 'white',
          border: 'none',
          borderRadius: '12px',
          fontWeight: 700,
          marginTop: '32px',
          cursor: 'pointer'
        }}
        onClick={() => navigate('/')}
      >
        Back to Dashboard
      </button>
    </div>
  );
};
