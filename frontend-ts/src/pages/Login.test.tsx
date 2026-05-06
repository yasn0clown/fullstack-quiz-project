import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { expect, it, describe, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import Login from './Login';

import api from '../api';
vi.mock('../api', () => ({
  default: {
    post: vi.fn(),
  },
}));

const mockedApi = vi.mocked(api);

describe('Login Page', () => {
  it('должен обновлять поля ввода и вызывать API при клике', async () => {
    mockedApi.post.mockResolvedValueOnce({
      data: {
        access_token: 'fake-access',
        refresh_token: 'fake-refresh'
      }
    });

    const originalLocation = window.location;
    delete (window as any).location;
    window.location = { ...originalLocation, href: '' } as any;

    render(
        <HelmetProvider>
            <MantineProvider>
                <BrowserRouter>
                    <Login />
                </BrowserRouter>
            </MantineProvider>
        </HelmetProvider>
    );

    const usernameInput = screen.getByLabelText(/Имя пользователя/i);
    const passwordInput = screen.getByLabelText(/Пароль/i);
    const loginButton = screen.getByRole('button', { name: /Войти/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    fireEvent.click(loginButton);

    await waitFor(() => {
      expect(mockedApi.post).toHaveBeenCalledWith(
        '/login',
        { username: 'testuser', password: 'password123' }
      );
      expect(localStorage.getItem('accessToken')).toBe('fake-access');
    });

    window.location = originalLocation;
  });
});