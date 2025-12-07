import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { Container, Title, Paper, Radio, Button, Group, Text, Loader, Stack } from '@mantine/core';
import api from '../api';

interface Question {
  question: string;
  options: string[];
  answer: string;
}

export default function Quiz() {
  const location = useLocation();
  const navigate = useNavigate();

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFinished, setIsFinished] = useState(false);
  const [username, setUsername] = useState('Аноним');
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);

  const [selectedAnswer, setSelectedAnswer] = useState<string | null>(null);
  const [answerChecked, setAnswerChecked] = useState(false);
  const [userAnswers, setUserAnswers] = useState<{ [key: number]: string }>({});

  useEffect(() => {
    const fetchUsername = async () => {
      try {
        const response = await api.get('/profile');
        setUsername(response.data.username || 'Пользователь');
      } catch {
        setUsername('Аноним');
      }
    };

    if (location.state && location.state.generatedQuestions) {
      const { generatedQuestions } = location.state;
      setQuestions(generatedQuestions);
      fetchUsername();
      setLoading(false);
    } else {
      fetchUsername();
      api.get('/questions').then(response => {
        setQuestions(response.data);
        setLoading(false);
      }).catch(console.error);
    }
  }, [location.state]);

  const handleCheckAnswer = () => {
    if (!selectedAnswer) return;
    setUserAnswers({ ...userAnswers, [currentQuestionIndex]: selectedAnswer });
    if (selectedAnswer === questions[currentQuestionIndex].answer) {
      setScore(score + 1);
    }
    setAnswerChecked(true);
  };

  const handleNextQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer(null);
      setAnswerChecked(false);
    } else {
      handleFinish();
    }
  };

  const handleFinish = async () => {
    setIsFinished(true);
    const token = localStorage.getItem('accessToken');
    if (!token) return;

    try {
      await api.post('/results', {
        score: score,
        total: questions.length,
      });
    } catch (error) {
      console.error("Ошибка при отправке результата:", error);
    }
  };

  const getOptionColor = (option: string) => {
    if (!answerChecked) return 'gray';
    const correctAnswer = questions[currentQuestionIndex].answer;
    if (option === correctAnswer) return 'green';
    if (option === selectedAnswer) return 'red';
    return 'gray';
  };

  if (loading) return <Loader size="xl" />;

  if (isFinished) {
    return (
      <Container>
        <Title>Тест завершен!</Title>
        <Text size="xl" mt="md">
          {username}, ваш результат: {score} из {questions.length}
        </Text>
        <Group mt="xl">
          <Button onClick={() => navigate('/')}>На главную</Button>
          <Button
            variant="outline"
            onClick={() => navigate('/results', { state: { questions, userAnswers } })}
          >
            Посмотреть свои ответы
          </Button>
        </Group>
      </Container>
    );
  }

  if (questions.length === 0) return <Text>Не удалось загрузить вопросы.</Text>;
  const currentQuestion = questions[currentQuestionIndex];

  return (
    <Container>
      <Title order={2}>Вопрос {currentQuestionIndex + 1} из {questions.length}</Title>
      <Paper withBorder p="xl" mt="md" shadow="md">
        <Text size="lg" mb="md">{currentQuestion.question}</Text>
        <Stack mt="xs">
          {currentQuestion.options.map((option) => (
            <Radio
              key={option}
              checked={selectedAnswer === option}
              onChange={() => !answerChecked && setSelectedAnswer(option)}
              label={option}
              color={getOptionColor(option)}
            />
          ))}
        </Stack>
        <Group position="right" mt="xl">
          {!answerChecked ? (
            <Button onClick={handleCheckAnswer} disabled={!selectedAnswer}>Проверить</Button>
          ) : (
            <Button onClick={handleNextQuestion}>
              {currentQuestionIndex === questions.length - 1 ? 'Завершить' : 'Следующий вопрос'}
            </Button>
          )}
        </Group>
      </Paper>
    </Container>
  );
}