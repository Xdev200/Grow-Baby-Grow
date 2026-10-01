/**
 * Centralized ID generation utility.
 * Uses crypto.randomUUID() when available, with a fallback for older mobile browsers.
 * Previously duplicated in useQuiz.ts (2×) and ProfileForm.tsx.
 */
export const generateId = (prefix: string = 'id'): string => {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
};
