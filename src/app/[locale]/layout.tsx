import type {Metadata} from 'next';
import {NextIntlClientProvider, hasLocale} from 'next-intl';
import {setRequestLocale} from 'next-intl/server';
import {notFound} from 'next/navigation';
import {routing} from '@/i18n/routing';
import '../globals.css';

export const metadata: Metadata = {title: {default: 'Immob — Immobilier neuf au Maroc', template: '%s | Immob'}, description: 'Découvrez nos projets immobiliers neufs au Maroc.'};

export default async function LocaleLayout({children, params}: {children: React.ReactNode; params: Promise<{locale: string}>}) {
  const {locale} = await params;
  if (!hasLocale(routing.locales, locale)) notFound();
  setRequestLocale(locale);
  return <html lang={locale} dir={locale === 'ar' ? 'rtl' : 'ltr'}><body><NextIntlClientProvider>{children}</NextIntlClientProvider></body></html>;
}
