import { LocalePrefix } from "next-intl/routing";
import packageJson from '../../package.json'
const localePrefix: LocalePrefix = 'as-needed';

export const App = {
  name: packageJson.displayName,
  description: packageJson.description, 
  url: "https://tonestar-music.vercel.app/app",
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
  logoUrl: "/logo.png",
  ogImage: "https://github.com/DigitalCreationsCo/tonestar/blob/master/og-image.png?raw=true"
};

export const AllLocales = App.locales.map((locale) => locale.id);
