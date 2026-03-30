import { readFile } from 'node:fs/promises';
import { resolve } from 'node:path';

import { expect, test } from '@playwright/test';

type FigmaContract = {
  page: {
    backgroundColor: string | null;
  };
  card: {
    backgroundColor: string | null;
    borderRadius: string;
    width: number;
  };
  text: {
    title: string;
    subtitle: string;
    emailLabel: string;
    passwordLabel: string;
    button: string;
    helper: string;
  };
  input: {
    borderColor: string | null;
    borderRadius: string;
  };
  button: {
    backgroundColor: string | null;
    textColor: string | null;
    borderRadius: string;
  };
};

async function readContract(): Promise<FigmaContract> {
  const contractPath = resolve(process.cwd(), 'qa', 'figma-contract.json');
  const contents = await readFile(contractPath, 'utf8');

  return JSON.parse(contents) as FigmaContract;
}

test.describe('@figma Login page against Figma contract', () => {
  test('matches text and core visual tokens extracted from Figma', async ({ page }, testInfo) => {
    const contract = await readContract();

    await page.goto('/');

    await expect(page.getByRole('heading', { name: contract.text.title })).toBeVisible();
    await expect(page.getByText(contract.text.subtitle)).toBeVisible();
    await expect(page.getByLabel(contract.text.emailLabel)).toBeVisible();
    await expect(page.getByLabel(contract.text.passwordLabel)).toBeVisible();
    await expect(page.getByRole('button', { name: contract.text.button })).toBeVisible();
    await expect(page.getByText(contract.text.helper)).toBeVisible();

    const pageRoot = page.locator('.login-page');
    const card = page.locator('.login-card');
    const emailInput = page.locator('#email');
    const signInButton = page.getByRole('button', { name: contract.text.button });

    const actual = {
      text: {
        title: (await page.getByRole('heading').first().textContent())?.trim() ?? '',
        subtitle: (await page.locator('.login-card__subtitle').first().textContent())?.trim() ?? '',
        emailLabel: (await page.locator('label[for="email"]').first().textContent())?.trim() ?? '',
        passwordLabel: (await page.locator('label[for="password"]').first().textContent())?.trim() ?? '',
        button: (await signInButton.first().textContent())?.trim() ?? '',
        helper: (await page.locator('.login-form__helper').first().textContent())?.trim() ?? ''
      },
      style: {
        pageBackground: await pageRoot.evaluate((el) => getComputedStyle(el).backgroundColor),
        cardBackground: await card.evaluate((el) => getComputedStyle(el).backgroundColor),
        cardRadius: await card.evaluate((el) => getComputedStyle(el).borderRadius),
        cardWidthPx: await card.evaluate((el) => Math.round(el.getBoundingClientRect().width)),
        inputBorderColor: await emailInput.evaluate((el) => getComputedStyle(el).borderTopColor),
        inputRadius: await emailInput.evaluate((el) => getComputedStyle(el).borderTopLeftRadius),
        buttonBackground: await signInButton.evaluate((el) => getComputedStyle(el).backgroundColor),
        buttonTextColor: await signInButton.evaluate((el) => getComputedStyle(el).color),
        buttonRadius: await signInButton.evaluate((el) => getComputedStyle(el).borderTopLeftRadius)
      }
    };

    const expected = {
      text: contract.text,
      style: {
        pageBackground: contract.page.backgroundColor,
        cardBackground: contract.card.backgroundColor,
        cardRadius: contract.card.borderRadius,
        cardWidthPx: contract.card.width,
        inputBorderColor: contract.input.borderColor,
        inputRadius: contract.input.borderRadius,
        buttonBackground: contract.button.backgroundColor,
        buttonTextColor: contract.button.textColor,
        buttonRadius: contract.button.borderRadius
      }
    };

    await testInfo.attach('figma-expected-vs-actual.json', {
      body: JSON.stringify({ expected, actual }, null, 2),
      contentType: 'application/json'
    });

    await testInfo.attach('figma-comparison-screenshot.png', {
      body: await page.screenshot({ fullPage: true }),
      contentType: 'image/png'
    });

    if (contract.page.backgroundColor) {
      await expect(pageRoot).toHaveCSS('background-color', contract.page.backgroundColor);
    }

    if (contract.card.backgroundColor) {
      await expect(card).toHaveCSS('background-color', contract.card.backgroundColor);
    }

    await expect(card).toHaveCSS('border-radius', contract.card.borderRadius);
    await expect(emailInput).toHaveCSS('border-top-left-radius', contract.input.borderRadius);
    await expect(signInButton).toHaveCSS('border-top-left-radius', contract.button.borderRadius);

    if (contract.input.borderColor) {
      await expect(emailInput).toHaveCSS('border-top-color', contract.input.borderColor);
    }

    if (contract.button.backgroundColor) {
      await expect(signInButton).toHaveCSS('background-color', contract.button.backgroundColor);
    }

    if (contract.button.textColor) {
      await expect(signInButton).toHaveCSS('color', contract.button.textColor);
    }

    const cardBox = await card.boundingBox();
    expect(cardBox).not.toBeNull();

    if (!cardBox) {
      throw new Error('Login card bounding box was not available');
    }

    expect(Math.round(cardBox.width)).toBe(contract.card.width);
  });
});