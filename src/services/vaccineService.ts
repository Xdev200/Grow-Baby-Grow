import { storageService } from './storage';
import type { VaccineMaster, VaccineLog, Child } from '../types';
import vaccinationData from '../data/vaccinations.json';
import { addWeeks, addMonths, parseISO } from 'date-fns';

export class VaccineService {
  private masterData: VaccineMaster[] = vaccinationData as VaccineMaster[];

  async getVaccineSchedule(child: Child): Promise<(VaccineMaster & { log?: VaccineLog; dueDate: Date })[]> {
    const logs = await storageService.getVaccineLogs(child.id);
    const dob = parseISO(child.dob);

    const schedule = this.masterData.map(vaccine => {
      let dueDate: Date;
      if (vaccine.ageWeeks !== undefined) {
        dueDate = addWeeks(dob, vaccine.ageWeeks);
      } else if (vaccine.ageMonths !== undefined) {
        dueDate = addMonths(dob, vaccine.ageMonths);
      } else {
        dueDate = dob; // Default to birth
      }

      const log = logs.find(l => l.vaccineId === vaccine.id);
      
      return {
        ...vaccine,
        log,
        dueDate
      };
    });

    return schedule;
  }

  async markAsCompleted(childId: string, vaccineId: string, administeredDate: Date, notes?: string): Promise<void> {
    const existingLogs = await storageService.getVaccineLogs(childId);
    const existingLog = existingLogs.find(l => l.vaccineId === vaccineId);

    const log: VaccineLog = {
      id: existingLog?.id || crypto.randomUUID(),
      childId,
      vaccineId,
      status: 'completed',
      dueDate: existingLog?.dueDate || new Date().toISOString(), // Should be calculated if not exists
      administeredDate: administeredDate.toISOString(),
      notes,
      loggedAt: new Date().toISOString()
    };

    await storageService.saveVaccineLog(log);
  }

  async setReminder(childId: string, vaccineId: string, dueDate: Date): Promise<void> {
    const existingLogs = await storageService.getVaccineLogs(childId);
    const existingLog = existingLogs.find(l => l.vaccineId === vaccineId);

    const log: VaccineLog = {
      id: existingLog?.id || crypto.randomUUID(),
      childId,
      vaccineId,
      status: 'upcoming',
      dueDate: dueDate.toISOString(),
      loggedAt: new Date().toISOString()
    };

    await storageService.saveVaccineLog(log);
  }
}

export const vaccineService = new VaccineService();
