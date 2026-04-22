import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import { MantineProvider } from '@mantine/core';
import { expect, it, describe, vi } from 'vitest';
import { HelmetProvider } from 'react-helmet-async';
import axios from 'axios';
import Login from './Login';

// 1. Мокаем axios
vi.mock('axios');
const mockedAxios = axios as vi.Mocked<typeof axios>;

describe('Login Page', () => {
  it('должен обновлять поля ввода и вызывать API при клике', async () => {
    // Подделываем успешный ответ сервера
    mockedAxios.post.mockResolvedValueOnce({
      data: {
        access_token: 'fake-access',
        refresh_token: 'fake-refresh'
      }
    });

    // Подделываем window.location.href (так как в Login.tsx используется он)
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

    // 2. Имитируем ввод данных (Пункт 3.2)
    const usernameInput = screen.getByLabelText(/Имя пользователя/i);
    const passwordInput = screen.getByLabelText(/Пароль/i);
    const loginButton = screen.getByRole('button', { name: /Войти/i });

    fireEvent.change(usernameInput, { target: { value: 'testuser' } });
    fireEvent.change(passwordInput, { target: { value: 'password123' } });

    // 3. Кликаем по кнопке
    fireEvent.click(loginButton);

    // 4. Проверяем результат
    await waitFor(() => {
      // Проверяем, что axios был вызван с правильными данными
      expect(mockedAxios.post).toHaveBeenCalledWith(
        'http://127.0.0.1:5000/api/login',
        { username: 'testuser', password: 'password123' }
      );
      // Проверяем, что токены сохранились в localStorage
      expect(localStorage.getItem('accessToken')).toBe('fake-access');
    });

    window.location = originalLocation;
  });
});