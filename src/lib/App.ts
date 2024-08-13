import { LocalePrefix } from "next-intl/routing";

const localePrefix: LocalePrefix = 'as-needed';

export const App = {
  name: 'SaaS Template',
  locales: [
    {
      id: 'en',
      name: 'English',
    },
    { id: 'fr', name: 'Français' },
    { id: 'es', name: 'Español' },
    { id: 'de', name: 'Deutsch' },
  ],
  defaultLocale: 'en',
  localePrefix,
};

export const AllLocales = App.locales.map((locale) => locale.id);
