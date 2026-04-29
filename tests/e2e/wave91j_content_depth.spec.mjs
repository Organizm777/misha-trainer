import { test, expect } from '@playwright/test';

test('content depth hub loads manifest and training bank', async ({ page }) => {
  await page.goto('/content_depth.html');
  await expect(page.getByRole('heading', { name: /Больше/i })).toBeVisible();
  await expect(page.locator('#status')).toContainText(/Готово|Манифест|заданий|вопросов/i);
  await expect(page.locator('#result article.q').first()).toBeVisible();
});

test('teacher mode builds an assignment from static JSON banks', async ({ page }) => {
  await page.goto('/teacher.html');
  await page.locator('#teacherGrade').selectOption('7');
  await page.locator('#teacherCount').fill('5');
  await page.getByRole('button', { name: /Собрать/i }).click();
  await expect(page.locator('#teacherResult article.q')).toHaveCount(5);
});

test('embed widget renders compact tasks', async ({ page }) => {
  await page.goto('/embed.html?grade=7&subject=математика');
  await expect(page.locator('#embedList article.q').first()).toBeVisible();
});
