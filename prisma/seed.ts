import 'dotenv/config';
import {Prisma, PublicationStatus} from '@prisma/client';
import {demoProjects, demoLocales, createDemoUnits} from './demo-data';
import {assertDemoDatabase} from './seed-guard';
import {createPrismaClient} from '../src/lib/prisma-client';

assertDemoDatabase(process.env);
const prisma = createPrismaClient();

async function main() {
  await prisma.$transaction(async (tx) => {
    for (const [index, project] of demoProjects.entries()) {
      const units = createDemoUnits(project);
      const availablePrices = units.filter((unit) => unit.status === 'AVAILABLE' && unit.price !== null).map((unit) => unit.price!);
      const priceFrom = availablePrices.reduce<Prisma.Decimal | null>((min, price) => min === null || price.lessThan(min) ? price : min, null);
      await tx.project.upsert({
        where: {id: project.id}, update: {},
        create: {
          id: project.id, slug: project.slug, city: project.city, neighborhood: project.neighborhood,
          lat: new Prisma.Decimal(project.lat), lng: new Prisma.Decimal(project.lng),
          status: project.status, publicationStatus: PublicationStatus.PUBLISHED, progressPercent: project.progress,
          deliveryDate: new Date(project.status === 'DELIVERED' ? '2026-06-01T00:00:00Z' : '2028-06-01T00:00:00Z'),
          priceFrom, featured: index < 3, types: [...new Set(units.map((unit) => unit.type))],
          amenities: project.type === 'LAND' ? ['road-access', 'utilities'] : ['parking', 'security'],
          translations: {create: demoLocales.map((locale) => ({
            locale, title: project.titles[locale], seoTitle: project.titles[locale],
            seoDescription: locale === 'fr' ? `Projet fictif à ${project.city} — données de démonstration.` : locale === 'en' ? `Fictitious project in ${project.city} — demonstration data.` : 'مشروع وهمي — بيانات تجريبية.',
            description: {type: 'doc', content: [{type: 'paragraph', text: locale === 'fr' ? 'Programme fictif conçu pour tester la plateforme. Les surfaces et les prix sont indicatifs.' : locale === 'en' ? 'Fictitious development for platform testing. Areas and prices are illustrative.' : 'مشروع وهمي لاختبار المنصة. المساحات والأسعار لأغراض العرض فقط.'}]}
          }))}
        }
      });
      for (const unit of units) {
        await tx.unit.upsert({where: {id: unit.id}, update: {}, create: unit});
      }
    }
  }, {timeout: 30_000});
  const projects = await prisma.project.count({where: {id: {in: demoProjects.map((project) => project.id)}}});
  const units = await prisma.unit.count({where: {projectId: {in: demoProjects.map((project) => project.id)}}});
  console.log(`Demo seed complete: ${projects} projects and ${units} units. Existing records preserved.`);
}

main().catch(() => {
  console.error('Demo seed failed. Check database connectivity and schema; no credentials logged.');
  process.exitCode = 1;
}).finally(() => prisma.$disconnect());
