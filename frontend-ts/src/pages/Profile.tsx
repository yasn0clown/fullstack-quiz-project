import { useState, useEffect } from 'react';
import { Container, Title, Paper, TextInput, Textarea, Button, Avatar, FileButton, Group, Stack, Notification, Loader, Center, Text } from '@mantine/core';
import { IconUpload, IconCheck, IconX } from '@tabler/icons-react';
import api from '../api';
import SEO from '../components/SEO';

export default function Profile() {
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
  
  const [fetching, setFetching] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [status, setStatus] = useState<{ type: 'success' | 'error', text: string } | null>(null);

  useEffect(() => {
    api.get('/profile')
      .then(res => {
        setUsername(res.data.username);
        setBio(res.data.bio || '');
        setAvatarUrl(res.data.avatar_url || null);
      })
      .catch(() => setStatus({ type: 'error', text: 'Ошибка загрузки профиля' }))
      .finally(() => setFetching(false));
  }, []);

  const handleUpdateProfile = async () => {
    if (!username.trim()) {
      setStatus({ type: 'error', text: 'Имя пользователя не может быть пустым' });
      return;
    }
    setUpdating(true);
    try {
      await api.put('/profile', { username, bio });
      setStatus({ type: 'success', text: 'Профиль успешно обновлен!' });
      setTimeout(() => window.location.reload(), 1500);
    } catch (err: any) {
      setStatus({ type: 'error', text: err.response?.data?.error || 'Ошибка при обновлении' });
    } finally {
      setUpdating(false);
    }
  };

  const handleUploadAvatar = async (file: File | null) => {
    if (!file) return;

    if (file.size > 2 * 1024 * 1024) {
      setStatus({ type: 'error', text: 'Файл слишком большой (макс. 2МБ)' });
      return;
    }

    setUploading(true);
    const formData = new FormData();
    formData.append('file', file);

    try {
      const res = await api.post('/profile/avatar', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setAvatarUrl(res.data.avatar_url);
      setStatus({ type: 'success', text: 'Фото профиля обновлено!' });
    } catch (err) {
      setStatus({ type: 'error', text: 'Ошибка загрузки изображения в облако' });
    } finally {
      setUploading(false);
    }
  };

  if (fetching) return <Center style={{height: '80vh'}}><Loader size="xl" /></Center>;

  return (
    <Container size="sm">
      <SEO title="Мой профиль" description="Управление личными данными и аватаром." />
      <Title order={1} mb="xl">Настройки профиля</Title>
      
      <Paper withBorder p="xl" radius="md" shadow="md">
        <Stack align="center" mb={30}>
          <Avatar 
            src={avatarUrl} 
            size={150} 
            radius={150} 
            alt={`Аватар пользователя ${username}`} 
            style={{ border: '2px solid var(--mantine-color-blue-filled)' }} 
          />
          
          <FileButton onChange={handleUploadAvatar} accept="image/png,image/jpeg">
            {(props) => (
              <Button 
                {...props} 
                variant="light" 
                leftSection={uploading ? <Loader size="xs" /> : <IconUpload size={16} />}
                disabled={uploading}
              >
                {uploading ? 'Загрузка...' : 'Загрузить фото'}
              </Button>
            )}
          </FileButton>
          <Text size="xs" c="dimmed">PNG или JPEG, не более 2 МБ</Text>
        </Stack>

        <TextInput 
          label="Имя пользователя" 
          value={username} 
          onChange={(e) => setUsername(e.currentTarget.value)} 
          mb="md" 
          required
        />
        
        <Textarea 
          label="О себе (Bio)" 
          placeholder="Расскажите немного о себе..." 
          value={bio} 
          onChange={(e) => setBio(e.currentTarget.value)}
          mb="xl" 
          minRows={3}
        />

        <Button fullWidth onClick={handleUpdateProfile} loading={updating}>
          Сохранить изменения
        </Button>

        {status && (
          <Notification 
            icon={status.type === 'success' ? <IconCheck size={18} /> : <IconX size={18} />}
            color={status.type === 'success' ? 'green' : 'red'} 
            mt="md" 
            onClose={() => setStatus(null)}
          >
            {status.text}
          </Notification>
        )}
      </Paper>
    </Container>
  );
}