import { Toaster } from "@/components/ui/toaster"
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClientInstance } from '@/lib/query-client'
import { BrowserRouter as Router, Route, Routes, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/lib/AuthContext';
import UserNotRegisteredError from '@/components/UserNotRegisteredError';
import ProtectedRoute from '@/components/ProtectedRoute';
import Layout from './components/Layout';
import { BrandMark } from '@/components/BrandLogo';

// Auth pages
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import ResetPassword from './pages/ResetPassword';

// Public pages
import LandingPage from './pages/LandingPage';
import Privacy from './pages/Privacy';
import Terms from './pages/Terms';

// Onboarding
import Welcome from './pages/Welcome';
import Onboarding from './pages/Onboarding';

// App pages
import Dashboard from './pages/Dashboard';
import Projects from './pages/Projects';
import ProjectForm from './pages/ProjectForm';
import ProjectDashboard from './pages/ProjectDashboard';
import ProjectClientView from './pages/ProjectClientView';
import Measurements from './pages/Measurements';
import MeasurementForm from './pages/MeasurementForm';
import Documents from './pages/Documents';
import Alerts from './pages/Alerts';
import CashFlow from './pages/CashFlow';
import Supplies from './pages/Supplies';
import Reports from './pages/Reports';
import Subcontractors from './pages/Subcontractors';
import SubcontractorForm from './pages/SubcontractorForm';
import SubcontractorDetail from './pages/SubcontractorDetail';
import Hiring from './pages/Hiring';
import HiringDetail from './pages/HiringDetail';
import Plans from './pages/Plans';
import PublicSupport from './pages/PublicSupport';
import ClientPortalView from './pages/ClientPortalView';
import AIAudit from './pages/AIAudit';
import RiskPredictor from './pages/RiskPredictor';
import AIAssistant from './pages/AIAssistant';
import Ranking from './pages/Ranking';
import AuditLogs from './pages/AuditLogs';
import Benchmark from './pages/Benchmark';
import AntiFraud from './pages/AntiFraud';
import ContractAnalysis from './pages/ContractAnalysis';
import Guarantees from './pages/Guarantees';
import Recommendations from './pages/Recommendations';
import AutoPilot from './pages/AutoPilot';
import AdminPanel from './pages/AdminPanel';
import Settings from './pages/Settings';
import Support from './pages/Support';

import PageNotFound from './lib/PageNotFound';

const AuthenticatedApp = () => {
  const { isLoadingAuth, isLoadingPublicSettings, authError } = useAuth();

  if (isLoadingPublicSettings || isLoadingAuth) {
    return (
      <div className="fixed inset-0 flex flex-col items-center justify-center gap-3" style={{ background: "#fbfaf8" }}>
        <BrandMark className="h-14 w-14 rounded-2xl" />
        <div className="w-6 h-6 border-[3px] border-[#efefef] border-t-[#004038] rounded-full animate-spin" />
        <p className="text-sm font-semibold" style={{ color: "#6f7073" }}>Carregando suas obras...</p>
      </div>
    );
  }

  if (authError?.type === 'user_not_registered') {
    return <UserNotRegisteredError />;
  }

  // auth_required é tratado pelas rotas protegidas via ProtectedRoute — não bloqueia aqui

  return (
    <Routes>
      {/* Páginas públicas */}
      <Route path="/" element={<LandingPage />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/signup" element={<Navigate to="/register" replace />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />
      <Route path="/reset-password" element={<ResetPassword />} />
      <Route path="/privacy" element={<Privacy />} />
      <Route path="/terms" element={<Terms />} />
      <Route path="/plans" element={<Plans />} />
      <Route path="/support" element={<PublicSupport />} />
      <Route path="/portal/:token" element={<ClientPortalView />} />
      <Route path="/welcome" element={<Welcome />} />

      {/* Onboarding (requer auth) */}
      <Route element={<ProtectedRoute />}>
        <Route path="/onboarding" element={<Onboarding />} />
      </Route>

      {/* Páginas privadas com layout */}
      <Route element={<ProtectedRoute />}>
        <Route element={<Layout />}>
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/admin" element={<AdminPanel />} />
          <Route path="/settings" element={<Settings />} />
          <Route path="/subcontractors" element={<Subcontractors />} />
          <Route path="/subcontractors/new" element={<SubcontractorForm />} />
          <Route path="/subcontractors/:id" element={<SubcontractorDetail />} />
          <Route path="/subcontractors/:id/edit" element={<SubcontractorForm />} />
          <Route path="/projects" element={<Projects />} />
          <Route path="/projects/new" element={<ProjectForm />} />
          <Route path="/projects/:id" element={<ProjectForm />} />
          <Route path="/projects/:id/central" element={<ProjectDashboard />} />
          <Route path="/projects/:id/cliente" element={<ProjectClientView />} />
          <Route path="/measurements" element={<Measurements />} />
          <Route path="/measurements/new" element={<MeasurementForm />} />
          <Route path="/measurements/:id" element={<MeasurementForm />} />
          <Route path="/documents" element={<Documents />} />
          <Route path="/alerts" element={<Alerts />} />
          <Route path="/cash-flow" element={<CashFlow />} />
          <Route path="/supplies" element={<Supplies />} />
          <Route path="/reports" element={<Reports />} />
          <Route path="/hiring" element={<Hiring />} />
          <Route path="/hiring/:id" element={<HiringDetail />} />
          <Route path="/ai-audit" element={<AIAudit />} />
          <Route path="/risk-predictor" element={<RiskPredictor />} />
          <Route path="/ai-assistant" element={<AIAssistant />} />
          <Route path="/ranking" element={<Ranking />} />
          <Route path="/audit-logs" element={<AuditLogs />} />
          <Route path="/benchmark" element={<Benchmark />} />
          <Route path="/anti-fraud" element={<AntiFraud />} />
          <Route path="/contract-analysis" element={<ContractAnalysis />} />
          <Route path="/guarantees" element={<Guarantees />} />
          <Route path="/recommendations" element={<Recommendations />} />
          <Route path="/autopilot" element={<AutoPilot />} />
        </Route>
      </Route>

      <Route path="*" element={<PageNotFound />} />
    </Routes>
  );
};

function App() {
  return (
    <AuthProvider>
      <QueryClientProvider client={queryClientInstance}>
        <Router>
          <AuthenticatedApp />
        </Router>
        <Toaster />
      </QueryClientProvider>
    </AuthProvider>
  );
}

export default App;
