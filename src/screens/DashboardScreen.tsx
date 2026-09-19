import React, { useEffect, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useChild } from '../context/ChildContext';
import { useAssessment } from '../hooks/useAssessment';
import { DomainCard } from '../components/dashboard/DomainCard';
import { RedFlagBanner } from '../components/dashboard/RedFlagBanner';
import { DomainDetailModal } from '../components/dashboard/DomainDetailModal';
import { VaccineCatchupModal } from '../components/vaccination/CatchupModal';
import { storageService } from '../services/storage';
import { vaccineService } from '../services/vaccineService';
import { PROCESSED_MILESTONES } from '../data/milestoneProcessor';
import { calculateAge } from '../utils/age';
import { formatDistanceToNow, startOfDay, isAfter } from 'date-fns';
import type { Domain, MilestoneMaster, VaccineLog } from '../types';
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

  const [logs, setLogs] = useState<any[]>([]);
  const [hasCheckedLogs, setHasCheckedLogs] = useState(false);
  const [selectedDomain, setSelectedDomain] = useState<Domain | null>(null);
  const [childStats, setChildStats] = useState<Record<string, ChildCardStats>>({});
  const [expandedChildId, setExpandedChildId] = useState<string | null>(activeChild?.id || null);
  const [toast, setToast] = useState<{ status: 'on_track' | 'watch' | 'lagging'; title: string; message: string } | null>(null);
  const [recentAssessment, setRecentAssessment] = useState<RecentAssessment | null>(null);
  const [activeMilestoneTab, setActiveMilestoneTab] = useState<'upcoming' | 'latest'>('upcoming');
  const [showCatchupModal, setShowCatchupModal] = useState(false);
  const [catchupVaccines, setCatchupVaccines] = useState<{ vaccine: any; dueDate: Date }[]>([]);

  // Trigger vaccine catch-up drawer after 30 seconds of completion of 1st assessment
  useEffect(() => {
    if (!activeChild) return;

    const firstCompletedStr = localStorage.getItem(`first_assessment_completed_at_${activeChild.id}`);
    const hasVisited = localStorage.getItem(`vax_visited_${activeChild.id}`);

    if (firstCompletedStr && !hasVisited) {
      const completedTime = parseInt(firstCompletedStr, 10);
      const elapsed = Date.now() - completedTime;
      const delay = Math.max(0, 30000 - elapsed);

      const timer = setTimeout(async () => {
        try {
          const vaxLogs = await storageService.getVaccineLogs(activeChild.id);
          const vaxVisitedCheck = localStorage.getItem(`vax_visited_${activeChild.id}`);
          if (vaxLogs.length === 0 && !vaxVisitedCheck) {
            const data = await vaccineService.getVaccineSchedule(activeChild);
            const today = startOfDay(new Date());
            const pastOrBirth = data.filter(item => {
              const isBirth = item.ageWeeks === 0 || item.ageLabel.toLowerCase().includes('birth');
              return isBirth || !isAfter(item.dueDate, today);
            }).map(item => ({ vaccine: item, dueDate: item.dueDate }));

            if (pastOrBirth.length > 0) {
              setCatchupVaccines(pastOrBirth);
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
    localStorage.setItem(`vax_visited_${activeChild.id}`, 'true');
    setShowCatchupModal(false);
  };

  const handleCatchupClose = () => {
    if (activeChild) {
      localStorage.setItem(`vax_visited_${activeChild.id}`, 'true');
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
            const isBirth = v.ageWeeks === 0 || v.ageLabel.toLowerCase().includes('birth');
            return isBirth || !isAfter(v.dueDate, today);
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

  const getChildEmoji = (gender: string) => {
    if (gender === 'girl') return '👧';
    if (gender === 'boy') return '👦';
    return '👶';
  };

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

      {/* Multi-child Hero Section: full width card per child with expandable details */}
      <section className={styles.heroSection}>
        <div className={styles.heroHeader}>
          <h2 className={styles.heroSectionTitle}>Children ({children.length})</h2>
          <button
            type="button"
            className={styles.heroAddChildBtn}
            onClick={() => navigate('/onboarding')}
            title="Register another child"
          >
            <span>➕</span>
            <span>Add Child</span>
          </button>
        </div>

        <div className={styles.heroChildList}>
          {children.map(child => {
            const isActive = child.id === activeChild.id;
            const isExpanded = expandedChildId === child.id;
            const cAge = calculateAge(new Date(child.dob), child.gestationalWeeks);
            const stats = childStats[child.id] || {
              achieved: 0,
              redFlags: 0,
              pendingVaccines: 0,
              weight: child.currentWeightKg ?? child.birthWeightKg ?? null,
              height: child.currentHeightCm ?? child.birthHeightCm ?? null,
              lastEntry: 'No entries yet'
            };

            return (
              <div
                key={child.id}
                className={`${styles.childHeroCard} ${isActive ? styles.childHeroCardActive : ''}`}
              >
                <div
                  className={styles.cardMainRow}
                  onClick={() => selectChild(child.id)}
                  title={isActive ? undefined : "Switch active child"}
                >
                  <div className={styles.childInfo}>
                    <div className={styles.heroAvatar}>{getChildEmoji(child.gender)}</div>
                    <div>
                      <div className={styles.nameBadgeRow}>
                        <h3 className={styles.heroName}>{child.name}</h3>
                        {isActive ? (
                          <span className={styles.activeBadge}>Active</span>
                        ) : (
                          <span className={styles.switchBadge}>Tap to select</span>
                        )}
                      </div>
                      <p className={styles.heroAge}>{cAge.displayAge}</p>
                    </div>
                  </div>

                  <button
                    type="button"
                    className={styles.expandToggleBtn}
                    onClick={(e) => {
                      e.stopPropagation();
                      setExpandedChildId(isExpanded ? null : child.id);
                    }}
                    aria-label={isExpanded ? "Collapse details" : "Expand details"}
                  >
                    <span className={styles.expandLabel}>{isExpanded ? 'Less' : 'Details'}</span>
                    <span className={`${styles.chevron} ${isExpanded ? styles.chevronOpen : ''}`}>▼</span>
                  </button>
                </div>

                {/* Primary KPI status: milestones, red flags, pending vaccines */}
                <div className={styles.heroSummaryRow}>
                  <div className={styles.summaryBadge}>
                    <span className={styles.badgeIcon}>🎯</span>
                    <span className={styles.badgeText}>
                      <strong>{stats.achieved}</strong> milestones
                    </span>
                  </div>

                  <div className={`${styles.summaryBadge} ${stats.redFlags > 0 ? styles.redFlagBadge : styles.neutralBadge}`}>
                    <span className={styles.badgeIcon}>{stats.redFlags > 0 ? '⚠️' : '✓'}</span>
                    <span className={styles.badgeText}>
                      <strong>{stats.redFlags}</strong> {stats.redFlags === 1 ? 'red flag' : 'red flags'}
                    </span>
                  </div>

                  <div className={`${styles.summaryBadge} ${stats.pendingVaccines > 0 ? styles.pendingVaxBadge : styles.neutralBadge}`}>
                    <span className={styles.badgeIcon}>{stats.pendingVaccines > 0 ? '💉' : '✓'}</span>
                    <span className={styles.badgeText}>
                      {stats.pendingVaccines > 0
                        ? `${stats.pendingVaccines} ${stats.pendingVaccines === 1 ? 'vaccine' : 'vaccines'} pending...`
                        : 'Vaccines up to date'}
                    </span>
                  </div>
                </div>

                {/* Expandable details: weight, height, last entry, latest achieved & next target */}
                {isExpanded && (
                  <div className={styles.expandedDetails}>
                    <div className={styles.expandDetailGrid}>
                      <div className={styles.expandDetailItem}>
                        <span className={styles.detailItemLabel}>Weight</span>
                        <span className={styles.detailItemVal}>
                          {stats.weight ? `${stats.weight} kg` : '--'}
                        </span>
                      </div>
                      <div className={styles.expandDetailItem}>
                        <span className={styles.detailItemLabel}>Height / Length</span>
                        <span className={styles.detailItemVal}>
                          {stats.height ? `${stats.height} cm` : '--'}
                        </span>
                      </div>
                      <div className={styles.expandDetailItem}>
                        <span className={styles.detailItemLabel}>Last Entry</span>
                        <span className={styles.detailItemVal}>{stats.lastEntry}</span>
                      </div>
                      <div className={styles.expandDetailItem} style={{ gridColumn: 'span 3' }}>
                        <span className={styles.detailItemLabel}>Latest Achieved Milestone</span>
                        <span className={styles.detailItemVal} style={{ fontSize: '12px' }}>
                          {stats.latestAchievedTitle ? `✓ ${stats.latestAchievedTitle}` : 'None logged yet'}
                        </span>
                      </div>
                      <div className={styles.expandDetailItem} style={{ gridColumn: 'span 3' }}>
                        <span className={styles.detailItemLabel}>Next Target Milestone</span>
                        <span className={styles.detailItemVal} style={{ fontSize: '12px' }}>
                          {stats.nextUpcomingTitle ? `🎯 ${stats.nextUpcomingTitle}` : 'All age targets met!'}
                        </span>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </section>

      {/* Persistent Recent Assessment Section (replaces back-to-dashboard requirement) */}
      {recentAssessment && (
        <section className={styles.assessmentSection}>
          <div className={styles.assessmentHeader}>
            <h3 className={styles.assessmentTitle}>Recent Assessment Status</h3>
            <span className={`${styles.assessmentStatusBadge} ${styles[`status_${recentAssessment.status}`]}`}>
              {recentAssessment.status === 'on_track' ? 'On Track' : recentAssessment.status === 'watch' ? 'Watch & Stimulate' : 'Review Advised'}
            </span>
          </div>
          <p className={styles.assessmentMessage}>
            {recentAssessment.status === 'on_track'
              ? `${activeChild.name} is progressing smoothly according to clinical milestones.`
              : 'Review stimulation recommendations below and practice with your child.'}
          </p>

          {(recentAssessment.redFlags.length > 0 || recentAssessment.watchItems.length > 0) && (
            <div className={styles.recommendationsList}>
              {[...recentAssessment.redFlags, ...recentAssessment.watchItems].slice(0, 3).map((item, idx) => (
                <div key={idx} className={styles.recommendationCard}>
                  <p className={styles.recMilestone}>{item.milestone}</p>
                  <p className={styles.recSuggestion}>
                    {item.suggestion || item.laymanDescription || 'Encourage playtime and activities to support this milestone.'}
                  </p>
                </div>
              ))}
            </div>
          )}
        </section>
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

          {/* Milestone Progress Snapshot (Tabbed Full-Width Card: Upcoming Stage & Latest Achieved) */}
          <div className={styles.milestoneHighlightSection}>
            <div className={styles.sectionHeader}>
              <h3>Milestone Snapshot for {activeChild.name}</h3>
              <p className={styles.helperText}>Upcoming stage targets & latest achieved milestones</p>
            </div>

            <div className={styles.tabbedCard}>
              <div className={styles.tabHeader}>
                <button
                  type="button"
                  className={`${styles.tabButton} ${activeMilestoneTab === 'upcoming' ? `${styles.tabButtonActive} ${styles.tabButtonActiveUpcoming}` : ''}`}
                  onClick={() => setActiveMilestoneTab('upcoming')}
                >
                  <span>🎯</span> Upcoming Milestones ({nextStageLabel})
                  <span className={styles.tabBadge}>{upcomingStageMilestones.length}</span>
                </button>
                <button
                  type="button"
                  className={`${styles.tabButton} ${activeMilestoneTab === 'latest' ? `${styles.tabButtonActive} ${styles.tabButtonActiveAchieved}` : ''}`}
                  onClick={() => setActiveMilestoneTab('latest')}
                >
                  <span>✓</span> Last Achieved
                  <span className={styles.tabBadge}>{latestAchievedMilestones.length}</span>
                </button>
              </div>

              <div className={styles.tabContent}>
                {activeMilestoneTab === 'upcoming' ? (
                  <>
                    <div className={styles.targetStageSubheader}>
                      <span>Milestones expected at next assessment stage ({nextStageLabel}):</span>
                      <span className={styles.targetStageBadge}>{nextStageLabel}</span>
                    </div>
                    <div className={styles.highlightCardList}>
                      {upcomingStageMilestones.length > 0 ? (
                        upcomingStageMilestones.map(m => (
                          <div key={m.id} className={styles.highlightCardItem}>
                            <div className={styles.highlightItemMeta}>
                              <span className={styles.domainChip}>{m.domain.replace('_', ' ')}</span>
                              <span className={styles.ageChip}>{m.ageMonths}m</span>
                            </div>
                            <p className={styles.highlightItemText}>{m.milestone}</p>
                          </div>
                        ))
                      ) : (
                        <p className={styles.emptyText} style={{ margin: 0, fontSize: '12px' }}>
                          All target milestones for {nextStageLabel} achieved!
                        </p>
                      )}
                    </div>
                  </>
                ) : (
                  <div className={styles.highlightCardList}>
                    {latestAchievedMilestones.length > 0 ? (
                      latestAchievedMilestones.map(m => (
                        <div key={m.id} className={styles.highlightCardItem}>
                          <div className={styles.highlightItemMeta}>
                            <span className={styles.domainChip}>{m.domain.replace('_', ' ')}</span>
                            <span className={styles.ageChip}>{m.ageMonths}m</span>
                          </div>
                          <p className={styles.highlightItemText}>{m.milestone}</p>
                        </div>
                      ))
                    ) : (
                      <p className={styles.emptyText} style={{ margin: 0, fontSize: '12px' }}>
                        No milestones logged as achieved yet.
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>

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
