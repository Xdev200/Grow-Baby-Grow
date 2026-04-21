import React from 'react';
import { useQuiz } from '../hooks/useQuiz';
import { QuestionCard } from '../components/quiz/QuestionCard';
import { AssessmentResult } from '../components/quiz/AssessmentResult';
import styles from '../components/quiz/Quiz.module.css';

export const QuizScreen: React.FC = () => {
  const { 
    currentMilestone, 
    currentIndex, 
    relevantMilestones, 
    progress, 
    handleAnswer, 
    skipQuiz,
    isComplete, 
    calculateResults,
    childAgeMonths
  } = useQuiz();

  if (isComplete) {
    const results = calculateResults();
    return <AssessmentResult {...results} />;
  }

  if (!currentMilestone) {
    return (
      <div className={styles.quizContainer}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h3>All set!</h3>
          <p>No assessment needed for your baby's current age bracket ({childAgeMonths}m).</p>
          <button className={styles.submitButton} onClick={() => window.location.href = '/'}>
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.quizContainer}>
      <header className={styles.quizHeader}>
        <div className={styles.quizMeta}>
          <span className={styles.questionCounter}>
            Question {currentIndex + 1} of {relevantMilestones.length}
          </span>
          <span className={styles.targetAgeLabel}>
            Age {childAgeMonths}m Reference
          </span>
        </div>
        <button className={styles.skipButton} onClick={skipQuiz}>
          Skip
        </button>
      </header>

      <div className={styles.progressContainer}>
        <div 
          className={styles.progressBar} 
          style={{ width: `${progress}%` }}
        />
      </div>

      <div className={styles.domainHeader}>
        <span className={styles.domainIcon}>
          {currentMilestone.domain === 'gross_motor' && '🏃'}
          {currentMilestone.domain === 'fine_motor' && '🖐️'}
          {currentMilestone.domain === 'language' && '🗣️'}
          {currentMilestone.domain === 'socio_adaptive' && '🤝'}
          {currentMilestone.domain === 'hearing_vision' && '👁️'}
        </span>
        <h2>{currentMilestone.domain.replace('_', ' ').toUpperCase()}</h2>
      </div>

      <QuestionCard 
        key={currentMilestone.id}
        milestone={currentMilestone} 
        onAnswer={handleAnswer} 
        childAgeMonths={childAgeMonths}
      />
    </div>
  );
};
