import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { ChildProvider, useChild } from './context/ChildContext';
import { LandingScreen } from './screens/LandingScreen';
import { OnboardingScreen } from './screens/OnboardingScreen';
import { DashboardScreen } from './screens/DashboardScreen';
import { QuizScreen } from './screens/QuizScreen';
import { TimelineScreen } from './screens/TimelineScreen';
import { GrowthScreen } from './screens/GrowthScreen';
import { ProfileScreen } from './screens/ProfileScreen';
import { PrivacyScreen } from './screens/PrivacyScreen';
import { TermsScreen } from './screens/TermsScreen';
import { BottomNav } from './components/navigation/BottomNav';
import './App.css';

const AppRoutes = () => {
  const { activeChild, loading } = useChild();

  if (loading) {
    return (
      <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <p>Loading Grow Baby Grow...</p>
      </div>
    );
  }

  return (
    <div className="app-layout">
      <Routes>
        <Route 
          path="/" 
          element={activeChild ? <DashboardScreen /> : <LandingScreen />} 
        />
        <Route path="/onboarding" element={<OnboardingScreen />} />
        <Route path="/quiz" element={<QuizScreen />} />
        <Route path="/timeline" element={<TimelineScreen />} />
        <Route path="/growth" element={<GrowthScreen />} />
        <Route path="/profile" element={<ProfileScreen />} />
        <Route path="/privacy" element={<PrivacyScreen />} />
        <Route path="/terms" element={<TermsScreen />} />
      </Routes>
      
      {activeChild && <BottomNav />}
    </div>
  );
};

function App() {
  return (
    <ChildProvider>
      <Router>
        <AppRoutes />
      </Router>
    </ChildProvider>
  );
}

export default App;
