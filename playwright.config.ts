import 'dotenv/config';
import {defineConfig, devices} from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  workers: 1,
  reporter: 'list',
  use: {baseURL: 'http://127.0.0.1:3100', trace: 'retain-on-failure', launchOptions: {
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH ? {executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH} : {}),
    ...(process.env.PLAYWRIGHT_USE_SOFTWARE_GL === '1' ? {args: ['--use-angle=swiftshader', '--enable-unsafe-swiftshader']} : {})
  }},
  projects: [{name: 'chromium', use: {...devices['Desktop Chrome']}}, {name: 'mobile-chromium', use: {...devices['Pixel 7']}}],
  webServer: {command: 'pnpm start --hostname 127.0.0.1 --port 3100', url: 'http://127.0.0.1:3100/api/health', reuseExistingServer: false, timeout: 60_000}
});
