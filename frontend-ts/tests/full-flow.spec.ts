import { test, expect } from '@playwright/test';

test('полный цикл: логин и переход в библиотеку', async ({ page }) => {
  // 1. Открываем страницу логина
  await page.goto('http://localhost:5173/login');

  // 2. Вводим данные (используем getByLabel — это самый надежный способ в Playwright)
  await page.getByLabel('Имя пользователя').fill('admin');
  await page.getByLabel('Пароль').fill('admin');
  
  // 3. Нажимаем кнопку "Войти"
  // Ищем кнопку, которая содержит текст "Войти"
  await page.getByRole('button', { name: /Войти/i }).click();

  // 4. Ждем перехода на главную страницу (проверяем URL)
  await expect(page).toHaveURL('http://localhost:5173/');

  // 5. Кликаем на "Библиотека квизов" в боковом меню
  // Используем навигацию Mantine
  await page.getByRole('link', { name: 'Библиотека квизов' }).click();
  
  // 6. Проверяем, что заголовок страницы правильный
  await expect(page.locator('h1')).toContainText('Библиотека квизов');
});

test('сценарий работы с Википедией: успех и ошибка', async ({ page }) => {
  // 1. Авторизуемся
  await page.goto('http://localhost:5173/login');
  await page.getByLabel('Имя пользователя').fill('admin');
  await page.getByLabel('Пароль').fill('admin');
  await page.getByRole('button', { name: /Войти/i }).click();

  // --- ВАЖНО: Ждем, пока состояние авторизации обновится ---
  // Ищем приветствие в шапке (оно появляется только после успешного входа)
  await expect(page.getByText(/Привет, admin/i)).toBeVisible({ timeout: 10000 });

  // 2. Переходим на страницу генератора через боковое меню
  await page.getByRole('link', { name: 'Создать свой квиз' }).click();
  
  // Ждем, пока URL станет /generator
  await expect(page).toHaveURL(/.*generator/);

  // 3. СЦЕНАРИЙ УСПЕХА: Ищем статью "Солнце"
  const wikiInput = page.getByPlaceholder('Например: Гравитация');
  await wikiInput.fill('Солнце');
  await page.getByRole('button', { name: 'Найти' }).click();

  const textarea = page.getByLabel('Текст для генерации');
  await expect(textarea).not.toBeEmpty({ timeout: 10000 });
  // .? означает "любой символ или его отсутствие" (пропустит ударение)
  await expect(textarea).toContainText(/Со.лнце/);

  // 4. СЦЕНАРИЙ ОТКАЗА: Ищем несуществующую статью
  await wikiInput.fill('такойстатьиточнонесуществует12345');
  
  // Включаем прослушку диалога ПЕРЕД кликом
  const dialogPromise = page.waitForEvent('dialog');
  await page.getByRole('button', { name: 'Найти' }).click();
  
  const dialog = await dialogPromise;
  expect(dialog.message()).toContain('Не удалось найти статью');
  await dialog.dismiss();
});