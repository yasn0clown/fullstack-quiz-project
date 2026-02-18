import { useState } from 'react';
import { Container, Title, TextInput, Button, Paper, Group, Notification } from '@mantine/core';
import api from '../api';

export default function AdminPanel() {
  const [userId, setUserId] = useState('');
  const [newRole, setNewRole] = useState('admin');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleChangeRole = async () => {
    setError(null);
    setMessage(null);
    try {
      await api.post(`/admin/users/${userId}/role`, { role: newRole });
      setMessage(`Роль пользователя ID ${userId} успешно изменена на ${newRole}`);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при изменении роли');
    }
  };

  return (
    <Container>
      <Title mb="xl">Панель Администратора</Title>
      
      <Paper withBorder p="xl">
        <Title order={3} mb="md">Управление ролями</Title>
        <Group align="flex-end">
            <TextInput 
                label="ID пользователя" 
                placeholder="Например: 2" 
                value={userId}
                onChange={(e) => setUserId(e.currentTarget.value)}
            />
            <TextInput 
                label="Новая роль" 
                placeholder="user или admin" 
                value={newRole}
                onChange={(e) => setNewRole(e.currentTarget.value)}
            />
            <Button onClick={handleChangeRole}>Применить</Button>
        </Group>

        {message && <Notification color="green" mt="md" onClose={() => setMessage(null)}>{message}</Notification>}
        {error && <Notification color="red" mt="md" onClose={() => setError(null)}>{error}</Notification>}
      </Paper>
    </Container>
  );
}