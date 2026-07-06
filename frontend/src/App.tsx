import { lazy, Suspense } from 'react';
import { Navigate, Route, Routes } from 'react-router-dom';
import { useAuth } from './contexts/AuthContext';

const AuthenticatedApp = lazy(() => import('./components/layout/AuthenticatedApp').then((module) => ({ default: module.AuthenticatedApp })));
const DashboardPage = lazy(() => import('./pages/DashboardPage').then((module) => ({ default: module.DashboardPage })));
const LandingRoute = lazy(() => import('./pages/LandingRoute').then((module) => ({ default: module.LandingRoute })));
const LoginPage = lazy(() => import('./pages/LoginPage').then((module) => ({ default: module.LoginPage })));
const RegisterRoute = lazy(() => import('./pages/RegisterRoute').then((module) => ({ default: module.RegisterRoute })));
const TransactionsPage = lazy(() => import('./pages/TransactionsPage').then((module) => ({ default: module.TransactionsPage })));
const CategoriesPage = lazy(() => import('./pages/CategoriesPage').then((module) => ({ default: module.CategoriesPage })));
const GoalsPage = lazy(() => import('./pages/GoalsPage').then((module) => ({ default: module.GoalsPage })));
const ReportsPage = lazy(() => import('./pages/ReportsPage').then((module) => ({ default: module.ReportsPage })));
const ProfilePage = lazy(() => import('./pages/ProfilePage').then((module) => ({ default: module.ProfilePage })));
const RecurringPage = lazy(() => import('./pages/RecurringPage').then((module) => ({ default: module.RecurringPage })));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage').then((module) => ({ default: module.NotFoundPage })));

function AppLoading() {
  return <div aria-label="Carregando" className="route-loading" role="status" />;
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();

  if (!token || !user) {
    return <Navigate replace to="/login" />;
  }

  return <>{children}</>;
}

function PublicOnlyRoute({ children }: { children: React.ReactNode }) {
  const { token, user } = useAuth();

  if (token && user) {
    return <Navigate replace to="/app/dashboard" />;
  }

  return <>{children}</>;
}

export default function App() {
  return (
    <Suspense fallback={<AppLoading />}>
      <Routes>
        <Route path="/" element={<LandingRoute />} />
        <Route
          path="/login"
          element={
            <PublicOnlyRoute>
              <LoginPage />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/cadastro"
          element={
            <PublicOnlyRoute>
              <RegisterRoute />
            </PublicOnlyRoute>
          }
        />
        <Route
          path="/app"
          element={
            <ProtectedRoute>
              <AuthenticatedApp />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="transacoes" element={<TransactionsPage />} />
          <Route path="categorias" element={<CategoriesPage />} />
          <Route path="metas" element={<GoalsPage />} />
          <Route path="recorrencias" element={<RecurringPage />} />
          <Route path="relatorios" element={<ReportsPage />} />
          <Route path="perfil" element={<ProfilePage />} />
          <Route index element={<Navigate replace to="/app/dashboard" />} />
        </Route>
        <Route path="*" element={<NotFoundPage />} />
      </Routes>
    </Suspense>
  );
}
