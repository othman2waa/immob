import {randomBytes} from 'node:crypto';
import {existsSync, writeFileSync} from 'node:fs';

if (existsSync('.env')) {
  console.log('Existing .env preserved.');
} else if (process.env.DATABASE_URL) {
  console.log('Using injected database configuration; no local file created.');
} else {
  const password = randomBytes(24).toString('hex');
  const url = `postgresql://immob:${password}@127.0.0.1:5433/immob_dev`;
  writeFileSync('.env', [
    `DATABASE_URL="${url}"`,
    `DIRECT_DATABASE_URL="${url}"`,
    `POSTGRES_PASSWORD="${password}"`,
    'ALLOW_DEMO_SEED="true"',
    'NEXT_PUBLIC_SITE_URL="http://localhost:3000"',
    ''
  ].join('\n'), {flag: 'wx', mode: 0o600});
  console.log('Created ignored local development configuration.');
}
