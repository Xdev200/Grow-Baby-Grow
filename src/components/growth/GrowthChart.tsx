import React from 'react';
import growthData from '../../data/growth_iap.json';
import styles from './Growth.module.css';

interface GrowthChartProps {
  gender: 'boy' | 'girl' | 'other';
  type: 'weight_for_age' | 'height_for_age';
  currentData?: { month: number; value: number }[];
  childAgeMonths: number;
}

export const GrowthChart: React.FC<GrowthChartProps> = React.memo(({ 
  gender, 
  type, 
  currentData = [],
  childAgeMonths
}) => {
  const whoGender = gender === 'girl' ? 'female' : 'male';
  const data = (growthData as any)[type][whoGender];
  
  // Dimensions
  const width = 360;
  const height = 240;
  const padding = { top: 20, right: 40, bottom: 40, left: 40 };

  // Calculate scales based on child age and data range
  // We show up to the next milestone bracket or 5 years min
  const maxAxisMonth = Math.max(60, Math.ceil((childAgeMonths + 12) / 12) * 12);
  const relevantData = data.filter((d: any) => d.month <= maxAxisMonth);
  
  const maxValue = type === 'weight_for_age' 
    ? Math.max(...relevantData.map((d: any) => d.p97), ...(currentData.map(d => d.value))) * 1.1
    : Math.max(...relevantData.map((d: any) => d.p97), ...(currentData.map(d => d.value))) * 1.05;

  const getX = (m: number) => (m / maxAxisMonth) * (width - padding.left - padding.right) + padding.left;
  const getY = (v: number) => height - ((v / maxValue) * (height - padding.top - padding.bottom) + padding.bottom);

  // Generate paths for all centiles
  const p3 = relevantData.map((d: any) => `${getX(d.month)},${getY(d.p3)}`).join(' ');
  const p15 = relevantData.map((d: any) => `${getX(d.month)},${getY(d.p15)}`).join(' ');
  const p50 = relevantData.map((d: any) => `${getX(d.month)},${getY(d.p50)}`).join(' ');
  const p85 = relevantData.map((d: any) => `${getX(d.month)},${getY(d.p85)}`).join(' ');
  const p97 = relevantData.map((d: any) => `${getX(d.month)},${getY(d.p97)}`).join(' ');

  // Area between P3 and P97 (Safety Zone)
  const safetyArea = [
    ...relevantData.map((d: any) => `${getX(d.month)},${getY(d.p3)}`),
    ...relevantData.reverse().map((d: any) => `${getX(d.month)},${getY(d.p97)}`)
  ].join(' ');
  // Reverse back for subsequent use
  relevantData.reverse();

  const title = type === 'weight_for_age' ? 'Weight-for-age (kg)' : 'Height-for-age (cm)';
  const referenceText = childAgeMonths < 60 ? 'WHO Standards (0-5Y)' : 'IAP 2015 Revised Standards (5-18Y)';

  // Determine Current Status (Layman Language)
  const latestPoint = currentData[currentData.length - 1];
  let status = 'Growing Healthy';
  let statusColor = 'var(--emerald)';
  let explanation = 'Your child is tracking within the typical healthy growth range.';
  
  if (latestPoint && latestPoint.month <= maxAxisMonth) {
    const ref = relevantData.reduce((prev: any, curr: any) => 
      Math.abs(curr.month - latestPoint.month) < Math.abs(prev.month - latestPoint.month) ? curr : prev
    );
    
    if (latestPoint.value < ref.p3) {
      status = type === 'weight_for_age' ? 'Needs Nutrition Check' : 'Growing at Own Pace';
      explanation = type === 'weight_for_age' 
        ? 'Weight is currently below the typical range. Consider consulting a pediatrician for nutrition advice.'
        : 'Height is currently below the typical range. This could be temporary or genetics-related.';
      statusColor = 'var(--error)';
    } else if (latestPoint.value > ref.p97) {
      status = type === 'weight_for_age' ? 'Above Average Weight' : 'Very Tall for Age';
      explanation = 'Your child is tracking above the 97th percentile, which is much higher than most children of this age.';
      statusColor = 'var(--error)';
    } else if (latestPoint.value < ref.p15 || latestPoint.value > ref.p85) {
      status = 'Watch & Monitor';
      explanation = 'Currently on the outer edges of the typical range. Normal, but keep maintaining consistent checkups.';
      statusColor = 'var(--warning)';
    }
  }

  return (
    <div className={styles.chartWrapper}>
      <div className={styles.chartHeader}>
        <div className={styles.refInfo}>
          <div className={styles.chartSubTitle}>{referenceText}</div>
          <div className={styles.infoIcon}>ⓘ</div>
        </div>
      </div>

      <svg viewBox={`0 0 ${width} ${height}`} className={styles.svg}>
        {/* Shaded Normal Range Area */}
        <polygon points={safetyArea} fill="rgba(16, 185, 129, 0.05)" />

        {/* Grid lines */}
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#e2e8f0" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#e2e8f0" />

        {/* X-axis labels (Age) */}
        {Array.from({ length: 6 }, (_, i) => Math.round((maxAxisMonth / 5) * i)).map(m => (
          <text key={m} x={getX(m)} y={height - padding.bottom + 16} fontSize="9" fill="#94a3b8" textAnchor="middle">
            {m === 0 ? 'Birth' : m >= 12 ? `${Math.floor(m/12)}y` : `${m}m`}
          </text>
        ))}

        {/* Y-axis labels */}
        {[0, 0.25, 0.5, 0.75, 1].map(p => {
          const val = Math.round(maxValue * p);
          return (
            <text key={p} x={padding.left - 8} y={getY(val) + 3} fontSize="9" fill="#94a3b8" textAnchor="end">{val}</text>
          );
        })}

        {/* Percentile Curves */}
        <polyline points={p3} fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />
        <polyline points={p15} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,2" />
        <polyline points={p50} fill="none" stroke="var(--emerald)" strokeWidth="2" strokeOpacity="0.6" />
        <polyline points={p85} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="4,2" />
        <polyline points={p97} fill="none" stroke="#cbd5e1" strokeWidth="1" strokeDasharray="3,3" />

        {/* Curve Labels */}
        <text x={width - padding.right + 4} y={getY(relevantData[relevantData.length - 1].p50)} fontSize="8" fill="var(--emerald)">P50</text>
        <text x={width - padding.right + 4} y={getY(relevantData[relevantData.length - 1].p97)} fontSize="8" fill="#cbd5e1">P97</text>
        <text x={width - padding.right + 4} y={getY(relevantData[relevantData.length - 1].p3)} fontSize="8" fill="#cbd5e1">P3</text>

        {/* User Data Points */}
        {currentData.map((d, i) => {
          const ref = relevantData.reduce((prev: any, curr: any) => 
            Math.abs(curr.month - d.month) < Math.abs(prev.month - d.month) ? curr : prev
          );
          const isDeviated = d.value < ref.p3 || d.value > ref.p97;
          
          return (
            <g key={i}>
              <circle 
                cx={getX(d.month)} 
                cy={getY(d.value)} 
                r="4" 
                fill={isDeviated ? "var(--error)" : "#1e293b"} 
                stroke="white"
                strokeWidth="1.5"
              />
              {i === currentData.length - 1 && (
                <text 
                  x={getX(d.month)} 
                  y={getY(d.value) - 10} 
                  fontSize="10" 
                  fontWeight="bold" 
                  fill={isDeviated ? "var(--error)" : "#1e293b"}
                  textAnchor="middle"
                >
                  {d.value}
                </text>
              )}
            </g>
          );
        })}
      </svg>
      <div className={styles.chartFooter}>{title}</div>
      <div className={styles.insightSection}>
        <span className={styles.chartBadge} style={{ backgroundColor: statusColor }}>{status}</span>
        <p className={styles.laymanExplanation}>{explanation}</p>
      </div>
    </div>
  );
});

GrowthChart.displayName = 'GrowthChart';

