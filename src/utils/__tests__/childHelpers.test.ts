import { describe, it, expect } from 'vitest';
import { getChildEmoji, formatDomainName, formatDomainNameUpper } from '../childHelpers';

describe('childHelpers', () => {
  describe('getChildEmoji', () => {
    it('returns 👦 for male gender', () => {
      expect(getChildEmoji('male')).toBe('👦');
      expect(getChildEmoji('MALE')).toBe('👦');
      expect(getChildEmoji('boy')).toBe('👦');
    });

    it('returns 👧 for female gender', () => {
      expect(getChildEmoji('female')).toBe('👧');
      expect(getChildEmoji('FEMALE')).toBe('👧');
      expect(getChildEmoji('girl')).toBe('👧');
    });

    it('returns 👶 for unknown or unspecified gender', () => {
      expect(getChildEmoji('other')).toBe('👶');
      expect(getChildEmoji('')).toBe('👶');
    });
  });

  describe('formatDomainName', () => {
    it('replaces underscores with spaces', () => {
      expect(formatDomainName('gross_motor')).toBe('gross motor');
      expect(formatDomainName('socio_adaptive')).toBe('socio adaptive');
      expect(formatDomainName('fine_motor')).toBe('fine motor');
    });

    it('returns non-underscored strings as is', () => {
      expect(formatDomainName('hearing')).toBe('hearing');
      expect(formatDomainName('vision')).toBe('vision');
    });
  });

  describe('formatDomainNameUpper', () => {
    it('replaces underscores and converts to uppercase', () => {
      expect(formatDomainNameUpper('gross_motor')).toBe('GROSS MOTOR');
      expect(formatDomainNameUpper('socio_adaptive')).toBe('SOCIO ADAPTIVE');
      expect(formatDomainNameUpper('hearing')).toBe('HEARING');
    });
  });
});
