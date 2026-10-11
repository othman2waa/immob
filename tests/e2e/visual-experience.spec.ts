import {expect, test} from '@playwright/test';

async function readyViewer(page: import('@playwright/test').Page) {
  const viewer = page.getByTestId('architecture-viewer');
  await viewer.scrollIntoViewIfNeeded();
  await expect(page.getByTestId('architecture-scene')).toHaveAttribute('data-renderer-status', 'ready', {timeout: 30_000});
  return viewer;
}

test('loads optimized local photos and reveals project cards on scroll', async ({page, request}) => {
  await page.goto('/fr');
  const hero = page.locator('.hero-photo');
  await expect.poll(() => hero.evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  const src = await hero.evaluate((image: HTMLImageElement) => image.currentSrc);
  expect(new URL(src).origin).toBe(new URL(page.url()).origin);
  const photo = await request.get(src, {headers: {Accept: 'image/avif,image/webp,image/*;q=0.8'}});
  expect(photo.ok()).toBe(true);
  expect(photo.headers()['content-type']).toMatch(/^image\/(avif|webp)/);
  const last = page.getByTestId('project-card').last();
  await last.scrollIntoViewIfNeeded();
  await expect.poll(() => last.locator('img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect.poll(() => last.evaluate((card) => card.parentElement?.parentElement?.classList.contains('reveal-pending'))).toBe(false);
});

test('renders WebGL and changes the actual model view with keyboard controls', async ({page}) => {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto('/fr');
  const viewer = await readyViewer(page);
  await page.getByRole('button', {name: 'Mettre la rotation en pause', exact: true}).click();
  await expect(page.getByRole('button', {name: 'Relancer la rotation', exact: true})).toHaveAttribute('aria-pressed', 'true');
  const canvas = viewer.locator('canvas');
  const original = await canvas.screenshot();
  await page.getByRole('button', {name: 'Rapprocher la vue', exact: true}).focus();
  await page.keyboard.press('Enter');
  await expect.poll(async () => (await canvas.screenshot()).equals(original)).toBe(false);
  const zoomed = await canvas.screenshot();
  await page.getByRole('button', {name: 'Tourner la maquette vers la droite', exact: true}).click();
  await expect.poll(async () => (await canvas.screenshot()).equals(zoomed)).toBe(false);
  const rotated = await canvas.screenshot();
  await page.getByRole('button', {name: 'Réinitialiser la vue', exact: true}).click();
  await expect.poll(async () => (await canvas.screenshot()).equals(rotated)).toBe(false);
  expect(errors).toEqual([]);
});

test('respects reduced motion in CSS and the WebGL scene', async ({page}) => {
  await page.emulateMedia({reducedMotion: 'reduce'});
  await page.goto('/fr');
  await expect(page.locator('.hero-title')).toHaveCSS('animation-name', 'none');
  await expect(page.locator('.hero-photo')).toHaveCSS('transform', 'none');
  const viewer = await readyViewer(page);
  await expect(page.getByRole('button', {name: 'Mettre la rotation en pause', exact: true})).toHaveCount(0);
  const canvas = viewer.locator('canvas');
  const first = await canvas.screenshot();
  // Sample a later frame: a still image must remain still when motion is reduced.
  await page.waitForTimeout(200);
  expect((await canvas.screenshot()).equals(first)).toBe(true);
});

test('keeps the photographic fallback usable when WebGL is unavailable', async ({page}) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {value: function(this: HTMLCanvasElement, type: string, ...args: unknown[]) {
      return type.startsWith('webgl') ? null : Reflect.apply(original, this, [type, ...args]);
    }});
  });
  await page.goto('/fr');
  await page.getByTestId('architecture-viewer').scrollIntoViewIfNeeded();
  await expect(page.getByTestId('architecture-scene')).toHaveAttribute('data-renderer-status', 'unavailable');
  await expect(page.getByRole('status')).toContainText('La vue 3D n’est pas disponible');
  await expect.poll(() => page.locator('.viewer-placeholder img').evaluate((image: HTMLImageElement) => image.complete && image.naturalWidth > 0)).toBe(true);
  await expect(page.getByRole('button', {name: 'Rapprocher la vue', exact: true})).toHaveCount(0);
});

test('keeps the collection and photographs visible without JavaScript', async ({browser, baseURL}) => {
  const context = await browser.newContext({javaScriptEnabled: false, baseURL});
  const page = await context.newPage();
  await page.goto('/fr');
  await expect(page.getByTestId('project-card')).toHaveCount(6);
  await expect(page.getByRole('heading', {name: 'Résidence Atlas', exact: true})).toBeVisible();
  await page.getByTestId('architecture-viewer').scrollIntoViewIfNeeded();
  // Text selectors omit noscript nodes, even in a script-disabled context.
  const fallback = page.locator('.viewer-no-script');
  await expect(fallback).toBeVisible();
  await expect(fallback).toContainText('L’exploration 3D nécessite JavaScript.');
  await context.close();
});

test('allows page scrolling over the 3D canvas with a wheel or touch', async ({page, context, isMobile}) => {
  await page.goto('/fr');
  const viewer = await readyViewer(page);
  const bounds = await viewer.locator('canvas').boundingBox();
  if (!bounds) throw new Error('The 3D canvas has no layout.');
  const x = bounds.x + bounds.width / 2;
  const y = bounds.y + bounds.height / 2;
  const before = await page.evaluate(() => scrollY);
  if (isMobile) {
    const session = await context.newCDPSession(page);
    await session.send('Input.dispatchTouchEvent', {type: 'touchStart', touchPoints: [{x, y}]});
    for (let step = 1; step <= 6; step++) {
      await session.send('Input.dispatchTouchEvent', {type: 'touchMove', touchPoints: [{x, y: y - step * 25}]});
    }
    await session.send('Input.dispatchTouchEvent', {type: 'touchEnd', touchPoints: []});
    await session.detach();
  } else {
    await page.mouse.move(x, y);
    await page.mouse.wheel(0, 250);
  }
  await expect.poll(() => page.evaluate(() => scrollY)).toBeGreaterThan(before + 30);
});
