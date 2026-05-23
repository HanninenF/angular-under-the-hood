import { expect, Page, test } from '@playwright/test';

test('loads the Angular demo shell', async ({ page }) => {
  await page.goto('/');

  await expect(
    page.getByRole('heading', { name: 'Angular under the hood' }),
  ).toBeVisible();
  await expect(page.getByRole('button', { name: 'Timeline' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Settings' })).toBeVisible();
  await expect(page.getByText('Timeline events')).toBeVisible();
});

test('tracks the profile card lifecycle over about five seconds', async ({
  page,
}) => {
  await page.goto('/');

  await page.getByRole('button', { name: 'Settings' }).click();
  await expect(page.getByRole('button', { name: 'Profile card' })).toBeVisible();

  const profileCard = page.getByRole('button', { name: 'Profile card' });
  await expect(profileCard).toBeVisible();

  await page.waitForTimeout(5000);

  await page.getByRole('button', { name: 'Timeline' }).click();

  const constructorRow = page.locator('button.row', {
    hasText: 'LifecycleProfileCardComponent constructor created',
  });
  const destroyRow = page.locator('button.row', {
    hasText: 'LifecycleProfileCardComponent ngOnDestroy',
  });

  await expect(constructorRow).toBeVisible();
  await expect(destroyRow).toBeVisible();

  const constructorTimestamp = parseTimestamp(await constructorRow.textContent());
  const destroyTimestamp = parseTimestamp(await destroyRow.textContent());
  const deltaMs = destroyTimestamp - constructorTimestamp;

  expect(deltaMs).toBeGreaterThanOrEqual(4500);
  expect(deltaMs).toBeLessThanOrEqual(6500);

  await waitForManualPause(page);
});

function parseTimestamp(text: string | null): number {
  const match = text?.match(/\+(\d+)ms/);

  if (!match) {
    throw new Error(`Could not parse timestamp from: ${text ?? '<empty>'}`);
  }

  return Number(match[1]);
}

async function waitForManualPause(page: Page): Promise<void> {
  if (process.env.PLAYWRIGHT_MANUAL !== '1') {
    return;
  }

  await page.pause();
}
