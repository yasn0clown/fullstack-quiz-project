import { Title, Text, Button, Container, Stack, Center } from '@mantine/core';
import { useNavigate } from 'react-router-dom';
import SEO from '../components/SEO';

export default function NotFound() {
  const navigate = useNavigate();

  return (
    <Container py={80}>
      <SEO 
        title="404 - Страница не найдена" 
        description="К сожалению, запрашиваемая страница не существует или была перемещена." 
      />      
      <Center>
        <Stack align="center">
          <Title order={1} style={{ fontSize: '120px', fontWeight: 900, lineHeight: 1 }}>
            404
          </Title>
          <Title order={2}>Упс! Кажется, вы заблудились.</Title>
          <Text c="dimmed" size="lg" style={{ maxWidth: '500px', textAlign: 'center' }}>
            Страница, которую вы ищете, не существует. Возможно, вы ввели неверный адрес или страница была удалена.
          </Text>
          <Button size="md" variant="light" mt="xl" onClick={() => navigate('/')}>
            Вернуться на главную
          </Button>
        </Stack>
      </Center>
    </Container>
  );
}