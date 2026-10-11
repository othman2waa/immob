export function assertDemoDatabase(env: NodeJS.ProcessEnv) {
  if (env.NODE_ENV === 'production' || env.ALLOW_DEMO_SEED !== 'true') {
    throw new Error('Demo writes require ALLOW_DEMO_SEED=true in a non-production environment.');
  }
  const url = new URL(env.DATABASE_URL ?? 'postgresql://invalid/unknown');
  const name = decodeURIComponent(url.pathname.slice(1));
  if (!['immob_dev', 'immob_test'].includes(name)) {
    throw new Error('Demo writes are limited to immob_dev or immob_test databases.');
  }
}
