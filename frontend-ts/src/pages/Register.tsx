import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { Container, Title, Paper, TextInput, PasswordInput, Button, Text, Anchor } from '@mantine/core';

export default function Register() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');

  const handleRegister = async () => {
    try {
      await axios.post('http://127.0.0.1:5000/api/register', { username, password });
      navigate('/login');
    } catch (err: any) {
      setError(err.response?.data?.error || 'Произошла ошибка регистрации');
    }
  };

  return (
    <Container size={420} my={40}>
      <Title align="center">Регистрация</Title>
      <Paper withBorder shadow="md" p={30} mt={30} radius="md">
        <TextInput label="Имя пользователя" value={username} onChange={(e) => setUsername(e.target.value)} required />
        <PasswordInput label="Пароль" mt="md" value={password} onChange={(e) => setPassword(e.target.value)} required />
        {error && <Text color="red" size="sm" mt="sm">{error}</Text>}
        <Button fullWidth mt="xl" onClick={handleRegister}>
          Зарегистрироваться
        </Button>
        <Text color="dimmed" size="sm" align="center" mt="md">
          Уже есть аккаунт?{' '}
          <Anchor size="sm" component="a" href="/login">
            Войти
          </Anchor>
        </Text>
      </Paper>
    </Container>
  );
}