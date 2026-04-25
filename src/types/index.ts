export type Domain = 'gross_motor' | 'fine_motor' | 'language' | 'socio_adaptive' | 'hearing_vision';

export type MilestoneStatus = 'achieved' | 'not_yet' | 'partial' | 'deferred';

export type MilestoneMaster = {
  id: string;
  ageMonths: number;
  ageBandStart: number;
  ageBandEnd: number;
  domain: Domain;
  milestone: string;
  laymanDescription?: string;
  howToTest?: string;
  isRedFlag: boolean;
  redFlagThresholdMonths?: number;
  redFlagMessage?: string;
  suggestion?: string;
};

export type Child = {
  id: string;
  name: string;
  dob: string; // ISO string
  gender: 'boy' | 'girl' | 'other';
  birthWeightKg?: number;
  birthHeightCm?: number;
  currentWeightKg?: number; // Added for initial capture
  currentHeightCm?: number; // Added for initial capture
  isPremature: boolean;
  gestationalWeeks?: number;
  photoBase64?: string;
  createdAt: string;
};


export type MilestoneLog = {
  id: string;
  childId: string;
  milestoneId: string;
  status: MilestoneStatus;
  achievedDate?: string;
  notes?: string;
  photoBase64?: string;
  loggedAt: string;
};

export type GrowthMeasurement = {
  id: string;
  childId: string;
  measuredDate: string;
  weightKg?: number;
  heightCm?: number;
  headCircCm?: number;
  notes?: string;
  loggedAt: string;
};

export type QuizSession = {
  id: string;
  childId: string;
  startedAt: string;
  completedAt?: string;
  answers: {
    milestoneId: string;
    answer: MilestoneStatus;
    answeredAt: string;
  }[];
  isComplete: boolean;
};

export type VaccineMaster = {
  id: string;
  name: string;
  ageWeeks?: number;
  ageMonths?: number;
  ageLabel: string;
  description: string;
  dose: string;
  route: string;
  site: string;
  isOptional: boolean;
};

export type VaccineStatus = 'upcoming' | 'completed' | 'overdue' | 'skipped';

export type VaccineLog = {
  id: string;
  childId: string;
  vaccineId: string;
  status: VaccineStatus;
  dueDate: string;
  administeredDate?: string;
  notes?: string;
  loggedAt: string;
};

// Value export to ensure module has runtime presence if needed
export const APP_SCHEMA_VERSION = '1.0.0';
