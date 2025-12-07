import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Title, Paper, Text, Stack, Button, ThemeIcon } from '@mantine/core';
import { IconCheck, IconX } from '@tabler/icons-react';

interface Question {
  question: string;
  options: string[];
  answer: string;
}
interface UserAnswers {
  [key: number]: string;
}

export default function Results() {
  const location = useLocation();
  const navigate = useNavigate();

  const { questions, userAnswers } = (location.state || {}) as {
    questions: Question[];
    userAnswers: UserAnswers;
  };

  if (!questions || !userAnswers) {
    return (
      <Container>
        <Title>Нет данных для отображения</Title>
        <Text>Пожалуйста, сначала пройдите тест.</Text>
        <Button mt="md" onClick={() => navigate('/')}>На главную</Button>
      </Container>
    );
  }

  const getOptionStyle = (option: string, questionIndex: number) => {
    const correctAnswer = questions[questionIndex].answer;
    const userAnswer = userAnswers[questionIndex];

    if (option === correctAnswer) {
      return { color: 'green', icon: <IconCheck size="1.2rem" /> };
    }
    if (option === userAnswer) {
      return { color: 'red', icon: <IconX size="1.2rem" /> };
    }
    return { color: 'gray', icon: null };
  };

  return (
    <Container>
      <Title order={1} mb="xl">Разбор ваших ответов</Title>
      <Stack>
        {questions.map((q, index) => (
          <Paper key={index} withBorder p="xl" shadow="md">
            <Text size="lg" fw={700} mb="md">{index + 1}. {q.question}</Text>
            <Stack>
              {q.options.map((option) => {
                const { color, icon } = getOptionStyle(option, index);
                return (
                  <Paper key={option} withBorder p="xs" radius="md" bg={color === 'gray' ? undefined : `${color}.1`}>
                    <div style={{ display: 'flex', alignItems: 'center' }}>
                      {icon && <ThemeIcon color={color} variant="light" radius="xl" mr="md">{icon}</ThemeIcon>}
                      <Text color={color}>{option}</Text>
                    </div>
                  </Paper>
                );
              })}
            </Stack>
          </Paper>
        ))}
      </Stack>
      <Button fullWidth mt="xl" size="lg" onClick={() => navigate('/')}>
        Вернуться на главную
      </Button>
    </Container>
  );
}