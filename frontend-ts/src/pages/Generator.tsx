import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Container, Title, Textarea, Button, Paper, Text, Loader, Alert, Group, SegmentedControl, TextInput, FileButton, Image, Stack, Center } from '@mantine/core';
import { IconPhoto, IconX } from '@tabler/icons-react';
import api from '../api';
import SEO from '../components/SEO';

export default function Generator() {
  const navigate = useNavigate();

  const [context, setContext] = useState('');
  const [numQuestions, setNumQuestions] = useState('3');
  const [quizTitle, setQuizTitle] = useState('');
  
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<string | null>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const [wikiQuery, setWikiQuery] = useState('');
  const [wikiLoading, setWikiLoading] = useState(false);

  const handleFileChange = (file: File | null) => {
    setFile(file);
    if (file) {
      setPreview(URL.createObjectURL(file));
    } else {
      setPreview(null);
    }
  };

  const handleWikiFetch = async () => {
    setWikiLoading(true);
    try {
        const res = await api.get('/external/wiki', { params: { query: wikiQuery } });
        setContext(res.data.text);
    } catch (err) {
        alert("Не удалось найти статью в Википедии");
    } finally {
        setWikiLoading(false);
    }
  };

  const handleGenerateAndPlay = async () => {
    if (!context.trim() || !quizTitle.trim()) {
      setError('Пожалуйста, введите название и текст.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      let imageKeyForDb = null;
      let imageUrlForPreview = null;

      if (file) {
        const formData = new FormData();
        formData.append('file', file);
        const uploadRes = await api.post('/quizzes/upload-image', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        
        imageKeyForDb = uploadRes.data.image_key;
        imageUrlForPreview = uploadRes.data.image_url;
      }

      const response = await api.post('/generate-quiz', {
        text: context,
        count: parseInt(numQuestions, 10),
      });

      navigate('/quiz', {
        state: {
          generatedQuestions: response.data.questions,
          isCreatorFlow: true,
          quizTitle: quizTitle,
          quizImage: imageUrlForPreview,
          quizImageKey: imageKeyForDb
        },
      });

    } catch (err: any) {
      setError(err.response?.data?.error || 'Ошибка при создании квиза.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container size="sm">
      <SEO title="Мастер создания квиза" description="Создайте уникальный тест на любую тему с помощью ИИ." />
      <Title order={1}>Мастер создания квиза</Title>
      
      <Paper withBorder p="xl" mt="xl" shadow="md" radius="md">
        <Stack>
          <TextInput
              label="Название квиза"
              placeholder="Например, 'История Древнего Рима'"
              value={quizTitle}
              onChange={(e) => setQuizTitle(e.currentTarget.value)}
              required
          />

          <Text size="sm" fw={500} mb={-10}>Обложка квиза (необязательно)</Text>
          <Paper withBorder p="xs" radius="md" style={{ borderStyle: 'dashed' }}>
            {preview ? (
              <Stack align="center">
                <Image src={preview} height={150} radius="md" fit="contain" alt="Превью обложки квиза" />
                <Button variant="subtle" color="red" size="xs" onClick={() => handleFileChange(null)} leftSection={<IconX size={14}/>}>
                  Удалить фото
                </Button>
              </Stack>
            ) : (
              <Center py="md">
                <FileButton onChange={handleFileChange} accept="image/png,image/jpeg">
                  {(props) => (
                    <Button {...props} variant="light" leftSection={<IconPhoto size={16} />}>
                      Выбрать обложку
                    </Button>
                  )}
                </FileButton>
              </Center>
            )}
          </Paper>
          
          <Group align="flex-end" mb="md">
            <TextInput 
              label="Найти материал в Википедии" 
              placeholder="Например: Гравитация" 
              style={{flex: 1}}
              value={wikiQuery}
              onChange={(e) => setWikiQuery(e.target.value)}
            />
            <Button variant="light" onClick={handleWikiFetch} loading={wikiLoading}>Найти</Button>
          </Group>

          <Textarea
            label="Текст для генерации"
            placeholder="Вставьте учебный материал..."
            value={context}
            onChange={(event) => setContext(event.currentTarget.value)}
            minRows={6}
            autosize
            required
          />

          <Group grow>
            <Stack gap={5}>
                <Text size="sm" fw={500}>Вопросов</Text>
                <SegmentedControl
                    value={numQuestions}
                    onChange={setNumQuestions}
                    data={['3', '4', '5']}
                />
            </Stack>
            <Button 
                onClick={handleGenerateAndPlay} 
                loading={isLoading} 
                mt="xl"
                disabled={!quizTitle.trim() || !context.trim()}
            >
                Сгенерировать и начать
            </Button>
          </Group>
        </Stack>
      </Paper>

      {error && <Alert title="Ошибка!" color="red" mt="xl" onClose={() => setError('')} withCloseButton>{error}</Alert>}
    </Container>
  );
}