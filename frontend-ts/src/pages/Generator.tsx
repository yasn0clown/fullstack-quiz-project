import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Textarea, Button, Paper, Text, Loader, Alert, Group, SegmentedControl } from '@mantine/core';
import api from '../api';

export default function Generator() {
  const navigate = useNavigate();

  const [context, setContext] = useState('');
  const [numQuestions, setNumQuestions] = useState('3');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const exampleText = `Python — высокоуровневый язык программирования общего назначения с динамической строгой типизацией и автоматическим управлением памятью. Python был разработан в конце 1980-х годов сотрудником голландского института CWI Гвидо ван Россумом.`;

  const handleGenerateQuiz = async () => {
    if (!context.trim()) {
      setError('Пожалуйста, введите текст для генерации квиза.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const response = await api.post('/generate-quiz', {
        text: context,
        count: parseInt(numQuestions, 10),
      });

      navigate('/quiz', {
        state: {
          generatedQuestions: response.data.questions,
        },
      });

    } catch (err: any) {
      setError(err.response?.data?.error || 'Произошла ошибка при генерации квиза');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title order={1}>Мастер создания квиза</Title>
      <Text c="dimmed" mt="md">
        Вставьте текст, выберите количество вопросов, и ИИ создаст для вас уникальный тест.
      </Text>

      <Paper withBorder p="xl" mt="xl" shadow="md">
        <Textarea
          label="Учебный текст"
          placeholder="Вставьте сюда текст..."
          value={context}
          onChange={(event) => setContext(event.currentTarget.value)}
          minRows={8}
          autosize
          required
        />
        <Text size="sm" mt="md" fw={500}>Количество вопросов</Text>
        <SegmentedControl
          value={numQuestions}
          onChange={setNumQuestions}
          data={['3', '4', '5']}
          mt={5}
          fullWidth
        />
        <Group position="apart" mt="xl">
            <Button variant="subtle" onClick={() => setContext(exampleText)}>
                Вставить пример
            </Button>
            <Button onClick={handleGenerateQuiz} disabled={isLoading} size="md">
                {isLoading ? <Loader size="sm" color="white" /> : 'Создать и начать квиз'}
            </Button>
        </Group>
      </Paper>

      {error && (
        <Alert title="Ошибка!" color="red" mt="xl" withCloseButton onClose={() => setError('')}>
          {error}
        </Alert>
      )}
    </Container>
  );
}