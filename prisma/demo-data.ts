import {Prisma, PropertyType, UnitStatus, ProjectStatus, Locale} from '@prisma/client';
import {unitInputSchema} from '../src/lib/property-validation';

export const demoProjects = [
  {id: 'demo_project_atlas', slug: 'residence-atlas', city: 'Marrakech', neighborhood: 'Guéliz', lat: '31.6342', lng: '-8.0106', status: ProjectStatus.IN_PROGRESS, progress: 62, count: 8, type: PropertyType.APARTMENT, basePrice: 1_450_000, titles: {fr: 'Résidence Atlas', en: 'Atlas Residence', ar: 'إقامة أطلس'}},
  {id: 'demo_project_palmiers', slug: 'villas-des-palmiers', city: 'Marrakech', neighborhood: 'Targa', lat: '31.6601', lng: '-8.0694', status: ProjectStatus.COMING_SOON, progress: 12, count: 7, type: PropertyType.VILLA, basePrice: 3_950_000, titles: {fr: 'Villas des Palmiers', en: 'Palm Villas', ar: 'فلل النخيل'}},
  {id: 'demo_project_agdal', slug: 'les-jardins-agdal', city: 'Marrakech', neighborhood: 'Agdal', lat: '31.5906', lng: '-7.9892', status: ProjectStatus.DELIVERED, progress: 100, count: 7, type: PropertyType.APARTMENT, basePrice: 950_000, titles: {fr: 'Les Jardins d’Agdal', en: 'Agdal Gardens', ar: 'حدائق أكدال'}},
  {id: 'demo_project_anfa', slug: 'anfa-horizon', city: 'Casablanca', neighborhood: 'Anfa', lat: '33.5918', lng: '-7.6575', status: ProjectStatus.IN_PROGRESS, progress: 44, count: 6, type: PropertyType.APARTMENT, basePrice: 2_100_000, titles: {fr: 'Anfa Horizon', en: 'Anfa Horizon', ar: 'أفق أنفا'}},
  {id: 'demo_project_casa', slug: 'casa-commerces', city: 'Casablanca', neighborhood: 'Sidi Maarouf', lat: '33.5323', lng: '-7.6366', status: ProjectStatus.DELIVERED, progress: 100, count: 6, type: PropertyType.COMMERCIAL, basePrice: 1_250_000, titles: {fr: 'Casa Commerces', en: 'Casa Commercial', ar: 'كازا للمحلات التجارية'}},
  {id: 'demo_project_rabat', slug: 'rabat-parc', city: 'Rabat', neighborhood: 'Hay Riad', lat: '33.9513', lng: '-6.8652', status: ProjectStatus.COMING_SOON, progress: 0, count: 6, type: PropertyType.LAND, basePrice: 2_650_000, titles: {fr: 'Rabat Parc', en: 'Rabat Park', ar: 'حدائق الرباط'}}
] as const;

export function createDemoUnits(project: (typeof demoProjects)[number]) {
  return Array.from({length: project.count}, (_, index) => {
    const type = project.type === PropertyType.APARTMENT
      ? index === 0 ? PropertyType.STUDIO : index === 1 ? PropertyType.DUPLEX : PropertyType.APARTMENT
      : project.type;
    const land = type === PropertyType.LAND;
    const commercial = type === PropertyType.COMMERCIAL;
    const villa = type === PropertyType.VILLA;
    const surface = land ? 240 + index * 30 : villa ? 185 + index * 12 : commercial ? 62 + index * 16 : type === PropertyType.STUDIO ? 42 : 76 + index * 9;
    const price = commercial && index === 5 ? null : project.basePrice + index * (villa ? 150_000 : 85_000);
    const unit = {
      reference: `${project.slug.toUpperCase()}-${String(index + 1).padStart(2, '0')}`,
      surface,
      price,
      floor: land ? null : villa || commercial ? 0 : index % 5,
      bedrooms: land || commercial ? null : villa ? 4 : type === PropertyType.STUDIO ? 0 : index % 3 + 1,
      bathrooms: land ? null : commercial ? 1 : villa ? 3 : 2
    };
    unitInputSchema.parse(unit);
    return {
      ...unit,
      id: `${project.id}_unit_${index + 1}`,
      projectId: project.id,
      type,
      surface: new Prisma.Decimal(unit.surface),
      price: unit.price === null ? null : new Prisma.Decimal(unit.price),
      status: index % 5 === 3 ? UnitStatus.RESERVED : index % 5 === 4 ? UnitStatus.SOLD : UnitStatus.AVAILABLE
    };
  });
}

export const demoLocales = [Locale.fr, Locale.en, Locale.ar] as const;
