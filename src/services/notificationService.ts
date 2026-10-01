import { LocalNotifications } from '@capacitor/local-notifications';

export class NotificationService {
  async requestPermissions(): Promise<boolean> {
    try {
      const permission = await LocalNotifications.requestPermissions();
      return permission.display === 'granted';
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      return false;
    }
  }

  async scheduleVaccineReminder(
    notificationId: number,
    vaccineName: string,
    scheduledDate: Date,
    offsetDays: number,
    reminderTime: string // Format "HH:mm"
  ): Promise<void> {
    // Calculate the actual reminder date
    const reminderDate = new Date(scheduledDate);
    reminderDate.setDate(reminderDate.getDate() - offsetDays);
    
    const [hours, minutes] = reminderTime.split(':').map(Number);
    reminderDate.setHours(hours, minutes, 0, 0);

    // If the reminder date is in the past, we can't schedule it
    if (reminderDate <= new Date()) {
      console.warn('Reminder date is in the past, not scheduling.');
      return;
    }

    await LocalNotifications.schedule({
      notifications: [
        {
          title: 'Vaccination Reminder',
          body: `Upcoming vaccine: ${vaccineName} scheduled for tomorrow!`, // Or custom body
          id: notificationId,
          schedule: { at: reminderDate },
          sound: 'default',
          attachments: [],
          actionTypeId: '',
          extra: null
        }
      ]
    });
  }

  async cancelNotification(id: number): Promise<void> {
    await LocalNotifications.cancel({
      notifications: [{ id }]
    });
  }

  async cancelAll(): Promise<void> {
    const list = await LocalNotifications.getPending();
    if (list.notifications.length > 0) {
      await LocalNotifications.cancel(list);
    }
  }
}

/**
 * Generates a consistent 32-bit positive integer notification ID from a string ID (e.g., vaccineId).
 */
export const generateNotificationId = (id: string): number => {
  return Math.abs(id.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0));
};

export const notificationService = new NotificationService();

