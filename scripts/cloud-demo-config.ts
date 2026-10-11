import {z} from 'zod';
import {assertDemoDatabase} from '../prisma/seed-guard';

const configurationSchema = z.object({
  ALLOW_DEMO_SEED: z.literal('true'),
  DATABASE_URL: z.string().url(),
  DIRECT_DATABASE_URL: z.string().url(),
  DEMO_DATABASE_URL_UNPOOLED: z.string().url()
});

export function getCloudDemoConfiguration(environment: NodeJS.ProcessEnv) {
  const result = configurationSchema.safeParse(environment);
  if (!result.success) throw new Error('Explicit demo consent and cloud database connections are required.');
  const runtime = new URL(result.data.DATABASE_URL);
  const direct = new URL(result.data.DIRECT_DATABASE_URL);
  const bootstrap = new URL(result.data.DEMO_DATABASE_URL_UNPOOLED);
  const urls = [runtime, direct, bootstrap];
  if (urls.some((url) => !['postgres:', 'postgresql:'].includes(url.protocol) || !['require', 'verify-ca', 'verify-full'].includes(url.searchParams.get('sslmode') ?? ''))) {
    throw new Error('TLS PostgreSQL connections are required.');
  }
  const baseHostname = (hostname: string) => hostname.replace('-pooler.', '.');
  if (!bootstrap.hostname.endsWith('.neon.tech') || bootstrap.pathname !== '/neondb' ||
      urls.some((url) => baseHostname(url.hostname) !== bootstrap.hostname || url.username !== bootstrap.username || url.password !== bootstrap.password) ||
      direct.pathname !== '/immob_dev' || runtime.pathname !== '/immob_dev') {
    throw new Error('All connections must target the same dedicated Neon demo resource.');
  }
  assertDemoDatabase({...environment, NODE_ENV: 'development'});
  return {runtimeUrl: result.data.DATABASE_URL, directUrl: result.data.DIRECT_DATABASE_URL, bootstrapUrl: result.data.DEMO_DATABASE_URL_UNPOOLED};
}
