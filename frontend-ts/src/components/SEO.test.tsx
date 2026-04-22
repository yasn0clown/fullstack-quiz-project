import { render, waitFor } from '@testing-library/react';
import { HelmetProvider } from 'react-helmet-async';
import { expect, it, describe } from 'vitest';
import SEO from './SEO';

describe('SEO Component', () => {
  it('должен правильно менять заголовок документа', async () => {
    render(
      <HelmetProvider>
        <SEO title="Тестовая страница" description="Описание" />
      </HelmetProvider>
    );

    // Ждем, пока react-helmet обновит заголовок
    await waitFor(() => {
      expect(document.title).toBe('Тестовая страница | Платформа Тестов');
    });
  });
});