import { createBrowserRouter, Navigate } from 'react-router-dom';
import LanguageRouter from './LanguageRouter';
import ProtectedRoute from './ProtectedRoute';
import ErrorBoundary from '../components/ErrorBoundary';
import RegistrationGuard from '../components/registration/RegistrationGuard';
import AppLayout from '../components/layout/AppLayout';
import HomePage from '../pages/HomePage';
import StorePage from '../pages/StorePage';
import WalletPage from '../pages/WalletPage';
import ActivityPage from '../pages/ActivityPage';
import ProfilePage from '../pages/ProfilePage';
import SearchPage from '../pages/SearchPage';
import AiChatPage from '../pages/AiChatPage';
import RegisterProfilePage from '../pages/RegisterProfilePage';
import RegisterMembershipPage from '../pages/RegisterMembershipPage';
import RegisterPreferencesPage from '../pages/RegisterPreferencesPage';
import SignupPage from '../pages/SignupPage';
import NearYouMapPage from '../pages/NearYouMapPage';
import InsightsPage from '../pages/InsightsPage';
import StoriesPage from '../pages/StoriesPage';
import PremiumRevealPage from '../pages/PremiumRevealPage';
import NotFoundPage from '../pages/NotFoundPage';
import WelcomeBackPage from '../pages/auth-flow/WelcomeBackPage';
import WelcomeNewPage from '../pages/auth-flow/WelcomeNewPage';
import HowDidYouArrivePage from '../pages/auth-flow/HowDidYouArrivePage';
import SelectOrgPage from '../pages/auth-flow/SelectOrgPage';
import WelcomeOrgPage from '../pages/auth-flow/WelcomeOrgPage';
import FlowTestPage from '../pages/auth-flow/FlowTestPage';

export const router = createBrowserRouter([
  {
    path: '/',
    element: <Navigate to="/he" replace />,
  },
  {
    path: '/:lang',
    element: <LanguageRouter />,
    errorElement: <ErrorBoundary />,
    children: [
      {
        element: <AppLayout />,
        children: [
          // === PUBLIC routes ===
          { index: true, element: <HomePage /> },
          { path: 'store', element: <StorePage /> },

          // === PROTECTED routes ===
          {
            element: <ProtectedRoute />,
            children: [
              { path: 'wallet', element: <WalletPage /> },
              { path: 'activity', element: <ActivityPage /> },
              { path: 'profile', element: <ProfilePage /> },
            ],
          },
        ],
      },
      // Outside AppLayout (own headers)
      { path: 'search', element: <SearchPage /> },
      { path: 'chat', element: <AiChatPage /> },
      { path: 'near-you-map', element: <NearYouMapPage /> },
      { path: 'insights', element: <InsightsPage /> },
      { path: 'stories', element: <StoriesPage /> },
      { path: 'premium-reveal', element: <PremiumRevealPage /> },
      { path: 'signup', element: <SignupPage /> },

      // Registration flow (outside AppLayout, full-page)
      {
        path: 'register',
        element: <RegistrationGuard />,
        children: [
          { path: 'complete-profile', element: <RegisterProfilePage /> },
          { path: 'membership', element: <RegisterMembershipPage /> },
          { path: 'preferences', element: <RegisterPreferencesPage /> },
        ],
      },

      // Auth Flow (outside AppLayout, full-page — like signup/register)
      {
        path: 'auth-flow',
        children: [
          { path: 'welcome-back', element: <WelcomeBackPage /> },
          { path: 'welcome-new', element: <WelcomeNewPage /> },
          { path: 'how-did-you-arrive', element: <HowDidYouArrivePage /> },
          { path: 'select-org', element: <SelectOrgPage /> },
          { path: 'welcome-org', element: <WelcomeOrgPage /> },
          { path: 'test', element: <FlowTestPage /> },
        ],
      },

      // Catch-all: redirect unknown lang-routes (e.g. /he/login) → home
      { path: '*', element: <Navigate to=".." replace /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
