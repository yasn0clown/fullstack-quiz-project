import { Navigate, Outlet, useNavigate } from 'react-router-dom';
import { useAuth } from '../AuthContext';
import { Container, Title, Text, Button, Paper, Center, Loader } from '@mantine/core';
import { IconLock } from '@tabler/icons-react';

interface ProtectedRouteProps {
  requiredRole?: string;
}

export default function ProtectedRoute({ requiredRole }: ProtectedRouteProps) {
  const { isAuthenticated, isLoading, role } = useAuth();
  const navigate = useNavigate();

  if (isLoading) {
    return (
        <Center style={{ height: '100vh' }}>
            <Loader size="xl" />
        </Center>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (requiredRole && role !== requiredRole) {
    return (
        <Container size="sm" py={50}>
            <Paper withBorder p="xl" radius="md" style={{ textAlign: 'center' }}>
                <Center>
                    <IconLock size={50} color="red" />
                </Center>
                <Title order={2} mt="md">Доступ запрещен (403)</Title>
                <Text c="dimmed" mt="sm" mb="xl">
                    У вашего аккаунта ({role}) недостаточно прав для просмотра этой страницы.
                    Эта страница доступна только для роли: <b>{requiredRole}</b>.
                </Text>
                <Button variant="outline" onClick={() => navigate('/')}>
                    Вернуться на главную
                </Button>
            </Paper>
        </Container>
    );
  }

  return <Outlet />;
}