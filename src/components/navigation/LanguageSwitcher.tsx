import React from 'react';
import { useTranslation } from 'react-i18next';
import styles from './LanguageSwitcher.module.css';

export const LanguageSwitcher: React.FC = () => {
  const { i18n } = useTranslation();

  const languages = [
    { code: 'en', label: 'English', sub: 'Default' },
    { code: 'hi', label: 'हिंदी', sub: 'Hindi' },
    { code: 'bn', label: 'বাংলা', sub: 'Bengali' }
  ];

  return (
    <div className={styles.container}>
      {languages.map((lang) => (
        <button
          key={lang.code}
          className={`${styles.langBtn} ${i18n.language === lang.code ? styles.active : ''}`}
          onClick={() => i18n.changeLanguage(lang.code)}
        >
          <span className={styles.label}>{lang.label}</span>
          <span className={styles.subLabel}>{lang.sub}</span>
        </button>
      ))}
    </div>
  );
};
