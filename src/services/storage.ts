import { openDB, type IDBPDatabase } from 'idb';
import type { Child, MilestoneLog, GrowthMeasurement, QuizSession, VaccineLog } from '../types';

const DB_NAME = 'GrowBabyGrowDB';
const DB_VERSION = 1;

export class StorageService {
  private dbPromise: Promise<IDBPDatabase>;

  constructor() {
    this.dbPromise = openDB(DB_NAME, DB_VERSION, {
      upgrade(db) {
        // Child profiles
        if (!db.objectStoreNames.contains('children')) {
          db.createObjectStore('children', { keyPath: 'id' });
        }
        // Milestone achievement logs
        if (!db.objectStoreNames.contains('milestone_logs')) {
          const store = db.createObjectStore('milestone_logs', { keyPath: 'id' });
          store.createIndex('by-child', 'childId');
        }
        // Growth measurements
        if (!db.objectStoreNames.contains('growth_measurements')) {
          const store = db.createObjectStore('growth_measurements', { keyPath: 'id' });
          store.createIndex('by-child', 'childId');
        }
        // Quiz sessions
        if (!db.objectStoreNames.contains('quiz_sessions')) {
          const store = db.createObjectStore('quiz_sessions', { keyPath: 'id' });
          store.createIndex('by-child', 'childId');
        }
        // Vaccination logs
        if (!db.objectStoreNames.contains('vaccine_logs')) {
          const store = db.createObjectStore('vaccine_logs', { keyPath: 'id' });
          store.createIndex('by-child', 'childId');
        }
      },
    });
  }

  // Children Operations
  async saveChild(child: Child): Promise<void> {
    const db = await this.dbPromise;
    await db.put('children', child);
  }

  async getChild(id: string): Promise<Child | undefined> {
    const db = await this.dbPromise;
    return db.get('children', id);
  }

  async getChildren(): Promise<Child[]> {
    const db = await this.dbPromise;
    return db.getAll('children');
  }

  async getAllChildren(): Promise<Child[]> {
    const db = await this.dbPromise;
    return db.getAll('children');
  }

  async deleteChild(id: string): Promise<void> {
    const db = await this.dbPromise;
    const tx = db.transaction(['children', 'milestone_logs', 'growth_measurements', 'quiz_sessions', 'vaccine_logs'], 'readwrite');
    
    // Delete child
    await tx.objectStore('children').delete(id);
    
    // Cleanup related data
    const cleanupStore = async (name: string) => {
      const store = tx.objectStore(name as any);
      const index = store.index('by-child');
      let cursor = await index.openKeyCursor(IDBKeyRange.only(id));
      while (cursor) {
        await store.delete(cursor.primaryKey);
        cursor = await cursor.continue();
      }
    };

    await cleanupStore('milestone_logs');
    await cleanupStore('growth_measurements');
    await cleanupStore('quiz_sessions');
    await cleanupStore('vaccine_logs');
    
    await tx.done;
  }

  // Milestone Log Operations
  async saveMilestoneLog(log: MilestoneLog): Promise<void> {
    const db = await this.dbPromise;
    await db.put('milestone_logs', log);
  }

  async getMilestoneLogs(childId: string): Promise<MilestoneLog[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('milestone_logs', 'by-child', childId);
  }

  // Growth Measurement Operations
  async saveGrowthMeasurement(measurement: GrowthMeasurement): Promise<void> {
    const db = await this.dbPromise;
    await db.put('growth_measurements', measurement);
  }

  async getGrowthMeasurements(childId: string): Promise<GrowthMeasurement[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('growth_measurements', 'by-child', childId);
  }

  // Quiz Session Operations
  async saveQuizSession(session: QuizSession): Promise<void> {
    const db = await this.dbPromise;
    await db.put('quiz_sessions', session);
  }

  async getQuizSessions(childId: string): Promise<QuizSession[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('quiz_sessions', 'by-child', childId);
  }

  async getLatestQuizSession(childId: string): Promise<QuizSession | undefined> {
    const sessions = await this.getQuizSessions(childId);
    return sessions.sort((a, b) => 
      new Date(b.startedAt).getTime() - new Date(a.startedAt).getTime()
    )[0];
  }

  // Vaccination Log Operations
  async saveVaccineLog(log: VaccineLog): Promise<void> {
    const db = await this.dbPromise;
    await db.put('vaccine_logs', log);
  }

  async getVaccineLogs(childId: string): Promise<VaccineLog[]> {
    const db = await this.dbPromise;
    return db.getAllFromIndex('vaccine_logs', 'by-child', childId);
  }
}

export const storageService = new StorageService();
