import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './components/AuthProvider';
import { ProtectedRoute } from './components/ProtectedRoute';
import { Layout } from './components/Layout';
import { Login } from './pages/Login';
import { Dashboard } from './pages/Dashboard';
import { Divisions } from './pages/Divisions';
import { StrategicObjectives } from './pages/StrategicObjectives';
import { KPIs } from './pages/KPIs';
import { Initiatives } from './pages/Initiatives';
import { StrategyMapPage } from './pages/StrategyMapPage';
import { UserManagement } from './pages/UserManagement';
import { UserProfile } from './pages/UserProfile';
import { DataManagement } from './pages/DataManagement';
import { KPIDataManagement } from './pages/KPIDataManagement';
import { QuarterlyReview } from './pages/QuarterlyReview';
import { Reports } from './pages/Reports';
import { Unauthorized } from './pages/Unauthorized';
import { AuthCallback } from './pages/AuthCallback';
import { ResetPassword } from './pages/ResetPassword';
import { Test } from './pages/Test';
import { isSupabaseConfigured } from './lib/supabase';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
    },
  },
});

function App() {
  // If Supabase is not configured, show test page
  if (!isSupabaseConfigured) {
    return (
      <QueryClientProvider client={queryClient}>
        <Router>
          <Routes>
            <Route path="*" element={<Test />} />
          </Routes>
        </Router>
      </QueryClientProvider>
    );
  }

  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <Routes>
            <Route path="/test" element={<Test />} />
            <Route path="/login" element={<Login />} />
            <Route path="/auth/callback" element={<AuthCallback />} />
            <Route path="/reset-password" element={<ResetPassword />} />
            <Route path="/unauthorized" element={<Unauthorized />} />
            <Route
              path="/"
              element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }
            >
              <Route index element={<Navigate to="/dashboard" replace />} />
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="objectives" element={<StrategicObjectives />} />
              <Route path="kpis" element={<KPIs />} />
              <Route path="kpi-data" element={<KPIDataManagement />} />
              <Route path="initiatives" element={<Initiatives />} />
              <Route path="quarterly-review" element={<QuarterlyReview />} />
              <Route path="strategy-map" element={<StrategyMapPage />} />
              <Route path="reports" element={<Reports />} />
              <Route path="divisions" element={
                <ProtectedRoute requiredRole={['Admin']}>
                  <Divisions />
                </ProtectedRoute>
              } />
              <Route path="users" element={
                <ProtectedRoute requiredRole={['Admin']}>
                  <UserManagement />
                </ProtectedRoute>
              } />
              <Route path="data-management" element={
                <ProtectedRoute requiredRole={['Admin']}>
                  <DataManagement />
                </ProtectedRoute>
              } />
              <Route path="profile" element={<UserProfile />} />
              <Route path="settings" element={<div>Settings (Coming Soon)</div>} />
            </Route>
          </Routes>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;