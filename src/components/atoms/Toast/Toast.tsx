import { CloseButton } from '../CloseButton/CloseButton';
import styles from './Toast.module.css';

export type ToastStatus = 'on_track' | 'watch' | 'lagging' | 'success' | 'warning' | 'danger' | 'info';

export interface ToastProps {
  status: ToastStatus;
  title: string;
  message: string;
  onClose: () => void;
}

const statusIcons: Record<ToastStatus, string> = {
  on_track: '🎉',
  success: '✓',
  watch: '💡',
  warning: '⚠️',
  lagging: '🚨',
  danger: '🛑',
  info: 'ℹ️',
};

export const Toast = ({ status, title, message, onClose }: ToastProps) => {
  return (
    <div className={styles.toastContainer}>
      <div className={`${styles.toast} ${styles[status]}`} role="alert">
        <span className={styles.icon}>{statusIcons[status]}</span>
        <div className={styles.content}>
          <h4 className={styles.title}>{title}</h4>
          <p className={styles.message}>{message}</p>
        </div>
        <CloseButton size="sm" onClick={onClose} ariaLabel="Dismiss notification" />
      </div>
    </div>
  );
};
