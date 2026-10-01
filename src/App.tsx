import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ChildProvider, useChild } from './context/ChildContext';
import { LandingScreen } from './screens/LandingScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { BottomNav } from './components/navigation/BottomNav';
import { GlobalHeader } from './components/navigation/GlobalHeader';
import { ErrorBoundary } from './components/atoms/ErrorBoundary';
import { Loading } from './components/atoms/Loading/Loading';
import { ToastProvider } from './context/ToastContext';
import './App.css';

const QuizScreen = lazy(() => import('./screens/QuizScreen').then(m => ({ default: m.QuizScreen })));
const TimelineScreen = lazy(() => import('./screens/TimelineScreen').then(m => ({ default: m.TimelineScreen })));
const GrowthScreen = lazy(() => import('./screens/GrowthScreen').then(m => ({ default: m.GrowthScreen })));
const VaccinationScreen = lazy(() => import('./screens/VaccinationScreen').then(m => ({ default: m.VaccinationScreen })));
const ProfileScreen = lazy(() => import('./screens/ProfileScreen').then(m => ({ default: m.ProfileScreen })));
const PrivacyScreen = lazy(() => import('./screens/PrivacyScreen').then(m => ({ default: m.PrivacyScreen })));
const TermsScreen = lazy(() => import('./screens/TermsScreen').then(m => ({ default: m.TermsScreen })));

const AppRoutes = () => {
  const { activeChild, loading } = useChild();

  if (loading) {
    return <Loading fullScreen message="Loading Grow Baby Grow..." />;
  }

  return (
    <div className="app-layout">
      {activeChild && <GlobalHeader />}
      <Suspense fallback={<Loading message="Loading..." />}>
        <Routes>
          <Route 
            path="/" 
            element={activeChild ? <DashboardScreen /> : <LandingScreen />} 
          />
          <Route path="/onboarding" element={<OnboardingScreen />} />
          <Route path="/quiz" element={<QuizScreen />} />
          <Route path="/timeline" element={<TimelineScreen />} />
          <Route path="/growth" element={<GrowthScreen />} />
          <Route path="/vaccination" element={<VaccinationScreen />} />
          <Route path="/profile" element={<ProfileScreen />} />
          <Route path="/privacy" element={<PrivacyScreen />} />
          <Route path="/terms" element={<TermsScreen />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Suspense>
      
      {activeChild && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ToastProvider>
        <ChildProvider>
          <Router>
            <AppRoutes />
          </Router>
        </ChildProvider>
      </ToastProvider>
    </ErrorBoundary>
  );
}

export default App;
