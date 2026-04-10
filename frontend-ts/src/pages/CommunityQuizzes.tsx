import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Container, Title, Table, Loader, Alert, Button, Group, TextInput, Select, Pagination, Paper, Stack } from '@mantine/core';
import { IconSearch, IconTrash } from '@tabler/icons-react';
import { useAuth } from '../AuthContext';
import api from '../api';
import SEO from '../components/SEO';

export default function CommunityQuizzes() {
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const { username: currentUsername, role } = useAuth();
  const [quizzes, setQuizzes] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  const page = parseInt(searchParams.get('page') || '1');
  const search = searchParams.get('search') || '';
  const sortBy = searchParams.get('sort_by') || 'created_at';
  const qCount = searchParams.get('count') || '';

  const fetchQuizzes = useCallback(() => {
    setLoading(true);
    api.get('/quizzes', { params: { page, search, sort_by: sortBy, count: qCount } })
      .then(res => {
        setQuizzes(res.data.quizzes);
        setTotalPages(res.data.total_pages);
      })
      .finally(() => setLoading(false));
  }, [page, search, sortBy, qCount]);

  useEffect(() => {
    fetchQuizzes();
  }, [fetchQuizzes]);

  const handleDelete = async (quizId: number) => {
    if (!window.confirm('Вы уверены, что хотите удалить этот квиз?')) return;
    try {
      await api.delete(`/quizzes/${quizId}`);
      fetchQuizzes();
    } catch (err) {
      alert('Ошибка при удалении');
    }
  };

  const handleStartQuiz = async (quizId: number, quizTitle: string) => {
    try {
      const response = await api.get(`/quizzes/${quizId}`);
      navigate('/quiz', {
        state: {
          generatedQuestions: response.data.questions,
          quizTitle: response.data.title,
          quizImage: response.data.image_url,
          isCreatorFlow: false
        },
      });
    } catch {
      alert('Не удалось загрузить вопросы квиза');
    }
  };

  return (
    <Container size="lg">
      <SEO 
        title="Библиотека квизов" 
        description="Список всех доступных тестов, созданных сообществом. Выбирайте тему и проходите квизы онлайн." 
      />
      <Group justify="space-between" mb="xl">
        <Title order={1}>Библиотека квизов</Title>
        <Button onClick={() => navigate('/generator')}>Создать свой квиз</Button>
      </Group>

      <Paper withBorder p="md" mb="xl">
        <Group align="flex-end">
          <TextInput
            label="Поиск"
            placeholder="Название..."
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearchParams({ search: e.target.value, page: '1', sort_by: sortBy, count: qCount })}
            style={{ flex: 1 }}
          />
          
          <Select
            label="Вопросов"
            placeholder="Все"
            clearable
            data={[
              { value: '3', label: '3 вопроса' },
              { value: '4', label: '4 вопроса' },
              { value: '5', label: '5 вопросов' },
            ]}
            value={qCount}
            onChange={(val) => setSearchParams({ search, sort_by: sortBy, page: '1', count: val || '' })}
            style={{ width: 150 }}
          />

          <Select
            label="Сортировка"
            data={[
              { value: 'created_at', label: 'Сначала новые' },
              { value: 'title', label: 'По названию' },
            ]}
            value={sortBy}
            onChange={(val) => setSearchParams({ search, sort_by: val || 'created_at', page: '1', count: qCount })}
          />
        </Group>
      </Paper>

      {loading ? <Loader size="xl" /> : (
        <Stack>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Название</Table.Th>
                <Table.Th>Автор</Table.Th>
                <Table.Th>Вопросов</Table.Th>
                <Table.Th style={{ textAlign: 'center' }}>Действие</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {quizzes.map(q => (
                <Table.Tr key={q.id}>
                  <Table.Td>{q.title}</Table.Td>
                  <Table.Td>{q.author}</Table.Td>
                  <Table.Td>{q.question_count}</Table.Td>
                  <Table.Td>
                    <Group gap="xs" justify="center">
                      <Button size="xs" onClick={() => handleStartQuiz(q.id, q.title)}>Начать</Button>
                      
                      {(q.author === currentUsername || role === 'admin') && (
                        <Button size="xs" color="red" variant="light" onClick={() => handleDelete(q.id)}>
                          <IconTrash size={14} />
                        </Button>
                      )}
                    </Group>
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          <Pagination 
            total={totalPages} 
            value={page} 
            onChange={(p) => setSearchParams({ search, sort_by: sortBy, page: p.toString() })} 
            justify="center"
          />
        </Stack>
      )}
    </Container>
  );
}