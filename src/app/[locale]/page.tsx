import type {Metadata} from 'next';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {getFoundationOverview} from '@/features/projects/queries';
import {Button} from '@/components/ui/button';

// Read the database at request time until catalogue caching ships in phase 2.
export const dynamic = 'force-dynamic';

export async function generateMetadata({params}: {params: Promise<{locale: string}>}): Promise<Metadata> {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  const t = await getTranslations({locale, namespace: 'Home'});
  return {title: t('title'), description: t('description')};
}

export default async function HomePage({params}: {params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  const t = await getTranslations('Home');
  const {projects, unitCount, cityCount} = await getFoundationOverview(locale);
  return (
    <div className="mx-auto max-w-6xl px-5 sm:px-10">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:top-4">{t('skip')}</a>
      <header className="flex items-center justify-between gap-4 border-b border-border py-6">
        <Link href="/" className="text-xl font-semibold tracking-wide" aria-label={t('home')}>IMMOB</Link>
        <nav aria-label={t('languages')} className="flex gap-2">
          {routing.locales.map((language) => <Button key={language} variant="outline" size="sm" asChild><Link href="/" locale={language} hrefLang={language} lang={language} aria-current={language === locale ? 'page' : undefined}>{language === 'fr' ? 'FR' : language === 'en' ? 'EN' : 'العربية'}</Link></Button>)}
        </nav>
      </header>
      <main id="main" className="py-16 sm:py-24">
        <p className="mb-5 text-sm font-semibold uppercase tracking-widest text-primary">{t('eyebrow')}</p>
        <h1 className="max-w-3xl text-4xl leading-tight font-medium sm:text-6xl">{t('title')}</h1>
        <p className="mt-6 max-w-2xl text-lg leading-relaxed">{t('description')}</p>
        <p className="mt-6 rounded-md border border-border px-4 py-3 text-sm" role="note">{t('demo')}</p>
        <dl className="my-12 grid grid-cols-3 gap-4 border-y border-border py-8">
          <div><dt>{t('cities')}</dt><dd className="mt-2 text-3xl font-semibold" data-testid="city-count">{cityCount.toLocaleString(locale)}</dd></div>
          <div><dt>{t('projects')}</dt><dd className="mt-2 text-3xl font-semibold" data-testid="project-count">{projects.length.toLocaleString(locale)}</dd></div>
          <div><dt>{t('units')}</dt><dd className="mt-2 text-3xl font-semibold" data-testid="unit-count">{unitCount.toLocaleString(locale)}</dd></div>
        </dl>
        <section aria-labelledby="projects-title">
          <h2 id="projects-title" className="mb-6 text-2xl font-medium">{t('collection')}</h2>
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {projects.map((project) => <article key={project.id} data-testid="project-card" className="rounded-lg border border-border bg-white/50 p-6">
              <p className="mb-3 text-sm text-primary">{project.city} · {project.neighborhood}</p>
              <h3 className="text-xl font-medium">{project.translations[0]?.title ?? t('untranslated')}</h3>
              <p className="mt-5 text-sm">{project.priceFrom === null ? t('onRequest') : t('from', {price: new Intl.NumberFormat(locale, {style: 'currency', currency: 'MAD', maximumFractionDigits: 0}).format(Number(project.priceFrom))})}</p>
            </article>)}
          </div>
        </section>
      </main>
      <footer className="border-t border-border py-6 text-sm">{t('footer')}</footer>
    </div>
  );
}
