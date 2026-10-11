import 'dotenv/config';
import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {baseURL: 'http://127.0.0.1:3000', trace: 'retain-on-failure', launchOptions: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH} : {}},
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}, {name: 'mobile-chromium', use: {...devices['Pixel 7']}}],
  webServer: {command: 'pnpm start --hostname 127.0.0.1', url: 'http://127.0.0.1:3000/api/health', reuseExistingServer: false, timeout: 60_000}
});
