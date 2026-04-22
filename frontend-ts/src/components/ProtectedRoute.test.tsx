import { render, screen } from '@testing-library/react';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from '../AuthContext';
import ProtectedRoute from './ProtectedRoute';
import { expect, it, describe, vi } from 'vitest';
import { MantineProvider } from '@mantine/core';

// Мокаем хук useAuth, чтобы имитировать разные состояния (войден/не войден)
vi.mock('../AuthContext', async () => {
  const actual = await vi.importActual('../AuthContext');
  return {
    ...actual,
    useAuth: vi.fn(),
  };
});

import { useAuth } from '../AuthContext';

describe('ProtectedRoute', () => {
  it('должен перенаправлять на логин, если пользователь не авторизован', () => {
    // Имитируем состояние: не авторизован
    (useAuth as any).mockReturnValue({
      isAuthenticated: false,
      isLoading: false,
      role: null
    });

    render(
      <MantineProvider>
        <MemoryRouter initialEntries={['/admin']}>
          <Routes>
            <Route element={<ProtectedRoute />}>
              <Route path="/admin" element={<div>Admin Content</div>} />
            </Route>
            <Route path="/login" element={<div>Login Page</div>} />
          </Routes>
        </MemoryRouter>
      </MantineProvider>
    );

    // Проверяем, что мы оказались на странице логина
    expect(screen.getByText(/Login Page/i)).toBeInTheDocument();
  });
});