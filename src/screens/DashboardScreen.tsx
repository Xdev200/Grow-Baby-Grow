import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useChild } from '../context/ChildContext';
import { useAssessment } from '../hooks/useAssessment';
import { DomainCard } from '../components/dashboard/DomainCard';
import { RedFlagBanner } from '../components/dashboard/RedFlagBanner';
import { DomainDetailModal } from '../components/dashboard/DomainDetailModal';
import { VaccineCatchupModal } from '../components/vaccination/CatchupModal';
import { ChildHeroSection } from '../components/dashboard/ChildHeroSection';
import { AssessmentSummary } from '../components/dashboard/AssessmentSummary';
import { DashboardStats } from '../components/dashboard/DashboardStats';
import { MilestoneSnapshot } from '../components/dashboard/MilestoneSnapshot';
import { FAB } from '../components/atoms/FAB/FAB';
import { storageService } from '../services/storage';
import { generateClinicalReport } from '../services/report';
import { preferencesService } from '../services/preferencesService';
import { vaccineService, isBirthDose } from '../services/vaccineService';
import { PROCESSED_MILESTONES } from '../data/milestoneProcessor';
import { calculateAge } from '../utils/age';
import { getChildEmoji } from '../utils/childHelpers';
import { formatDistanceToNow, startOfDay, isAfter } from 'date-fns';
import type { Domain, MilestoneMaster, MilestoneLog, VaccineMaster, VaccineLog } from '../types';
import styles from '../components/dashboard/Dashboard.module.css';

interface RecentAssessment {
  status: 'on_track' | 'watch' | 'lagging';
  redFlags: MilestoneMaster[];
  watchItems: MilestoneMaster[];
  date: string;
}

interface ChildCardStats {
  achieved: number;
  redFlags: number;
  pendingVaccines: number;
  weight: number | null;
  height: number | null;
  lastEntry: string;
  latestAchievedTitle?: string | null;
  nextUpcomingTitle?: string | null;
}

export const DashboardScreen: React.FC = () => {
  const { activeChild, children, selectChild } = useChild();
  const { ageData, domainProgress, triggeredRedFlags, refreshLogs } = useAssessment();
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useTranslation();

  const [logs, setLogs] = useState<MilestoneLog[]>([]);
  const [hasCheckedLogs, setHasCheckedLogs] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [childStats, setChildStats] = useState<Record<string, ChildCardStats>>({});
  const [expandedChildId, setExpandedChildId] = useState<string | null>(activeChild?.id || null);
  const [toast, setToast] = useState<{ status: 'on_track' | 'watch' | 'lagging'; title: string; message: string } | null>(null);
  const [recentAssessment, setRecentAssessment] = useState<RecentAssessment | null>(null);
  const [activeMilestoneTab, setActiveMilestoneTab] = useState<'upcoming' | 'latest'>('upcoming');
  const [showCatchupModal, setShowCatchupModal] = useState(false);
  const [catchupVaccines, setCatchupVaccines] = useState<{ vaccine: VaccineMaster; dueDate: Date }[]>([]);

  // Trigger vaccine catch-up drawer after 30 seconds of completion of milestone assessment and when next vaccine is due
  useEffect(() => {
    if (!activeChild) return;

    const completedStr = preferencesService.getLastAssessmentCompletedAt(activeChild.id);
    const hasVisited = preferencesService.getVaccineVisited(activeChild.id);

    if (completedStr && !hasVisited) {
      const completedTime = new Date(completedStr).getTime();
      if (isNaN(completedTime)) return;

      const elapsed = Date.now() - completedTime;
      const delay = Math.max(0, 30000 - elapsed);

      const timer = setTimeout(async () => {
        try {
          const vaxVisitedCheck = preferencesService.getVaccineVisited(activeChild.id);
          if (!vaxVisitedCheck) {
            const data = await vaccineService.getVaccineSchedule(activeChild);
            const today = startOfDay(new Date());
            const dueVaccines = data.filter(item => {
              const isLogDone = item.log?.status === 'completed';
              if (isLogDone) return false;
              return isBirthDose(item) || !isAfter(item.dueDate, today);
            }).map(item => ({ vaccine: item, dueDate: item.dueDate }));

            if (dueVaccines.length > 0) {
              setCatchupVaccines(dueVaccines);
              setShowCatchupModal(true);
            }
          }
        } catch (e) {
          console.error('Error triggering vaccine catch-up drawer:', e);
        }
      }, delay);

      return () => clearTimeout(timer);
    }
  }, [activeChild]);

  const handleCatchupConfirm = async (vaxLogs: VaccineLog[]) => {
    if (!activeChild) return;
    for (const log of vaxLogs) {
      await storageService.saveVaccineLog(log);
    }
    preferencesService.setVaccineVisited(activeChild.id);
    setShowCatchupModal(false);
  };

  const handleCatchupClose = () => {
    if (activeChild) {
      preferencesService.setVaccineVisited(activeChild.id);
    }
    setShowCatchupModal(false);
  };

  // Load milestone logs for active child
  useEffect(() => {
    if (activeChild) {
      storageService.getMilestoneLogs(activeChild.id).then((l) => {
        setLogs(l);
        setHasCheckedLogs(true);
      });
      refreshLogs();

      // Check for recent assessment
      const stored = sessionStorage.getItem(`recent_assessment_${activeChild.id}`);
      if (stored) {
        try {
          const parsed = JSON.parse(stored) as RecentAssessment;
          setRecentAssessment(parsed);
        } catch (e) {
          console.error(e);
        }
      } else {
        setRecentAssessment(null);
      }
    }
  }, [activeChild, refreshLogs]);

  // Check for assessment toast on navigation
  useEffect(() => {
    const state = location.state as { showAssessmentToast?: boolean; assessmentData?: RecentAssessment } | null;
    if (state?.showAssessmentToast && state.assessmentData) {
      const data = state.assessmentData;
      setRecentAssessment(data);
      const isLagging = data.status === 'lagging';
      const isWatch = data.status === 'watch';

      setToast({
        status: data.status,
        title: isLagging ? 'Action Recommended' : isWatch ? 'Watch & Stimulate' : 'Development On Track!',
        message: isLagging
          ? 'Pediatric review is recommended for certain markers.'
          : isWatch
            ? 'Some milestones are pending stimulation. See recommendations below.'
            : `${activeChild?.name || 'Your baby'} is meeting milestones on schedule!`
      });

      // Clear state so toast doesn't re-show on refresh
      navigate('/', { replace: true, state: {} });
    }
  }, [location, activeChild, navigate]);

  // Load comprehensive stats for all children
  useEffect(() => {
    const loadStats = async () => {
      const statsMap: Record<string, ChildCardStats> = {};
      const today = startOfDay(new Date());

      for (const c of children) {
        const cLogs = await storageService.getMilestoneLogs(c.id);
        const achieved = cLogs.filter(l => l.status === 'achieved').length;

        // Red flags count: milestones marked 'not_yet' that are red flags
        const redFlags = cLogs.filter(l => {
          if (l.status !== 'not_yet') return false;
          const m = PROCESSED_MILESTONES.find(pm => pm.id === l.milestoneId);
          return m?.isRedFlag;
        }).length;

        // Pending vaccines count
        let pendingVaccines = 0;
        try {
          const vaxSchedule = await vaccineService.getVaccineSchedule(c);
          pendingVaccines = vaxSchedule.filter(v => {
            if (v.log?.status === 'completed') return false;
            return isBirthDose(v) || !isAfter(v.dueDate, today);
          }).length;
        } catch (e) {
          console.error(e);
        }

        // Growth measurements (weight and height)
        const growth = await storageService.getGrowthMeasurements(c.id);
        const sortedGrowth = growth.sort((a, b) => new Date(b.measuredDate || b.loggedAt).getTime() - new Date(a.measuredDate || a.loggedAt).getTime());
        const latestGrowth = sortedGrowth[0];
        const weight = latestGrowth?.weightKg ?? c.currentWeightKg ?? c.birthWeightKg ?? null;
        const height = latestGrowth?.heightCm ?? c.currentHeightCm ?? c.birthHeightCm ?? null;

        // Last entry timestamp
        const vaxLogs = await storageService.getVaccineLogs(c.id);
        let latestTimestamp: number | null = null;
        cLogs.forEach(l => {
          if (l.loggedAt) {
            const t = new Date(l.loggedAt).getTime();
            if (!latestTimestamp || t > latestTimestamp) latestTimestamp = t;
          }
        });
        growth.forEach(g => {
          const d = g.measuredDate || g.loggedAt;
          if (d) {
            const t = new Date(d).getTime();
            if (!latestTimestamp || t > latestTimestamp) latestTimestamp = t;
          }
        });
        vaxLogs.forEach(v => {
          const d = v.administeredDate || v.loggedAt;
          if (d) {
            const t = new Date(d).getTime();
            if (!latestTimestamp || t > latestTimestamp) latestTimestamp = t;
          }
        });

        let lastEntry = 'No entries yet';
        if (latestTimestamp) {
          lastEntry = formatDistanceToNow(new Date(latestTimestamp), { addSuffix: true });
        } else if (c.createdAt) {
          lastEntry = formatDistanceToNow(new Date(c.createdAt), { addSuffix: true });
        }

        // Calculate latest achieved milestone and next target milestone for child
        const cAge = calculateAge(new Date(c.dob), c.gestationalWeeks);
        const cRelevantMs = PROCESSED_MILESTONES.filter(m => m.ageMonths <= cAge.assessmentAgeMonths);
        const cAchievedLogs = cLogs.filter(l => l.status === 'achieved');
        const sortedLogs = [...cAchievedLogs].sort((a, b) => new Date(b.loggedAt || 0).getTime() - new Date(a.loggedAt || 0).getTime());
        const latestLog = sortedLogs[0];
        const latestAchievedM = latestLog ? PROCESSED_MILESTONES.find(m => m.id === latestLog.milestoneId) : null;
        const nextUpcomingM = cRelevantMs.find(m => !cLogs.some(l => l.milestoneId === m.id && l.status === 'achieved'));

        statsMap[c.id] = {
          achieved,
          redFlags,
          pendingVaccines,
          weight,
          height,
          lastEntry,
          latestAchievedTitle: latestAchievedM ? latestAchievedM.milestone : null,
          nextUpcomingTitle: nextUpcomingM ? nextUpcomingM.milestone : null
        };
      }
      setChildStats(statsMap);
    };

    if (children.length > 0) {
      loadStats();
    }
  }, [children, logs]);

  if (!activeChild || !ageData) return null;

  const totalAchieved = domainProgress.reduce((acc, curr) => acc + curr.achieved, 0);

  const getMilestonesForDomain = (domain: Domain) => {
    return PROCESSED_MILESTONES
      .filter(m => m.domain === domain && m.ageMonths <= ageData.assessmentAgeMonths)
      .sort((a, b) => a.ageMonths - b.ageMonths);
  };

  const activeAchievedLogs = logs.filter(l => l.status === 'achieved');
  const latestAchievedMilestones = PROCESSED_MILESTONES
    .filter(m => activeAchievedLogs.some(l => l.milestoneId === m.id))
    .slice(-3)
    .reverse();

  // Find next assessment stage age for upcoming milestones tab
  const distinctAges = Array.from(new Set(PROCESSED_MILESTONES.map(m => m.ageMonths))).sort((a, b) => a - b);
  const nextAssessmentStageAge = distinctAges.find(age => age > ageData.assessmentAgeMonths) ?? ageData.assessmentAgeMonths;
  const nextStageLabel = nextAssessmentStageAge === 0 ? 'Birth' : `${nextAssessmentStageAge} month${nextAssessmentStageAge === 1 ? '' : 's'}`;

  const upcomingStageMilestones = PROCESSED_MILESTONES.filter(
    m => m.ageMonths === nextAssessmentStageAge && !logs.some(l => l.milestoneId === m.id && l.status === 'achieved')
  );




  return (
    <div className={styles.dashboardContainer}>
      {/* Toast Popup Notification */}
      {toast && (
        <div className={`${styles.assessmentToast} ${styles[`toast_${toast.status}`]}`}>
          <div className={styles.toastIcon}>
            {toast.status === 'on_track' ? '🎉' : toast.status === 'watch' ? '👀' : '⚠️'}
          </div>
          <div className={styles.toastContent}>
            <h4>{toast.title}</h4>
            <p>{toast.message}</p>
          </div>
          <button
            type="button"
            className={styles.toastClose}
            onClick={() => setToast(null)}
            aria-label="Close notification"
          >
            ✕
          </button>
        </div>
      )}

      {/* Header */}
      <header className={styles.header}>
        <div className={styles.profileBrief}>
          <div className={styles.avatar}>{getChildEmoji(activeChild.gender)}</div>
          <div>
            <h1 className={styles.babyName}>{activeChild.name}</h1>
            <p className={styles.babyAge}>{ageData.displayAge}</p>
          </div>
        </div>
      </header>

      {/* Multi-child Hero Section */}
      <ChildHeroSection
        childrenList={children}
        activeChild={activeChild}
        childStats={childStats}
        expandedChildId={expandedChildId}
        onSelectChild={selectChild}
        onToggleExpand={(id) => setExpandedChildId(expandedChildId === id ? null : id)}
        onAddChild={() => navigate('/onboarding')}
      />

      {/* Persistent Recent Assessment Summary */}
      {recentAssessment && (
        <AssessmentSummary recentAssessment={recentAssessment} activeChild={activeChild} />
      )}

      {hasCheckedLogs && logs.length === 0 ? (
        <div className={styles.welcomeCard + ' fade-in'}>
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
            onDownload={() => {
              if (activeChild && ageData) {
                generateClinicalReport(activeChild, logs, ageData.displayAge, ageData.assessmentAgeMonths);
              }
            }}
          />

          <DashboardStats
            totalAchieved={totalAchieved}
            redFlagsCount={triggeredRedFlags.length}
          />

          <MilestoneSnapshot
            childName={activeChild.name}
            activeTab={activeMilestoneTab}
            nextStageLabel={nextStageLabel}
            upcomingMilestones={upcomingStageMilestones}
            latestAchievedMilestones={latestAchievedMilestones}
            onTabChange={setActiveMilestoneTab}
          />

          <div className={styles.sectionHeader}>
            <div>
              <h3>
                {t('dashboard.developmental_domains')}
                <span className={styles.domainAgeBadge}>
                  {t('dashboard.for_age', 'Age: {{age}}', { age: ageData.displayAge })}
                </span>
              </h3>
              <p className={styles.helperText}>{t('dashboard.tap_card_details', 'Tap card to flip & view domain info')}</p>
            </div>
          </div>

          {domainProgress.filter((dp) => dp.total > 0).length > 0 ? (
            <div className={styles.grid}>
              {domainProgress
                .filter((dp) => dp.total > 0)
                .map((dp) => (
                  <DomainCard
                    key={dp.domain}
                    domain={dp.domain as Domain}
                    name={dp.name}
                    total={dp.total}
                    achieved={dp.achieved}
                    color={dp.color}
                    onViewDetails={() => navigate('/timeline')}
                  />
                ))}
            </div>
          ) : (
            <p className={styles.emptyText} style={{ textAlign: 'center', margin: '20px 0' }}>
              No milestones defined for this age stage.
            </p>
          )}

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

      {showCatchupModal && activeChild && (
        <VaccineCatchupModal
          childId={activeChild.id}
          pastVaccines={catchupVaccines}
          onConfirm={handleCatchupConfirm}
          onClose={handleCatchupClose}
        />
      )}

      <FAB
        ariaLabel={t('dashboard.new_assessment')}
        onClick={() => navigate('/quiz')}
      />
    </div>
  );
};
