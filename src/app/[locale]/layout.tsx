import type {Metadata} from 'next';
import localFont from 'next/font/local';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import '../globals.css';


const bodyFont = localFont({src: '../../../node_modules/@fontsource-variable/manrope/files/manrope-latin-wght-normal.woff2', variable: '--font-body', display: 'swap', weight: '200 800'});
const displayFont = localFont({src: [
  {path: '../../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-normal.woff2', weight: '500', style: 'normal'},
  {path: '../../../node_modules/@fontsource/cormorant-garamond/files/cormorant-garamond-latin-500-italic.woff2', weight: '500', style: 'italic'}
], variable: '--font-display', display: 'swap'});
const arabicFont = localFont({src: '../../../node_modules/@fontsource-variable/noto-sans-arabic/files/noto-sans-arabic-arabic-wght-normal.woff2', variable: '--font-arabic', display: 'swap', weight: '100 900', preload: false});

export const metadata: Metadata = {title: {default: 'Immob — Immobilier neuf au Maroc', template: '%s | Immob'}, description: 'Découvrez nos projets immobiliers neufs au Maroc.'};

export default async function LocaleLayout({children, params}: {children: React.ReactNode; params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return <html className={`${bodyFont.variable} ${displayFont.variable} ${arabicFont.variable}`} lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}><body><NextIntlClientProvider>{children}</NextIntlClientProvider></body></html>;
}
