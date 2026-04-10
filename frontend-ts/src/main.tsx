import React, { lazy, Suspense } from 'react';
import { Loader, Center, MantineProvider, createTheme } from '@mantine/core';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { HelmetProvider } from 'react-helmet-async';
import '@mantine/core/styles.css';

import { AuthProvider } from './AuthContext';
import App from './App';
import ProtectedRoute from './components/ProtectedRoute';

const Home = lazy(() => import('./pages/Home'));
const Quiz = lazy(() => import('./pages/Quiz'));
const Generator = lazy(() => import('./pages/Generator'));
const Leaderboard = lazy(() => import('./pages/Leaderboard'));
const Register = lazy(() => import('./pages/Register'));
const Login = lazy(() => import('./pages/Login'));
const Results = lazy(() => import('./pages/Results'));
const CommunityQuizzes = lazy(() => import('./pages/CommunityQuizzes'));
const AdminPanel = lazy(() => import('./pages/AdminPanel'));
const Profile = lazy(() => import('./pages/Profile'));
const NotFound = lazy(() => import('./pages/NotFound'));

const theme = createTheme({
  primaryColor: 'blue',
});

const PageLoader = (
  <Center style={{ height: '80vh' }}>
    <Loader size="xl" />
  </Center>
);

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Suspense fallback={PageLoader}><Home /></Suspense> },
      { path: 'register', element: <Suspense fallback={PageLoader}><Register /></Suspense> },
      { path: 'login', element: <Suspense fallback={PageLoader}><Login /></Suspense> },
      {
        element: <ProtectedRoute />,
        children: [
            { path: 'quiz', element: <Suspense fallback={PageLoader}><Quiz /></Suspense> },
            { path: 'generator', element: <Suspense fallback={PageLoader}><Generator /></Suspense> },
            { path: 'leaderboard', element: <Suspense fallback={PageLoader}><Leaderboard /></Suspense> },
            { path: 'results', element: <Suspense fallback={PageLoader}><Results /></Suspense> },
            { path: 'community', element: <Suspense fallback={PageLoader}><CommunityQuizzes /></Suspense> },
            { path: 'profile', element: <Suspense fallback={PageLoader}><Profile /></Suspense> },
        ]
      },
      {
        element: <ProtectedRoute requiredRole="admin" />,
        children: [
            { path: 'admin', element: <Suspense fallback={PageLoader}><AdminPanel /></Suspense> }
        ]
      },
      { path: '*', element: <Suspense fallback={PageLoader}><NotFound /></Suspense> }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <HelmetProvider>
      <AuthProvider>
        <MantineProvider theme={theme} defaultColorScheme="dark">
          <RouterProvider router={router} />
        </MantineProvider>
      </AuthProvider>
    </HelmetProvider>
  </React.StrictMode>
);