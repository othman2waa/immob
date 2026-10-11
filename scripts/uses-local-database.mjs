import 'dotenv/config';
const url = new URL(process.env.DATABASE_URL ?? 'postgresql://invalid/unknown');
process.exit(['127.0.0.1', 'localhost'].includes(url.hostname) && url.port === '5433' ? 0 : 1);
