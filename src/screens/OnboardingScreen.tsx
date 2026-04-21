import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useChild } from '../context/ChildContext';
import { ProfileForm } from '../components/onboarding/ProfileForm';
import type { Child } from '../types';

export const OnboardingScreen: React.FC = () => {
  const { setChild } = useChild();
  const navigate = useNavigate();

  const handleProfileSubmit = async (child: Child) => {
    await setChild(child);
    navigate('/');
  };

  return (
    <div style={{ backgroundColor: 'white', minHeight: '100vh' }}>
      <ProfileForm onSubmit={handleProfileSubmit} />
    </div>
  );
};
