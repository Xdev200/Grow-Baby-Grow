import styles from './Loading.module.css';

export interface LoadingProps {
  message?: string;
  fullScreen?: boolean;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const Loading = ({
  message,
  fullScreen = false,
  size = 'md',
  className = '',
}: LoadingProps) => {
  return (
    <div
      className={`${styles.container} ${fullScreen ? styles.fullScreen : ''} ${className}`}
      role="status"
      aria-live="polite"
    >
      <div className={`${styles.spinner} ${styles[size]}`} />
      {message && <p className={styles.message}>{message}</p>}
    </div>
  );
};
