import React, { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useQuiz } from '../hooks/useQuiz';
import { useChild } from '../context/ChildContext';
import { QuestionCard } from '../components/quiz/QuestionCard';
import styles from '../components/quiz/Quiz.module.css';

export const QuizScreen: React.FC = () => {
  const navigate = useNavigate();
  const { activeChild } = useChild();
  const { 
    currentMilestone, 
    currentIndex, 
    relevantMilestones, 
    progress, 
    currentAnswer,
    handleAnswer, 
    goToPrevious,
    skipQuiz,
    isComplete, 
    calculateResults,
    childAgeMonths
  } = useQuiz();

  useEffect(() => {
    if (isComplete && activeChild) {
      const results = calculateResults();
      const assessmentData = {
        ...results,
        date: new Date().toISOString(),
        childId: activeChild.id
      };
      sessionStorage.setItem(`recent_assessment_${activeChild.id}`, JSON.stringify(assessmentData));

      // Record first assessment completion timestamp if not already saved
      if (!localStorage.getItem(`first_assessment_completed_at_${activeChild.id}`)) {
        localStorage.setItem(`first_assessment_completed_at_${activeChild.id}`, Date.now().toString());
      }

      navigate('/', { replace: true, state: { showAssessmentToast: true, assessmentData } });
    }
  }, [isComplete, activeChild, calculateResults, navigate]);

  if (!currentMilestone) {
    return (
      <div className={styles.quizContainer}>
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          <h3>All set!</h3>
          <p>No assessment needed for your baby's current age bracket ({childAgeMonths}m).</p>
          <button className={styles.submitButton} onClick={() => navigate('/')}>
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
        <div className={styles.headerActions}>
          {currentIndex > 0 && (
            <button 
              className={styles.backButton} 
              onClick={goToPrevious}
              title="Previous Question"
              aria-label="Back to previous question"
            >
              ← Back
            </button>
          )}
          <button className={styles.skipButton} onClick={skipQuiz}>
            Skip
          </button>
        </div>
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
          {currentMilestone.domain === 'hearing' && '👂'}
          {currentMilestone.domain === 'vision' && '👁️'}
        </span>
        <h2>{currentMilestone.domain.replace('_', ' ').toUpperCase()}</h2>
      </div>

      <QuestionCard 
        key={currentMilestone.id}
        milestone={currentMilestone} 
        onAnswer={handleAnswer} 
        childAgeMonths={childAgeMonths}
        selectedAnswer={currentAnswer}
      />
    </div>
  );
};
