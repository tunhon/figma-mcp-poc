import { expect, test } from '@playwright/test';

test.describe('Login page semantic QA', () => {
  test('renders the expected login card content and key design tokens', async ({ page }) => {
    await page.goto('/');

    await expect(page.getByRole('heading', { name: 'Welcome back' })).toBeVisible();
    await expect(page.getByText('Sign in to continue')).toBeVisible();
    await expect(page.getByLabel('Email')).toBeVisible();
    await expect(page.getByLabel('Password')).toBeVisible();
    await expect(page.getByPlaceholder('your@email.com')).toBeVisible();
    await expect(page.getByPlaceholder('Enter your password')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Sign in' })).toBeVisible();
    await expect(page.getByText('Demo POC for Figma-driven UI testing')).toBeVisible();

    const card = page.locator('.login-card');
    const emailInput = page.locator('#email');
    const signInButton = page.getByRole('button', { name: 'Sign in' });

    await expect(card).toHaveCSS('border-radius', '16px');
    await expect(card).toHaveCSS('background-color', 'rgb(255, 255, 255)');
    await expect(emailInput).toHaveCSS('border-top-left-radius', '8px');
    await expect(emailInput).toHaveCSS('border-top-color', 'rgb(208, 215, 222)');
    await expect(signInButton).toHaveCSS('background-color', 'rgb(37, 99, 235)');
    await expect(signInButton).toHaveCSS('color', 'rgb(255, 255, 255)');

    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();

    if (!cardBox) {
      throw new Error('Login card bounding box was not available');
    }

    expect(Math.round(cardBox.width)).toBe(360);
    expect(Math.round(cardBox.height)).toBeGreaterThanOrEqual(300);
  });
});

test.describe('Login page visual QA', () => {
  test('matches the approved baseline screenshot', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('.login-card')).toBeVisible();

    await expect(page).toHaveScreenshot('login-page-baseline.png', {
      fullPage: true,
      animations: 'disabled',
      caret: 'hide',
      maxDiffPixelRatio: 0.01
    });
  });
});