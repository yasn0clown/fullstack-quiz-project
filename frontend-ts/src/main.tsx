import React from 'react';
import ReactDOM from 'react-dom/client';
import { createBrowserRouter, RouterProvider } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import App from './App';
import Home from './pages/Home';
import Quiz from './pages/Quiz';
import Results from './pages/Results';
import '@mantine/core/styles.css';
import Leaderboard from './pages/Leaderboard';
import Generator from './pages/Generator';
import Register from './pages/Register';
import Login from './pages/Login';
import { AuthProvider } from './AuthContext';

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    children: [
      { index: true, element: <Home /> },
      { path: 'quiz', element: <Quiz /> },
      { path: 'leaderboard', element: <Leaderboard /> },
      { path: 'generator', element: <Generator /> },
      { path: 'results', element: <Results /> },
      { path: 'register', element: <Register /> },
      { path: 'login', element: <Login /> },
    ],
  },
]);

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <AuthProvider>
      <MantineProvider withGlobalStyles withNormalizeCSS theme={{ colorScheme: 'dark' }}>
        <RouterProvider router={router} />
      </MantineProvider>
    </AuthProvider>
  </React.StrictMode>
);