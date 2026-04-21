/**
 * Clinical Age Calculator for Grow Baby Grow.
 * Handles corrected age calculations for premature infants up to 24 months,
 * as per standard pediatric practice (AIIMS/WHO).
 */

export interface AgeResult {
  chronologicalMonths: number;
  chronologicalDays: number;
  correctedMonths: number;
  correctedDays: number;
  chronologicalTotalDays: number; // Added for easy comparisons
  isPrematureCorrected: boolean;
  displayAge: string; // The age used for assessment
  assessmentAgeMonths: number; // The numeric month value for milestone lookup
}

/**
 * Helper to calculate calendar-aware difference in months and days
 */
const getCalendarDiff = (start: Date, end: Date) => {
  if (end < start) return { months: 0, days: 0 };

  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  if (days < 0) {
    months -= 1;
    // Get days in previous month of 'end'
    const prevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += prevMonth.getDate();
  }

  if (months < 0) {
    years -= 1;
    months += 12;
  }

  return {
    months: months + (years * 12),
    days
  };
};

export const calculateAge = (
  dobInput: Date | string,
  gestationalWeeks: number = 40,
  today: Date = new Date()
): AgeResult => {
  const dob = typeof dobInput === 'string' ? new Date(dobInput) : dobInput;
  
  // Guard against invalid dates
  if (isNaN(dob.getTime())) {
    return {
      chronologicalMonths: 0, chronologicalDays: 0,
      correctedMonths: 0, correctedDays: 0,
      chronologicalTotalDays: 0,
      isPrematureCorrected: false,
      displayAge: "Invalid Date",
      assessmentAgeMonths: 0
    };
  }

  // 1. Calculate Chronological Age
  const chrono = getCalendarDiff(dob, today);

  // 2. Calculate Corrected Age
  const isPreterm = gestationalWeeks < 37;
  const weeksPreterm = 40 - gestationalWeeks;
  const daysPreterm = weeksPreterm * 7;

  // Corrected age calculation (subtract preterm gap from chronological age)
  const correctedToday = new Date(today.getTime() - (isPreterm ? daysPreterm * 24 * 60 * 60 * 1000 : 0));
  const corrected = getCalendarDiff(dob, correctedToday);

  // 3. Determine if corrected age should be used (until 2 years)
  // According to AIIMS/WHO, corrected age is used for preterm babies until 24 months
  const useCorrected = isPreterm && chrono.months < 24;

  const assessmentAgeMonths = useCorrected ? corrected.months : chrono.months;
  
  // 4. Formatting display age
  const months = useCorrected ? corrected.months : chrono.months;
  const days = useCorrected ? corrected.days : chrono.days;
  
  let displayAge = "";
  if (months === 0) {
    displayAge = `${days} day${days !== 1 ? 's' : ''}`;
  } else {
    displayAge = `${months} month${months !== 1 ? 's' : ''} ${days} day${days !== 1 ? 's' : ''}`;
  }

  if (useCorrected) {
    displayAge += " (Corrected)";
  }

  return {
    chronologicalMonths: chrono.months,
    chronologicalDays: chrono.days,
    correctedMonths: corrected.months,
    correctedDays: corrected.days,
    chronologicalTotalDays: Math.floor((today.getTime() - dob.getTime()) / (1000 * 60 * 60 * 24)),
    isPrematureCorrected: useCorrected,
    displayAge,
    assessmentAgeMonths
  };
};

/**
 * Utility to get current date in local ISO string format (YYYY-MM-DD)
 */
export const getLocalISODate = (date: Date = new Date()): string => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

/**
 * Rounds age to nearest clinical band (0, 1, 3, 6, 9, 12, 15, 18, 24, 30, 36, 48, 60)
 */
export const getNearestAssessmentBand = (months: number): number => {
  const bands = [0, 1, 3, 6, 9, 12, 15, 18, 24, 30, 36, 48, 60];
  return bands.reduce((prev, curr) => {
    return (Math.abs(curr - months) < Math.abs(prev - months) ? curr : prev);
  });
};
