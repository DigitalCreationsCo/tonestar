import { LocalePrefix } from "next-intl/routing";

const localePrefix: LocalePrefix = 'as-needed';

export const App = {
  name: 'AI SAAS TEMPLATE',
  description: "Build an AI product with production-grade features out of the box",
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
