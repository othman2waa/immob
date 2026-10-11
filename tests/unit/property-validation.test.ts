import {describe, expect, it} from 'vitest';
import {projectProgressSchema, unitInputSchema} from '../../src/lib/property-validation';
import {assertDemoDatabase} from '../../prisma/seed-guard';
import {createDemoUnits, demoProjects} from '../../prisma/demo-data';
import fr from '../../src/messages/fr.json';
import en from '../../src/messages/en.json';
import ar from '../../src/messages/ar.json';

const valid = {reference: 'A-01', surface: 82.5, price: 1_200_000, floor: 2, bedrooms: 2, bathrooms: 1};
describe('property validation', () => {
  it('accepts decimal areas, a basement, and price on request', () => {
    expect(unitInputSchema.parse({...valid, floor: -1, price: null}).price).toBeNull();
  });
  it.each([{surface: 0}, {surface: -1}, {price: -10}, {bedrooms: -1}, {bathrooms: 1.5}, {reference: '   '}])('rejects invalid property fields: %j', (change) => {
    expect(unitInputSchema.safeParse({...valid, ...change}).success).toBe(false);
  });
  it('rejects invalid progress', () => {
    for (const value of [-1, 101, 50.5]) expect(projectProgressSchema.safeParse(value).success).toBe(false);
  });
});

describe('demo safety', () => {
  it('has 3 cities, 6 projects and 40 lots across all required types', () => {
    const units = demoProjects.flatMap(createDemoUnits);
    expect(new Set(demoProjects.map((project) => project.city)).size).toBe(3);
    expect(demoProjects).toHaveLength(6);
    expect(units).toHaveLength(40);
    expect(new Set(units.map((unit) => unit.id)).size).toBe(40);
    expect(new Set(units.map((unit) => unit.type)).size).toBe(6);
    expect(units.some((unit) => unit.price === null)).toBe(true);
  });
  it('requires explicit consent to seed and rejects production and unknown databases', () => {
    const env = {NODE_ENV: 'test', ALLOW_DEMO_SEED: 'true', DATABASE_URL: 'postgresql://localhost/immob_test'} as const;
    expect(() => assertDemoDatabase(env)).not.toThrow();
    expect(() => assertDemoDatabase({...env, NODE_ENV: 'production'})).toThrow();
    expect(() => assertDemoDatabase({...env, ALLOW_DEMO_SEED: ''})).toThrow();
    expect(() => assertDemoDatabase({...env, DATABASE_URL: 'postgresql://localhost/customer_data'})).toThrow();
  });
  it('has complete interface message keys in every locale', () => {
    function messageKeys(value: Record<string, unknown>, prefix = ''): string[] {
      return Object.entries(value).flatMap(([key, child]) => {
        const path = prefix ? `${prefix}.${key}` : key;
        return typeof child === 'object' && child !== null ? messageKeys(child as Record<string, unknown>, path) : [path];
      }).sort();
    }
    expect(messageKeys(en.Home)).toEqual(messageKeys(fr.Home));
    expect(messageKeys(ar.Home)).toEqual(messageKeys(fr.Home));
  });
});
