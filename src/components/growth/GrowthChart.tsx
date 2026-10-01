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

  // Generate paths for core centiles
  const p3 = relevantData.map((d: any) => `${getX(d.month)},${getY(d.p3)}`).join(' ');
  const p50 = relevantData.map((d: any) => `${getX(d.month)},${getY(d.p50)}`).join(' ');
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
  let statusColor = 'var(--primary)';
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
        <polygon points={safetyArea} fill="rgba(16, 185, 129, 0.08)" />

        {/* Horizontal reference grid lines */}
        {[0.25, 0.5, 0.75, 1].map(p => {
          const val = Math.round(maxValue * p);
          const yPos = getY(val);
          return (
            <g key={p}>
              <line x1={padding.left} y1={yPos} x2={width - padding.right} y2={yPos} stroke="#f1f5f9" strokeDasharray="2,2" />
              <text x={padding.left - 6} y={yPos + 3} fontSize="9" fill="#94a3b8" textAnchor="end">{val}</text>
            </g>
          );
        })}

        {/* Base axes */}
        <line x1={padding.left} y1={height - padding.bottom} x2={width - padding.right} y2={height - padding.bottom} stroke="#cbd5e1" strokeWidth="1.5" />
        <line x1={padding.left} y1={padding.top} x2={padding.left} y2={height - padding.bottom} stroke="#cbd5e1" strokeWidth="1.5" />

        {/* X-axis labels (Age) */}
        {Array.from({ length: 6 }, (_, i) => Math.round((maxAxisMonth / 5) * i)).map(m => (
          <text key={m} x={getX(m)} y={height - padding.bottom + 16} fontSize="10" fontWeight="600" fill="#64748b" textAnchor="middle">
            {m === 0 ? 'Birth' : m >= 12 ? `${Math.floor(m/12)}y` : `${m}m`}
          </text>
        ))}

        {/* Percentile Curves */}
        <polyline points={p3} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />
        <polyline points={p50} fill="none" stroke="var(--primary)" strokeWidth="2.5" />
        <polyline points={p97} fill="none" stroke="#94a3b8" strokeWidth="1" strokeDasharray="3,3" />

        {/* Friendly Curve Labels */}
        <text x={width - padding.right + 4} y={getY(relevantData[relevantData.length - 1].p97) + 3} fontSize="8" fontWeight="600" fill="#64748b">Top</text>
        <text x={width - padding.right + 4} y={getY(relevantData[relevantData.length - 1].p50) + 3} fontSize="8" fontWeight="700" fill="var(--primary)">Avg</text>
        <text x={width - padding.right + 4} y={getY(relevantData[relevantData.length - 1].p3) + 3} fontSize="8" fontWeight="600" fill="#64748b">Low</text>

        {/* User Data Points */}
        {currentData.map((d, i) => {
          const ref = relevantData.reduce((prev: any, curr: any) => 
            Math.abs(curr.month - d.month) < Math.abs(prev.month - d.month) ? curr : prev
          );
          const isDeviated = d.value < ref.p3 || d.value > ref.p97;
          const cx = getX(d.month);
          const cy = getY(d.value);
          
          return (
            <g key={i}>
              <circle 
                cx={cx} 
                cy={cy} 
                r="5" 
                fill={isDeviated ? "var(--coral)" : "#0f172a"} 
                stroke="white"
                strokeWidth="2"
              />
              {i === currentData.length - 1 && (
                <g>
                  <rect 
                    x={cx - 20} 
                    y={cy - 24} 
                    width="40" 
                    height="16" 
                    rx="4" 
                    fill="#0f172a" 
                  />
                  <text 
                    x={cx} 
                    y={cy - 13} 
                    fontSize="9" 
                    fontWeight="700" 
                    fill="white"
                    textAnchor="middle"
                  >
                    {d.value} {type === 'weight_for_age' ? 'kg' : 'cm'}
                  </text>
                </g>
              )}
            </g>
          );
        })}
      </svg>
      <div className={styles.chartFooter}>
        <span>{title}</span>
        <span style={{ fontSize: 11, color: 'var(--primary)', fontWeight: 600 }}>● Shaded area = Typical Healthy Range</span>
      </div>
      <div className={styles.insightSection}>
        <span className={styles.chartBadge} style={{ backgroundColor: statusColor }}>{status}</span>
        <p className={styles.laymanExplanation}>{explanation}</p>
      </div>
    </div>
  );
});

GrowthChart.displayName = 'GrowthChart';

