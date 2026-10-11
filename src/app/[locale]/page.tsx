import type {Metadata} from 'next';
import Image from 'next/image';
import {hasLocale} from 'next-intl';
import {getTranslations, setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {ArrowDown, ArrowUpRight, ArrowRight, Sun, Leaf, Move3d, MapPin, Building2} from 'lucide-react';
import {routing} from '@/i18n/routing';
import {Link} from '@/i18n/navigation';
import {getFoundationOverview} from '@/features/projects/queries';
import {projectPhotos, defaultProjectPhoto} from '@/features/projects/photos';
import {MotionRoot} from '@/components/public/motion-root';
import {TiltCard} from '@/components/public/tilt-card';
import {ArchitectureViewer} from '@/components/public/architecture-viewer';
import {Button} from '@/components/ui/button';

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
  const viewerLabels = {
    loading: t('viewer.loading'), description: t('viewer.description'), fallback: t('viewer.fallback'),
    inspiration: t('viewer.inspiration'), instructions: t('viewer.instructions'),
    rotateLeft: t('viewer.rotateLeft'), rotateRight: t('viewer.rotateRight'), zoomIn: t('viewer.zoomIn'),
    zoomOut: t('viewer.zoomOut'), reset: t('viewer.reset'), pause: t('viewer.pause'), play: t('viewer.play'), noScript: t('viewer.noScript')
  };

  return <MotionRoot>
    <a href="#main" className="skip-link">{t('skip')}</a>
    <header className="site-header">
      <div className="header-inner page-width">
        <Link href="/" className="brand" dir="ltr" aria-label={t('home')}><Building2 aria-hidden="true" size={25} strokeWidth={1.25} /><span>immob<span className="brand-dot">.</span></span></Link>
        <nav className="primary-nav" aria-label={t('navigation')}>
          <a href="#projects">{t('navProjects')}</a><a href="#vision">{t('navVision')}</a><a href="#experience">{t('navExperience')}<span className="nav-new">3D</span></a>
        </nav>
        <nav aria-label={t('languages')} className="language-nav">
          {routing.locales.map((language) => <Link key={language} href="/" locale={language} hrefLang={language} lang={language} className="language-link" aria-current={language === locale ? 'page' : undefined}>{language === 'fr' ? 'FR' : language === 'en' ? 'EN' : 'العربية'}</Link>)}
        </nav>
      </div>
      <div className="scroll-progress" aria-hidden="true" />
    </header>
    <main id="main">
      <section className="hero page-width" aria-labelledby="hero-title">
        <div className="hero-copy">
          <p className="eyebrow hero-enter"><span className="eyebrow-line" />{t('eyebrow')}</p>
          <h1 id="hero-title" className="hero-enter hero-title">{t.rich('titleRich', {accent: (children) => <em>{children}</em>})}</h1>
          <p className="hero-description hero-enter">{t('description')}</p>
          <div className="hero-actions hero-enter">
            <Button asChild className="primary-button"><a href="#projects">{t('exploreProjects')}<ArrowUpRight size={18} className="directional-arrow" aria-hidden="true" /></a></Button>
            <a href="#experience" className="text-link"><Move3d size={18} aria-hidden="true" />{t('explore3d')}</a>
          </div>
          <a href="#projects" className="scroll-cue"><span className="scroll-cue-icon"><ArrowDown size={15} aria-hidden="true" /></span>{t('scrollHint')}</a>
        </div>
        <div className="hero-visual hero-enter">
          <TiltCard className="hero-photo-card">
            <div className="hero-photo-frame" data-parallax>
              <Image src="/images/hero-villa.webp" alt={t('photos.poolVilla')} fill preload sizes="(min-width: 1100px) 48vw, (min-width: 700px) 60vw, 100vw" className="parallax-media hero-photo" />
            </div>
            <div className="hero-photo-caption"><span>{t('heroCollection')}</span><span>01 — 06</span></div>
          </TiltCard>
          <div className="hero-location"><MapPin size={14} aria-hidden="true" /><span>{t('heroLocation')}</span></div>
          <div className="floating-note"><Sun className="note-symbol" size={32} strokeWidth={1.2} aria-hidden="true" /><div><strong>{t('heroNote')}</strong><span>{t('heroNoteDetail')}</span></div></div>
          <span className="hero-outline" aria-hidden="true" />
        </div>
      </section>
      <section className="stats-strip" aria-label={t('numbersLabel')}>
        <div className="stats-inner page-width" data-reveal>
          <p className="stats-intro">{t('numbersIntro')}</p>
          <dl className="stats-grid">
            <div><dt>{t('cities')}</dt><dd data-testid="city-count">{cityCount.toLocaleString(locale)}</dd></div>
            <div><dt>{t('projects')}</dt><dd data-testid="project-count">{projects.length.toLocaleString(locale)}</dd></div>
            <div><dt>{t('units')}</dt><dd data-testid="unit-count">{unitCount.toLocaleString(locale)}</dd></div>
          </dl>
        </div>
      </section>
      <section id="projects" className="collection-section page-width" aria-labelledby="projects-title">
        <div className="section-heading" data-reveal><div><p className="eyebrow">01 / {t('collectionEyebrow')}</p><h2 id="projects-title">{t('collection')}</h2></div><p>{t('collectionDescription')}</p></div>
        <div className="project-grid">
          {projects.map((project, index) => {
            const photo = projectPhotos[project.slug] ?? defaultProjectPhoto;
            return <div key={project.id} data-reveal style={{'--reveal-delay': `${index % 3 * 75}ms`} as React.CSSProperties}>
              <TiltCard><article data-testid="project-card" className="project-card">
                <div className="project-photo-frame"><Image src={photo.src} alt={t(`photos.${photo.altKey}`)} fill sizes="(min-width: 1100px) 30vw, (min-width: 700px) 45vw, 100vw" className="project-photo" /><span className="project-status">{t(`statuses.${project.status}`)}</span><span className="photo-mark" aria-hidden="true">{String(index + 1).padStart(2, '0')}</span></div>
                <div className="project-copy"><p className="project-location"><MapPin size={12} aria-hidden="true" />{project.city} · {project.neighborhood}</p><h3>{project.translations[0]?.title ?? t('untranslated')}</h3><div className="project-card-bottom"><p>{project.priceFrom === null ? t('onRequest') : t('from', {price: new Intl.NumberFormat(locale, {style: 'currency', currency: 'MAD', maximumFractionDigits: 0}).format(Number(project.priceFrom))})}</p><span className="project-type">{t(`types.${project.types.includes('VILLA') ? 'VILLA' : project.types.includes('COMMERCIAL') ? 'COMMERCIAL' : project.types.includes('LAND') ? 'LAND' : 'APARTMENT'}`)}</span></div></div>
              </article></TiltCard>
            </div>;
          })}
        </div>
        <p className="demo-disclaimer" role="note">{t('demo')}</p>
      </section>
      <section id="vision" className="vision-section">
        <div className="vision-inner page-width">
          <div className="vision-photos" data-reveal>
            <div className="vision-main-photo" data-parallax><Image src="/images/villas-des-palmiers.webp" alt={t('photos.gardenVilla')} fill sizes="(min-width: 1100px) 42vw, 100vw" className="parallax-media" /></div>
            <div className="vision-detail-photo"><Image src="/images/interior-detail.webp" alt={t('photos.livingSpace')} fill sizes="(min-width: 700px) 220px, 150px" /></div>
            <span className="vision-photo-label">{t('visionPhotoLabel')}</span>
          </div>
          <div className="vision-copy" data-reveal><p className="eyebrow">02 / {t('visionEyebrow')}</p><h2>{t('visionTitle')}</h2><p className="vision-description">{t('visionDescription')}</p><div className="vision-values"><div><Sun size={22} strokeWidth={1.3} aria-hidden="true" /><div><h3>{t('valueLight')}</h3><p>{t('valueLightDescription')}</p></div></div><div><Leaf size={22} strokeWidth={1.3} aria-hidden="true" /><div><h3>{t('valueHarmony')}</h3><p>{t('valueHarmonyDescription')}</p></div></div></div><a href="#experience" className="text-link">{t('visionAction')}<ArrowRight size={17} className="directional-arrow" aria-hidden="true" /></a></div>
        </div>
      </section>
      <section id="experience" className="experience-section page-width" aria-labelledby="experience-title">
        <div className="section-heading" data-reveal><div><p className="eyebrow">03 / {t('experienceEyebrow')}</p><h2 id="experience-title">{t('experienceTitle')}</h2></div><p>{t('experienceDescription')}</p></div>
        <ArchitectureViewer labels={viewerLabels} />
      </section>
      <section className="closing-section page-width" data-reveal><p className="eyebrow">{t('closingEyebrow')}</p><h2>{t('closingTitle')}</h2><Button asChild className="primary-button"><a href="#projects">{t('exploreProjects')}<ArrowUpRight size={18} className="directional-arrow" aria-hidden="true" /></a></Button></section>
    </main>
    <footer className="site-footer"><div className="page-width footer-inner"><Link href="/" className="brand" dir="ltr" aria-label={t('home')}>immob<span className="brand-dot">.</span></Link><p>{t('footer')}</p><span>{t('footerLocation')}</span></div></footer>
  </MotionRoot>;
}
