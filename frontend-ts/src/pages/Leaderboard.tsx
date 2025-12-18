import { useState, useEffect } from 'react';
import { Container, Title, Table, Loader, Alert } from '@mantine/core';
import api from '../api';

interface Result {
  id: number;
  username: string;
  score: number;
  total: number;
  quiz_title: string;
}

export default function Leaderboard() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    api.get('/results')
      .then((response) => {
        setResults(response.data);
        setLoading(false);
      })
      .catch(() => {
        setError('Не удалось загрузить таблицу лидеров.');
        setLoading(false);
      });
  }, []);

  if (loading) return <Loader size="xl" />;
  if (error) return <Alert color="red" title="Ошибка">{error}</Alert>;

  const rows = results.map((result, index) => (
    <tr key={result.id}>
      <td>{index + 1}</td>
      <td>{result.username}</td>
      <td>{result.quiz_title}</td>
      <td>{`${result.score} / ${result.total}`}</td>
    </tr>
  ));

  return (
    <Container>
    <Title mb="xl">Таблица лидеров</Title>
    <Table 
      striped 
      highlightOnHover 
      withColumnBorders
      style={{ 
        border: '1px solid var(--mantine-color-default-border)',
        tableLayout: 'fixed',
      }}
      className="leaderboard-table"
    >
      <style>{`
        .leaderboard-table th, .leaderboard-table td {
          text-align: left;
          vertical-align: middle;
          border: 1px solid var(--mantine-color-default-border);
        }
        .leaderboard-table th:nth-of-type(1), 
        .leaderboard-table td:nth-of-type(1) {
          text-align: center;
        }
        .leaderboard-table th:nth-of-type(4), 
        .leaderboard-table td:nth-of-type(4) {
          text-align: center;
        }
      `}</style>
      <colgroup>
        <col style={{ width: '10%' }} />
        <col style={{ width: '30%' }} />
        <col style={{ width: '40%' }} />
        <col style={{ width: '20%' }} />
      </colgroup>
      <thead>
        <tr>
          <th>#</th>
          <th>Имя</th>
          <th>Квиз</th>
          <th>Результат</th>
        </tr>
      </thead>
      <tbody>{rows.length > 0 ? rows : <tr><td colSpan={4}>Пока нет результатов</td></tr>}</tbody>
    </Table>
  </Container>
  );
}