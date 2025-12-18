import { AppShell, Burger, Group, NavLink as MantineNavLink, Text } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { Outlet, Link } from 'react-router-dom';
import { useAuth } from './AuthContext';

export default function App() {
  const [opened, { toggle }] = useDisclosure();
  const { isAuthenticated, username, logout } = useAuth();

  return (
    <AppShell
      header={{ height: 60 }}
      navbar={{ width: 300, breakpoint: 'sm', collapsed: { mobile: !opened } }}
      padding="md"
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group>
            <Burger opened={opened} onClick={toggle} hiddenFrom="sm" size="sm" />
            Платформа Тестов
          </Group>
          {isAuthenticated && <Text size="sm">Привет, {username}!</Text>}
        </Group>
      </AppShell.Header>
      <AppShell.Navbar p="md">
        <MantineNavLink component={Link} to="/" label="Главная" onClick={toggle}/>
        <MantineNavLink component={Link} to="/community" label="Библиотека квизов" onClick={toggle}/>
        <MantineNavLink component={Link} to="/generator" label="Создать свой квиз" onClick={toggle}/>
        <MantineNavLink component={Link} to="/quiz" label="Демо-тест" onClick={toggle}/>
        <MantineNavLink component={Link} to="/leaderboard" label="Таблица лидеров" onClick={toggle}/>
        <hr />
        {isAuthenticated ? (
          <MantineNavLink label="Выйти" onClick={logout} />
        ) : (
          <>
            <MantineNavLink component={Link} to="/login" label="Вход" onClick={toggle} />
            <MantineNavLink component={Link} to="/register" label="Регистрация" onClick={toggle} />
          </>
        )}
      </AppShell.Navbar>
      <AppShell.Main><Outlet /></AppShell.Main>
    </AppShell>
  );
}