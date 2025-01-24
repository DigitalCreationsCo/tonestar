import { LocalePrefix } from "next-intl/routing";
import packageJson from '../../package.json'
const localePrefix: LocalePrefix = 'as-needed';

export const App = {
  name: packageJson.displayName,
  description: packageJson.description, 
  locales: [
    {
      id: 'en',
      name: 'English',
    },
    // { id: 'fr', name: 'Français' },
    // { id: 'es', name: 'Español' },
    // { id: 'de', name: 'Deutsch' },
  ],
  defaultLocale: 'en',
  localePrefix,
  logoUrl: "/logo.png"
};

export const AllLocales = App.locales.map((locale) => locale.id);
