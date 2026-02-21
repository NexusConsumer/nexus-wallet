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

      // Catch-all: redirect unknown lang-routes (e.g. /he/login) → home
      { path: '*', element: <Navigate to=".." replace /> },
    ],
  },
  {
    path: '*',
    element: <NotFoundPage />,
  },
]);
