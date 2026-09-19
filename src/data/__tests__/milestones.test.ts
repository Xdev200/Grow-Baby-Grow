import { describe, it, expect } from 'vitest';
import { PROCESSED_MILESTONES } from '../milestoneProcessor';
import type { Domain } from '../../types';

describe('Milestones Data & Domain Separation', () => {
  it('contains hearing and vision as independent domains', () => {
    const hearingMilestones = PROCESSED_MILESTONES.filter(m => m.domain === ('hearing' as Domain));
    const visionMilestones = PROCESSED_MILESTONES.filter(m => m.domain === ('vision' as Domain));
    
    expect(hearingMilestones.length).toBeGreaterThan(0);
    expect(visionMilestones.length).toBeGreaterThan(0);
  });

  it('contains zero milestones with the deprecated hearing_vision domain', () => {
    const deprecated = PROCESSED_MILESTONES.filter(m => (m.domain as string) === 'hearing_vision');
    expect(deprecated.length).toBe(0);
  });

  it('ensures all milestones belong to valid Domain set', () => {
    const validDomains = new Set<Domain>([
      'gross_motor',
      'fine_motor',
      'language',
      'socio_adaptive',
      'hearing',
      'vision'
    ]);

    PROCESSED_MILESTONES.forEach(m => {
      expect(validDomains.has(m.domain)).toBe(true);
    });
  });

  it('ensures hearing and vision milestones have distinct non-overlapping tasks', () => {
    const hearing3m = PROCESSED_MILESTONES.filter(m => m.domain === 'hearing' && m.ageMonths === 3);
    const vision3m = PROCESSED_MILESTONES.filter(m => m.domain === 'vision' && m.ageMonths === 3);

    expect(hearing3m.length).toBeGreaterThan(0);
    expect(vision3m.length).toBeGreaterThan(0);
    expect(hearing3m[0].id).not.toBe(vision3m[0].id);
  });

  it('ensures separate hearing and vision milestones exist at birth (0 months)', () => {
    const hearingBirth = PROCESSED_MILESTONES.filter(m => m.domain === 'hearing' && m.ageMonths === 0);
    const visionBirth = PROCESSED_MILESTONES.filter(m => m.domain === 'vision' && m.ageMonths === 0);

    expect(hearingBirth.length).toBeGreaterThan(0);
    expect(visionBirth.length).toBeGreaterThan(0);
  });
});

