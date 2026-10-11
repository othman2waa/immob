import {spawnSync} from 'node:child_process';
import pg from 'pg';
import {getCloudDemoConfiguration} from './cloud-demo-config.ts';

// This explicit one-time job only initializes the isolated demo resource.
const configuration = getCloudDemoConfiguration(process.env);
const client = new pg.Client({connectionString: configuration.bootstrapUrl, connectionTimeoutMillis: 15_000, query_timeout: 30_000});
try {
  await client.connect();
  const existing = await client.query('SELECT datname FROM pg_database WHERE datname = $1', ['immob_dev']);
  if (existing.rows.length === 0) await client.query('CREATE DATABASE immob_dev');
  console.log('Dedicated demo database is available. Existing records are preserved.');
} catch {
  console.error('Could not prepare the dedicated demo database. No connection details logged.');
  process.exitCode = 1;
} finally {
  await client.end();
}
if (process.exitCode) process.exit(process.exitCode);

for (const command of ['db:migrate', 'db:seed']) {
  const result = spawnSync('pnpm', [command], {
    env: {...process.env, NODE_ENV: 'development', DATABASE_URL: configuration.runtimeUrl, DIRECT_DATABASE_URL: configuration.directUrl},
    encoding: 'utf8', timeout: 120_000
  });
  if (result.status !== 0) {
    console.error(`Cloud demo initialization failed during ${command}. No connection details logged.`);
    process.exit(result.status ?? 1);
  }
  console.log(`${command} completed for the dedicated demo database.`);
}
