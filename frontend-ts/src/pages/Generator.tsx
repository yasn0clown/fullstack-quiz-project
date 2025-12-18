import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Textarea, Button, Paper, Text, Loader, Alert, Group, SegmentedControl, TextInput } from '@mantine/core';
import api from '../api';

export default function Generator() {
  const navigate = useNavigate();

  const [context, setContext] = useState('');
  const [numQuestions, setNumQuestions] = useState('3');
  const [quizTitle, setQuizTitle] = useState('');

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleGenerateAndPlay = async () => {
    if (!context.trim() || !quizTitle.trim()) {
      setError('Пожалуйста, введите название квиза и текст для генерации.');
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
          isCreatorFlow: true,
          quizTitle: quizTitle,
        },
      });

    } catch (err: any) {
      setError(err.response?.data?.error || 'Произошла ошибка при генерации квиза.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container>
      <Title order={1}>Мастер создания квиза</Title>
      <Text c="dimmed" mt="md">
        Дайте название вашему тесту, вставьте текст, и ИИ создаст для вас уникальный квиз, который вы сразу сможете пройти.
      </Text>

      <Paper withBorder p="xl" mt="xl" shadow="md">
        <Title order={3}>Создайте свой квиз</Title>

        <TextInput
            label="Название квиза"
            placeholder="Например, 'Основы Python'"
            value={quizTitle}
            onChange={(e) => setQuizTitle(e.currentTarget.value)}
            required
        />
        
        <Textarea
          label="Учебный текст"
          placeholder="Вставьте сюда текст..."
          value={context}
          onChange={(event) => setContext(event.currentTarget.value)}
          minRows={8}
          autosize
          mt="md"
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
        
        <Group justify="flex-end" mt="xl">
          <Button onClick={handleGenerateAndPlay} loading={isLoading} disabled={!quizTitle.trim() || !context.trim()}>
            Сгенерировать и пройти
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