import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import type { Child, MilestoneLog, MilestoneMaster } from '../types';
import milestonesData from '../data/milestones_aiims.json';

const ALL_MILESTONES = milestonesData as MilestoneMaster[];

export const generateClinicalReport = (
  child: Child,
  logs: MilestoneLog[],
  ageDisplay: string,
  assessmentAgeMonths: number
) => {
  const doc = new jsPDF();
  const pageWidth = doc.internal.pageSize.getWidth();

  // 1. Header
  doc.setFontSize(22);
  doc.setTextColor(29, 158, 117); // Emerald Green
  doc.text('Grow Baby Grow', 20, 30);
  
  doc.setFontSize(10);
  doc.setTextColor(100);
  doc.text('Clinical Development Report (AIIMS-Standard)', 20, 38);
  
  doc.setDrawColor(200);
  doc.line(20, 42, pageWidth - 20, 42);

  // 2. Child Profile
  doc.setFontSize(14);
  doc.setTextColor(0);
  doc.text('Patient Information', 20, 55);
  
  doc.setFontSize(11);
  doc.text(`Name: ${child.name}`, 20, 65);
  doc.text(`Age: ${ageDisplay}`, 20, 72);
  doc.text(`Gender: ${child.gender.toUpperCase()}`, 100, 65);
  doc.text(`Premature: ${child.isPremature ? 'Yes' : 'No'}`, 100, 72);
  
  if (child.birthWeightKg) {
    doc.text(`Birth Weight: ${child.birthWeightKg} kg`, 20, 79);
  }

  // 3. Red Flags Section (Critical)
  const achievedIds = new Set(logs.filter(l => l.status === 'achieved').map(l => l.milestoneId));
  const missedRedFlags = ALL_MILESTONES.filter(m => 
    m.isRedFlag && 
    m.ageMonths <= assessmentAgeMonths && // Only check up to current age
    !achievedIds.has(m.id)
  );

  if (missedRedFlags.length > 0) {
    doc.setTextColor(225, 29, 72); // Coral/Red
    doc.setFontSize(12);
    doc.text('CLINICAL RED FLAGS DETECTED', 20, 95);
    
    autoTable(doc, {
      startY: 100,
      head: [['Milestone', 'Domain', 'Clinical Threshold']],
      body: missedRedFlags.map(m => [
        m.milestone,
        m.domain.replace('_', ' ').toUpperCase(),
        `${m.ageMonths} Months`
      ]),
      headStyles: { fillColor: [225, 29, 72] }
    });
  }

  // 4. Milestone Summary Table
  const lastY = (doc as any).lastAutoTable?.finalY || 100;
  doc.setTextColor(0);
  doc.setFontSize(12);
  doc.text('Achievement Summary', 20, lastY + 20);

  autoTable(doc, {
    startY: lastY + 25,
    head: [['Milestone', 'Status', 'Date Logged']],
    body: logs.slice(0, 20).map(l => {
      const milestone = ALL_MILESTONES.find(m => m.id === l.milestoneId);
      return [
        milestone?.milestone || 'Unknown',
        l.status.toUpperCase(),
        new Date(l.loggedAt).toLocaleDateString()
      ];
    }),
    headStyles: { fillColor: [45, 126, 233] }
  });

  // 5. Disclaimer
  doc.setFontSize(8);
  doc.setTextColor(150);
  const footerY = doc.internal.pageSize.getHeight() - 20;
  doc.text('DISCLAIMER: This report is generated based on parental observation and should not be considered a substitute for a professional pediatric clinical examination. Please share with your doctor.', 20, footerY, { maxWidth: pageWidth - 40 });

  doc.save(`${child.name.replace(/\s+/g, '_')}_Milestone_Report.pdf`);
};
