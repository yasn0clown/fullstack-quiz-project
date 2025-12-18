import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Table, Loader, Alert, Button, Group, Text } from '@mantine/core';
import api from '../api';

interface CommunityQuiz {
  id: number;
  title: string;
  author: string;
  question_count: number;
}

export default function CommunityQuizzes() {
  const navigate = useNavigate();
  const [quizzes, setQuizzes] = useState<CommunityQuiz[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/quizzes')
      .then(response => {
        setQuizzes(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Не удалось загрузить список квизов. Возможно, вам нужно войти в систему.');
        setLoading(false);
      });
  }, []);

  const handleStartQuiz = async (quizId: number) => {
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      navigate('/quiz', {
        state: {
          generatedQuestions: response.data.questions,
          quizTitle: response.data.title,
          isCreatorFlow: false
        },
      });
    } catch {
      setError('Не удалось загрузить этот квиз.');
    }
  };

  if (loading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Ошибка">{error}</Alert>;

  const rows = quizzes.map((quiz) => (
    <tr key={quiz.id}>
      <td style={{ 
        textAlign: 'left', 
        verticalAlign: 'middle',
        border: '1px solid var(--mantine-color-default-border)'
      }}>{quiz.title}</td>
      <td style={{ 
        textAlign: 'left', 
        verticalAlign: 'middle',
        border: '1px solid var(--mantine-color-default-border)'
      }}>{quiz.author}</td>
      <td style={{ 
        textAlign: 'center', 
        verticalAlign: 'middle',
        border: '1px solid var(--mantine-color-default-border)'
      }}>{quiz.question_count}</td>
      <td style={{ 
        textAlign: 'center', 
        verticalAlign: 'middle',
        border: '1px solid var(--mantine-color-default-border)'
      }}>
        <Button size="xs" onClick={() => handleStartQuiz(quiz.id)}>Начать</Button>
      </td>
    </tr>
  ));

  return (
    <Container>
      <Group justify="space-between" mb="xl">
        <Title>Библиотека квизов</Title>
        <Button onClick={() => navigate('/generator')}>Создать свой квиз</Button>
      </Group>
      <Table 
        striped 
        highlightOnHover 
        withColumnBorders
        style={{ 
          border: '1px solid var(--mantine-color-default-border)',
          tableLayout: 'fixed',
        }}
      >
        <colgroup>
          <col style={{ width: '40%' }} />
          <col style={{ width: '25%' }} />
          <col style={{ width: '15%' }} />
          <col style={{ width: '20%' }} />
        </colgroup>
        <thead>
          <tr>
            <th style={{ 
              textAlign: 'left', 
              verticalAlign: 'middle',
              border: '1px solid var(--mantine-color-default-border)'
            }}>Название</th>
            <th style={{ 
              textAlign: 'left', 
              verticalAlign: 'middle',
              border: '1px solid var(--mantine-color-default-border)'
            }}>Автор</th>
            <th style={{ 
              textAlign: 'center', 
              verticalAlign: 'middle',
              border: '1px solid var(--mantine-color-default-border)'
            }}>Вопросов</th>
            <th style={{ 
              textAlign: 'center', 
              verticalAlign: 'middle',
              border: '1px solid var(--mantine-color-default-border)'
            }}>Действие</th>
          </tr>
        </thead>
        <tbody>
          {rows.length > 0 ? rows : (
            <tr>
              <td colSpan={4} style={{ 
                textAlign: 'center', 
                padding: 'md',
                border: '1px solid var(--mantine-color-default-border)'
              }}>
                <Text p="md">Пока никто не создал ни одного квиза. Будьте первым!</Text>
              </td>
            </tr>
          )}
        </tbody>
      </Table>
    </Container>
  );
}