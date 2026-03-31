import { test, expect } from '@playwright/test';

test.describe('Lontra Smoke Test', () => {
  test('deve carregar a home page com os elementos principais', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Lontra/i);

    const createBoxBtn = page.getByRole('button', { name: /\+ Caixa/i });
    const createNoteBtn = page.getByRole('button', { name: /\+ Cartão/i });
    const quickNoteBtn = page.getByRole('button', { name: /Nota Rápida/i });

    await expect(createBoxBtn).toBeVisible();
    await expect(createNoteBtn).toBeVisible();
    await expect(quickNoteBtn).toBeVisible();
  });

  test('deve abrir o modal de Nota Rápida com Ctrl+Shift+N', async ({ page }) => {
    await page.goto('/');
    await page.keyboard.press('Control+Shift+N');

    const modal = page.locator('text=Nota Rápida');
    await expect(modal.first()).toBeVisible({ timeout: 5000 });

    await page.keyboard.press('Escape');
    await expect(modal.first()).not.toBeVisible({ timeout: 3000 });
  });
});
