import 'server-only';
import {db} from '@/lib/db';
import type {Locale} from '@/i18n/routing';

export async function getFoundationOverview(locale: Locale) {
  const [projects, unitCount, cityRows] = await db.$transaction([
    db.project.findMany({where: {publicationStatus: 'PUBLISHED'}, orderBy: [{featured: 'desc'}, {slug: 'asc'}], take: 6, include: {translations: {where: {locale}}}}),
    db.unit.count({where: {project: {publicationStatus: 'PUBLISHED'}}}),
    db.project.findMany({where: {publicationStatus: 'PUBLISHED'}, distinct: ['city'], select: {city: true}})
  ]);
  return {projects, unitCount, cityCount: cityRows.length};
}
