import {expect, test} from '@playwright/test';

const locales = [
  {locale: 'fr', direction: 'ltr', title: 'Des lieux pour votre avenir.', firstProject: 'Résidence Atlas'},
  {locale: 'en', direction: 'ltr', title: 'Places for your future.', firstProject: 'Atlas Residence'},
  {locale: 'ar', direction: 'rtl', title: 'مساحات لمستقبلك.', firstProject: 'إقامة أطلس'}
];

for (const {locale, direction, title, firstProject} of locales) {
  test(`renders real seeded data in ${locale} with correct direction`, async ({page}) => {
    const response = await page.goto(`/${locale}`);
    expect(response?.status()).toBe(200);
    await expect(page.locator('html')).toHaveAttribute('lang', locale);
    await expect(page.locator('html')).toHaveAttribute('dir', direction);
    await expect(page.getByRole('heading', {level: 1})).toHaveText(title);
    await expect(page.getByTestId('project-card')).toHaveCount(6);
    await expect(page.getByRole('heading', {name: firstProject, exact: true})).toBeVisible();
    expect(await page.getByTestId('unit-count').textContent()).toBe((40).toLocaleString(locale));
    expect(await page.getByTestId('city-count').textContent()).toBe((3).toLocaleString(locale));
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true);
  });
}

test('defaults to French and switches to Arabic', async ({page}) => {
  await page.goto('/');
  await expect(page).toHaveURL(/\/fr$/);
  await page.getByRole('link', {name: 'العربية', exact: true}).click();
  await expect(page).toHaveURL(/\/ar$/);
  await expect(page.locator('html')).toHaveAttribute('dir', 'rtl');
});

test('health request checks the actual database and disables caching', async ({request}) => {
  const response = await request.get('/api/health');
  expect(response.status()).toBe(200);
  expect(await response.json()).toEqual({status: 'ok'});
  expect(response.headers()['cache-control']).toBe('no-store');
});
