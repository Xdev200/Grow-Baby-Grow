/**
 * Shared child-related helper utilities.
 * Extracted to eliminate duplication across DashboardScreen, GlobalHeader, ProfileScreen, etc.
 */

/**
 * Returns a gender-appropriate emoji for a child.
 * Previously duplicated in 3 files.
 */
export const getChildEmoji = (gender: string): string => {
  const g = (gender || '').toLowerCase();
  if (g === 'girl' || g === 'female') return '👧';
  if (g === 'boy' || g === 'male') return '👦';
  return '👶';
};

/**
 * Formats a domain key (e.g. 'gross_motor') into a display name (e.g. 'gross motor').
 * Uses regex /_/g to replace ALL underscores, not just the first.
 * Previously duplicated as inline `.replace('_', ' ')` in 6+ files.
 */
export const formatDomainName = (domain: string): string => {
  return domain.replace(/_/g, ' ');
};

/**
 * Formats a domain key into an uppercase display name (e.g. 'GROSS MOTOR').
 * Convenience wrapper for the common `.replace('_', ' ').toUpperCase()` pattern.
 */
export const formatDomainNameUpper = (domain: string): string => {
  return formatDomainName(domain).toUpperCase();
};
