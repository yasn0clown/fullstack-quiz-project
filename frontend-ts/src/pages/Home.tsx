import { Title, Text, Button, Container } from '@mantine/core';
import { Link } from 'react-router-dom';
import SEO from '../components/SEO';

const homeSchema = {
  "@context": "https://schema.org",
  "@type": "WebApplication",
  "name": "Платформа интеллектуальных тестов",
  "url": "http://127.0.0.1:5000",
  "description": "Веб-приложение для автоматической генерации квизов из учебных текстов с использованием ИИ.",
  "applicationCategory": "EducationalApplication",
  "operatingSystem": "All",
  "author": {
    "@type": "Organization",
    "name": "AI Quiz Team"
  }
};

export default function Home() {
  return (
    <Container>
      <SEO 
        title="Главная" 
        description="Создавайте уникальные тесты из любого текста за секунды с помощью искусственного интеллекта."
        jsonLd={homeSchema}
      />
      <Title order={1}>Добро пожаловать!</Title>
      <Text mt="md">Это учебная платформа для прохождения тестов. Готовы проверить свои знания?</Text>
      <Button component={Link} to="/community" mt="xl" size="md">
        Начать тест
      </Button>
    </Container>
  );
}