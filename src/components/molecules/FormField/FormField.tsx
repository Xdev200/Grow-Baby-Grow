import type { ReactNode } from 'react';
import styles from './FormField.module.css';

export interface FormFieldProps {
  label: string;
  htmlFor?: string;
  helperText?: string;
  error?: string;
  required?: boolean;
  children: ReactNode;
  className?: string;
}

export const FormField = ({
  label,
  htmlFor,
  helperText,
  error,
  required = false,
  children,
  className = '',
}: FormFieldProps) => {
  return (
    <div className={`${styles.fieldGroup} ${className}`}>
      <label htmlFor={htmlFor} className={styles.label}>
        {label}
        {required && <span className={styles.requiredStar}>*</span>}
      </label>
      {children}
      {error ? (
        <p className={styles.errorMessage} role="alert">
          ⚠ {error}
        </p>
      ) : helperText ? (
        <p className={styles.helperText}>{helperText}</p>
      ) : null}
    </div>
  );
};
