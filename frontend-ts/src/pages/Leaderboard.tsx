import { useState, useEffect } from 'react';
import { Container, Title, Table, Loader, Alert } from '@mantine/core';

interface Result {
  id: number;
  username: string;
  score: number;
  total: number;
}

export default function Leaderboard() {
  const [results, setResults] = useState<Result[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch('http://127.0.0.1:5000/api/results')
      .then((res) => res.json())
      .then((data) => {
        setResults(data);
        setLoading(false);
      })
      .catch(() => {
        setError('Не удалось загрузить таблицу лидеров.');
        setLoading(false);
      });
  }, []);

  if (loading) {
    return <Loader />;
  }

  if (error) {
    return <Alert color="red" title="Ошибка">{error}</Alert>;
  }

  const rows = results.map((result, index) => (
    <tr key={result.id}>
      <td>{index + 1}</td>
      <td>{result.username}</td>
      <td>{`${result.score} / ${result.total}`}</td>
    </tr>
  ));

  return (
    <Container>
      <Title mb="xl">Таблица лидеров</Title>
      <Table striped highlightOnHover withBorder>
        <thead>
          <tr>
            <th>#</th>
            <th>Имя</th>
            <th>Результат</th>
          </tr>
        </thead>
        <tbody>{rows.length > 0 ? rows : <tr><td colSpan={3}>Пока нет результатов</td></tr>}</tbody>
      </Table>
    </Container>
  );
}