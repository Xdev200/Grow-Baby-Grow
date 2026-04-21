import { describe, it, expect } from 'vitest';
import { calculateAge } from '../age';

describe('calculateAge', () => {
  it('calculates age correctly for a full term baby (1 month)', () => {
    const dob = new Date('2024-01-01');
    const today = new Date('2024-02-01');
    const result = calculateAge(dob, 40, today);
    
    expect(result.chronologicalMonths).toBe(1);
    expect(result.assessmentAgeMonths).toBe(1);
    expect(result.isPrematureCorrected).toBe(false);
  });

  it('calculates corrected age for a premature baby (born at 32 weeks, 4 months chrono)', () => {
    // Born 8 weeks early (2 months early)
    const dob = new Date('2024-01-01');
    const today = new Date('2024-05-01'); // 4 months chrono
    const result = calculateAge(dob, 32, today);
    
    // 4 months chrono - 2 months premature = 2 months corrected
    expect(result.chronologicalMonths).toBe(4);
    expect(result.correctedMonths).toBe(2);
    expect(result.assessmentAgeMonths).toBe(2);
    expect(result.isPrematureCorrected).toBe(true);
  });

  it('stops correcting age after 24 months chrono', () => {
    const dob = new Date('2022-01-01');
    const today = new Date('2024-02-01'); // 25 months chrono
    const result = calculateAge(dob, 32, today);
    
    expect(result.chronologicalMonths).toBe(25);
    expect(result.isPrematureCorrected).toBe(false);
    expect(result.assessmentAgeMonths).toBe(25);
  });

  it('handles "zero" age correctly', () => {
    const dob = new Date('2024-01-01');
    const today = new Date('2024-01-01');
    const result = calculateAge(dob, 40, today);
    
    expect(result.assessmentAgeMonths).toBe(0);
    expect(result.displayAge).toContain('0 days');
  });

  it('guards against future DOB by returning zero', () => {
    const dob = new Date('2024-02-01');
    const today = new Date('2024-01-01');
    const result = calculateAge(dob, 40, today);
    
    expect(result.assessmentAgeMonths).toBe(0);
  });
});
