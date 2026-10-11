import {describe, expect, it} from 'vitest';
import {getCloudDemoConfiguration} from '../../scripts/cloud-demo-config';

const environment = {
  ALLOW_DEMO_SEED: 'true', NODE_ENV: 'production',
  DATABASE_URL: 'postgresql://demo:fixture-password@ep-demo-pooler.eu.neon.tech/immob_dev?sslmode=require',
  DIRECT_DATABASE_URL: 'postgresql://demo:fixture-password@ep-demo.eu.neon.tech/immob_dev?sslmode=require',
  DEMO_DATABASE_URL_UNPOOLED: 'postgresql://demo:fixture-password@ep-demo.eu.neon.tech/neondb?sslmode=require'
} as const;

describe('explicit cloud demo initialization', () => {
  it('accepts matching pooled/direct connections for the dedicated demo database', () => {
    expect(getCloudDemoConfiguration(environment).directUrl).toBe(environment.DIRECT_DATABASE_URL);
  });
  it('requires explicit demo consent even in a build environment', () => {
    expect(() => getCloudDemoConfiguration({...environment, ALLOW_DEMO_SEED: undefined})).toThrow();
  });
  it('refuses to initialize a customer database', () => {
    expect(() => getCloudDemoConfiguration({...environment, DATABASE_URL: environment.DATABASE_URL.replace('/immob_dev', '/customers')})).toThrow();
  });
  it('refuses connections to a different resource or role', () => {
    expect(() => getCloudDemoConfiguration({...environment, DIRECT_DATABASE_URL: environment.DIRECT_DATABASE_URL.replace('ep-demo.', 'ep-other.')})).toThrow();
    expect(() => getCloudDemoConfiguration({...environment, DIRECT_DATABASE_URL: environment.DIRECT_DATABASE_URL.replace('demo:', 'other:')})).toThrow();
  });
  it('refuses non-PostgreSQL connections and explicitly disabled TLS', () => {
    expect(() => getCloudDemoConfiguration({...environment, DATABASE_URL: environment.DATABASE_URL.replace('postgresql:', 'https:')})).toThrow();
    expect(() => getCloudDemoConfiguration({...environment, DATABASE_URL: environment.DATABASE_URL.replace('sslmode=require', 'sslmode=disable')})).toThrow();
  });
});
