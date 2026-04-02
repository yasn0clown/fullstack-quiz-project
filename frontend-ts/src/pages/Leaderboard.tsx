import { useState, useEffect } from 'react';
import { Container, Title, Table, Loader, Pagination, Stack } from '@mantine/core';
import api from '../api';

export default function Leaderboard() {
  const [results, setResults] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  useEffect(() => {
    setLoading(true);
    api.get('/results', { params: { page } })
      .then((res) => {
        setResults(res.data.results);
        setTotalPages(res.data.total_pages);
      })
      .finally(() => setLoading(false));
  }, [page]);

  return (
    <Container>
      <Title mb="xl">Таблица лидеров</Title>
      {loading ? <Loader size="xl" /> : (
        <Stack>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>#</Table.Th>
                <Table.Th>Имя</Table.Th>
                <Table.Th>Квиз</Table.Th>
                <Table.Th>Результат</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {results.map((r, index) => (
                <Table.Tr key={r.id}>
                  <Table.Td>{(page - 1) * 10 + index + 1}</Table.Td>
                  <Table.Td>{r.username}</Table.Td>
                  <Table.Td>{r.quiz_title}</Table.Td>
                  <Table.Td>{r.score} / {r.total}</Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>
          <Pagination total={totalPages} value={page} onChange={setPage} justify="center" />
        </Stack>
      )}
    </Container>
  );
}