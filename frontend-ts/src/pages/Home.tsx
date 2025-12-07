import { Title, Text, Button, Container } from '@mantine/core';
import { Link } from 'react-router-dom';

export default function Home() {
  return (
    <Container>
      <Title>Добро пожаловать!</Title>
      <Text mt="md">Это учебная платформа для прохождения тестов. Готовы проверить свои знания?</Text>
      <Button component={Link} to="/quiz" mt="xl" size="md">
        Начать тест
      </Button>
    </Container>
  );
}