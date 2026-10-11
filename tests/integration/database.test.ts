import 'dotenv/config';
import {execFileSync} from 'node:child_process';
import {Prisma} from '@prisma/client';
import {afterAll, describe, expect, it} from 'vitest';
import {assertDemoDatabase} from '../../prisma/seed-guard';
import {demoProjects} from '../../prisma/demo-data';
import {createPrismaClient} from '../../src/lib/prisma-client';

assertDemoDatabase(process.env);
const prisma = createPrismaClient();
afterAll(() => prisma.$disconnect());

function seed() {
  execFileSync('pnpm', ['db:seed'], {stdio: 'pipe', env: process.env});
}

async function rejectsDatabaseWrite(change: (tx: Prisma.TransactionClient) => Promise<unknown>, kind: 'check' | 'foreign' | 'unique') {
  const rollback = new Error('ROLLBACK_TEST_WRITE');
  try {
    await prisma.$transaction(async (tx) => {
      await change(tx);
      // Validation writes are rolled back even if a constraint is missing.
      throw rollback;
    });
  } catch (error) {
    expect(error).not.toBe(rollback);
    if (kind === 'check') {
      // The JS adapter preserves PostgreSQL's CHECK violation SQLSTATE.
      expect(error).toMatchObject({name: 'DriverAdapterError', cause: {kind: 'postgres', originalCode: '23514'}});
    } else {
      expect(error).toBeInstanceOf(Prisma.PrismaClientKnownRequestError);
      expect((error as Prisma.PrismaClientKnownRequestError).code).toBe(kind === 'foreign' ? 'P2003' : 'P2002');
    }
    return;
  }
  throw new Error('Expected a database constraint rejection.');
}

describe('PostgreSQL schema and additive seed', () => {
  it('seeds twice with stable counts and relationships', async () => {
    seed();
    const before = await prisma.unit.findMany({where: {projectId: {in: demoProjects.map((project) => project.id)}}, orderBy: {id: 'asc'}});
    seed();
    const after = await prisma.unit.findMany({where: {projectId: {in: demoProjects.map((project) => project.id)}}, orderBy: {id: 'asc'}});
    expect(after).toEqual(before);
    expect(after).toHaveLength(40);
    const projects = await prisma.project.findMany({where: {id: {in: demoProjects.map((project) => project.id)}}, include: {translations: true}});
    expect(projects).toHaveLength(6);
    expect(new Set(projects.map((project) => project.city)).size).toBe(3);
    expect(projects.every((project) => project.translations.length === 3)).toBe(true);
  });
  it('preserves editor changes on rerun', async () => {
    const id = 'demo_project_atlas';
    const original = await prisma.project.findUniqueOrThrow({where: {id}});
    try {
      await prisma.project.update({where: {id}, data: {featured: !original.featured}});
      seed();
      expect((await prisma.project.findUniqueOrThrow({where: {id}})).featured).toBe(!original.featured);
    } finally {
      await prisma.project.update({where: {id}, data: {featured: original.featured}});
    }
  });
  it('rejects invalid prices, surfaces, progression and foreign keys in PostgreSQL', async () => {
    const projectId = 'demo_project_atlas';
    await rejectsDatabaseWrite((tx) => tx.project.update({where: {id: projectId}, data: {progressPercent: 101}}), 'check');
    await rejectsDatabaseWrite((tx) => tx.project.update({where: {id: projectId}, data: {priceFrom: -1}}), 'check');
    await rejectsDatabaseWrite((tx) => tx.unit.update({where: {id: `${projectId}_unit_1`}, data: {surface: 0}}), 'check');
    await rejectsDatabaseWrite((tx) => tx.unit.update({where: {id: `${projectId}_unit_1`}, data: {price: -1}}), 'check');
    await rejectsDatabaseWrite((tx) => tx.unit.update({where: {id: `${projectId}_unit_1`}, data: {projectId: 'missing'}}), 'foreign');
  });
  it('rejects duplicate references and locale rows', async () => {
    const unit = await prisma.unit.findUniqueOrThrow({where: {id: 'demo_project_atlas_unit_1'}});
    await rejectsDatabaseWrite((tx) => tx.unit.create({data: {...unit, id: 'constraint-test-duplicate'}}), 'unique');
    await rejectsDatabaseWrite((tx) => tx.projectTranslation.create({data: {projectId: unit.projectId, locale: 'fr', title: 'Duplicate', description: {}}}), 'unique');
  });
});
