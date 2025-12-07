import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Title, Paper, TextInput, PasswordInput, Button, Text, Anchor } from '@mantine/core';

export default function Login() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async () => {
    try {
      const response = await axios.post('http://127.0.0.1:5000/api/login', { username, password });
      localStorage.setItem('accessToken', response.data.access_token);
      localStorage.setItem('refreshToken', response.data.refresh_token);
      window.location.href = '/';
    } catch (err: any) {
      setError(err.response?.data?.error || 'Произошла ошибка входа');
    }
  };

  return (
    <Container size={420} my={40}>
      <Title align="center">Вход</Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput label="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <PasswordInput label="Пароль" mt="md" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <Text color="red" size="sm" mt="sm">{error}</Text>}
        <Button fullWidth mt="xl" onClick={handleLogin}>
          Войти
        </Button>
         <Text color="dimmed" size="sm" align="center" mt="md">
          Нет аккаунта?{' '}
          <Anchor size="sm" component="a" href="/register">
            Зарегистрироваться
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}