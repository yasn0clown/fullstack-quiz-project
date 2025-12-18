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

const theme = createTheme({
  primaryColor: 'blue',
});

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'quiz', element: <Quiz /> },
      { path: 'generator', element: <Generator /> },
      { path: 'leaderboard', element: <Leaderboard /> },
      { path: 'register', element: <Register /> },
      { path: 'login', element: <Login /> },
      { path: 'results', element: <Results /> },
      { path: 'community', element: <CommunityQuizzes /> },
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