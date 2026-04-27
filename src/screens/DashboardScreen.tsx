import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useChild } from '../context/ChildContext';
import { useAssessment } from '../hooks/useAssessment';
import { DomainCard } from '../components/dashboard/DomainCard';
import { RedFlagBanner } from '../components/dashboard/RedFlagBanner';
import { DomainDetailModal } from '../components/dashboard/DomainDetailModal';
import { generateClinicalReport } from '../services/report';
import { storageService } from '../services/storage';
import { PROCESSED_MILESTONES } from '../data/milestoneProcessor';
import type { Domain } from '../types';
import styles from '../components/dashboard/Dashboard.module.css';

export const DashboardScreen: React.FC = () => {
  const { activeChild } = useChild();
  const { ageData, domainProgress, triggeredRedFlags, refreshLogs } = useAssessment();
  const navigate = useNavigate();
  const { t } = useTranslation();

  const [logs, setLogs] = React.useState<any[]>([]);
  const [hasCheckedLogs, setHasCheckedLogs] = React.useState(false);
  const [selectedDomain, setSelectedDomain] = React.useState<Domain | null>(null);

  useEffect(() => {
    if (activeChild) {
      storageService.getMilestoneLogs(activeChild.id).then((l) => {
        setLogs(l);
        setHasCheckedLogs(true);
      });
      refreshLogs();
    }
  }, [activeChild, refreshLogs]);

  if (!activeChild || !ageData) return null;

  const handleDownloadReport = () => {
    generateClinicalReport(activeChild, logs, ageData.displayAge, ageData.assessmentAgeMonths);
  };

  const totalAchieved = domainProgress.reduce((acc, curr) => acc + curr.achieved, 0);

  const getMilestonesForDomain = (domain: Domain) => {
    return PROCESSED_MILESTONES
      .filter(m => m.domain === domain && m.ageMonths <= ageData.assessmentAgeMonths)
      .sort((a, b) => a.ageMonths - b.ageMonths);
  };

  return (
    <div className={styles.dashboardContainer}>
      <header className={styles.header}>
        <div className={styles.profileBrief}>
          <div className={styles.avatar}>👶</div>
          <div>
            <h1 className={styles.babyName}>{activeChild.name}</h1>
            <p className={styles.babyAge}>{ageData.displayAge}</p>
          </div>
        </div>
        <button 
          onClick={handleDownloadReport}
          className={styles.reportButton}
          disabled={logs.length === 0}
          title={t('dashboard.download_pdf')}
        >
          📄
        </button>
      </header>

      {hasCheckedLogs && logs.length === 0 ? (
        <div className={styles.welcomeCard + ' fade-in'}>
          <div className={styles.welcomeIcon}>🚀</div>
          <h2>{t('dashboard.ready_to_track')}</h2>
          <p>{t('dashboard.welcome_text')} ({ageData.assessmentAgeMonths}m).</p>
          <button 
            className="btn-primary" 
            style={{ width: '100%', marginTop: '16px' }}
            onClick={() => navigate('/quiz')}
          >
            {t('dashboard.start_first_assessment')}
          </button>
        </div>
      ) : (
        <>
          <RedFlagBanner 
            flags={triggeredRedFlags} 
            onDownload={handleDownloadReport}
          />

          <div className={styles.statsRow}>
            <div className={styles.statBox}>
              <span className={styles.statVal}>{totalAchieved}</span>
              <span className={styles.statLabel}>{t('dashboard.milestones_achieved')}</span>
            </div>
            <div className={styles.statBox}>
              <span className={styles.statVal} style={{ color: triggeredRedFlags.length > 0 ? 'var(--coral)' : 'var(--primary)' }}>
                {triggeredRedFlags.length}
              </span>
              <span className={styles.statLabel}>{t('dashboard.red_flags')}</span>
            </div>
          </div>

          <div className={styles.sectionHeader}>
            <h3>{t('dashboard.developmental_domains')}</h3>
            <p className={styles.helperText}>{t('dashboard.tap_card_details')}</p>
          </div>

          <div className={styles.grid}>
            {domainProgress.map((dp) => (
              <DomainCard 
                key={dp.domain}
                name={dp.name}
                total={dp.total}
                achieved={dp.achieved}
                color={dp.color}
                onClick={() => setSelectedDomain(dp.domain as Domain)}
              />
            ))}
          </div>

          {selectedDomain && (
            <DomainDetailModal
              domain={selectedDomain}
              milestones={getMilestonesForDomain(selectedDomain)}
              logs={logs}
              onClose={() => setSelectedDomain(null)}
            />
          )}
        </>
      )}

      <button 
        className={styles.fab} 
        title={t('dashboard.new_assessment')}
        onClick={() => navigate('/quiz')}
      >
        +
      </button>
    </div>
  );
};
