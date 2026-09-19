import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { ProgressRing } from './ProgressRing';
import type { Domain } from '../../types';
import styles from './Dashboard.module.css';

export const DOMAIN_DESCRIPTIONS: Record<string, { icon: string; desc: string }> = {
  hearing: {
    icon: '👂',
    desc: 'Auditory processing, startling to loud sounds, localizing voices, and listening responses.'
  },
  vision: {
    icon: '👁️',
    desc: 'Visual tracking, focusing on faces & objects, depth perception, and eye movement.'
  },
  gross_motor: {
    icon: '🏃',
    desc: 'Large muscle movements like head control, rolling, sitting, crawling, and walking.'
  },
  fine_motor: {
    icon: '🖐️',
    desc: 'Small muscle control of hands & fingers, grasping toys, and transferring objects.'
  },
  language: {
    icon: '🗣️',
    desc: 'Vocalizations, babbling, understanding words, speaking, and communicating.'
  },
  socio_adaptive: {
    icon: '🤝',
    desc: 'Social smiling, emotional bonding, interactive play, and self-help skills.'
  }
};

interface DomainCardProps {
  domain: Domain;
  name: string;
  total: number;
  achieved: number;
  color: string;
  onViewDetails?: () => void;
}

export const DomainCard: React.FC<DomainCardProps> = ({
  domain,
  name,
  total,
  achieved,
  color,
  onViewDetails
}) => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isFlipped, setIsFlipped] = useState(false);
  const progress = total > 0 ? (achieved / total) * 100 : 0;
  const domainInfo = DOMAIN_DESCRIPTIONS[domain] || { icon: '🎯', desc: 'Developmental milestones for this category.' };

  const handleCardClick = () => {
    setIsFlipped(prev => !prev);
  };

  return (
    <div className={styles.flipCardContainer}>
      <div 
        className={`${styles.flipCardInner} ${isFlipped ? styles.isFlipped : ''}`}
        onClick={handleCardClick}
      >
        {/* Front Face */}
        <div className={styles.flipCardFront}>
          <ProgressRing radius={36} stroke={6} progress={progress} color={color} />
          <div className={styles.frontContent}>
            <span className={styles.domainIcon}>{domainInfo.icon}</span>
            <span className={styles.domainName}>{name}</span>
            <span className={styles.statusText}>{achieved} / {total} {t('common.done')}</span>
          </div>
          <span className={styles.flipHint}>🔄 Tap to flip info</span>
        </div>

        {/* Back Face */}
        <div className={styles.flipCardBack}>
          <div className={styles.backHeader}>
            <span className={styles.backTitle}>{domainInfo.icon} {name}</span>
            <span className={styles.backTag}>Info</span>
          </div>
          <p className={styles.domainDescription}>{domainInfo.desc}</p>

          <div className={styles.backActions}>
            <button 
              type="button" 
              className={styles.viewDetailsBtn}
              onClick={(e) => {
                e.stopPropagation();
                if (onViewDetails) {
                  onViewDetails();
                } else {
                  navigate('/timeline');
                }
              }}
            >
              📋 All Milestones
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
