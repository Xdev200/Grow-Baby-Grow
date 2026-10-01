/**
 * PreferencesService
 * Centralized, typed wrapper for all application localStorage operations.
 * Prevents key collision, string typos, and raw localStorage calls scattered across screens.
 */

export class PreferencesService {
  private static KEYS = {
    ACTIVE_CHILD_ID: 'activeChildId',
    VAX_VISITED: (childId: string) => `vax_visited_${childId}`,
    VAX_REMINDERS: (childId: string) => `vax_reminders_${childId}`,
    FIRST_ASSESSMENT_COMPLETED: (childId: string) => `first_assessment_completed_at_${childId}`,
    LAST_ASSESSMENT_COMPLETED: (childId: string) => `last_assessment_completed_at_${childId}`,
  };

  // Active Child ID
  getActiveChildId(): string | null {
    return localStorage.getItem(PreferencesService.KEYS.ACTIVE_CHILD_ID);
  }

  setActiveChildId(id: string): void {
    localStorage.setItem(PreferencesService.KEYS.ACTIVE_CHILD_ID, id);
  }

  removeActiveChildId(): void {
    localStorage.removeItem(PreferencesService.KEYS.ACTIVE_CHILD_ID);
  }

  // Vaccine Screen Visited Flag
  getVaccineVisited(childId: string): boolean {
    return localStorage.getItem(PreferencesService.KEYS.VAX_VISITED(childId)) === 'true';
  }

  setVaccineVisited(childId: string, visited: boolean = true): void {
    localStorage.setItem(PreferencesService.KEYS.VAX_VISITED(childId), String(visited));
  }

  // Vaccine Reminders Enabled Flag
  getVaccineReminders(childId: string): boolean {
    return localStorage.getItem(PreferencesService.KEYS.VAX_REMINDERS(childId)) === 'true';
  }

  setVaccineReminders(childId: string, enabled: boolean): void {
    localStorage.setItem(PreferencesService.KEYS.VAX_REMINDERS(childId), String(enabled));
  }

  // First Assessment Completion Timestamp
  getFirstAssessmentCompletedAt(childId: string): string | null {
    return localStorage.getItem(PreferencesService.KEYS.FIRST_ASSESSMENT_COMPLETED(childId));
  }

  setFirstAssessmentCompletedAt(childId: string, timestampIso?: string): void {
    const val = timestampIso || new Date().toISOString();
    localStorage.setItem(PreferencesService.KEYS.FIRST_ASSESSMENT_COMPLETED(childId), val);
  }

  // Last Assessment Completion Timestamp
  getLastAssessmentCompletedAt(childId: string): string | null {
    return localStorage.getItem(PreferencesService.KEYS.LAST_ASSESSMENT_COMPLETED(childId)) || this.getFirstAssessmentCompletedAt(childId);
  }

  setLastAssessmentCompletedAt(childId: string, timestampIso?: string): void {
    const val = timestampIso || new Date().toISOString();
    localStorage.setItem(PreferencesService.KEYS.LAST_ASSESSMENT_COMPLETED(childId), val);
    if (!this.getFirstAssessmentCompletedAt(childId)) {
      this.setFirstAssessmentCompletedAt(childId, val);
    }
  }
}

export const preferencesService = new PreferencesService();
