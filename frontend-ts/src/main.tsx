import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MantineProvider, createTheme } from '@mantine/core';
import '@mantine/core/styles.css';

import { AuthProvider } from './AuthContext';
import App from './App';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Generator from './pages/Generator';
import Leaderboard from './pages/Leaderboard';
import Register from './pages/Register';
import Login from './pages/Login';
import Results from './pages/Results';
import CommunityQuizzes from './pages/CommunityQuizzes';
import AdminPanel from './pages/AdminPanel';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

const theme = createTheme({
  primaryColor: 'blue',
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'register', element: <Register /> },
      { path: 'login', element: <Login /> },
      {
        element: <ProtectedRoute />,
        children: [
            { path: 'quiz', element: <Quiz /> },
            { path: 'generator', element: <Generator /> },
            { path: 'leaderboard', element: <Leaderboard /> },
            { path: 'results', element: <Results /> },
            { path: 'community', element: <CommunityQuizzes /> },
            { path: 'profile', element: <Profile />},
        ]
      },
      {
        element: <ProtectedRoute requiredRole="admin" />,
        children: [
            { path: 'admin', element: <AdminPanel /> }
        ]
      }
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <MantineProvider theme={theme} defaultColorScheme="dark">
        <RouterProvider router={router} />
      </MantineProvider>
    </AuthProvider>
  </React.StrictMode>
);