import withBundleAnalyzer from '@next/bundle-analyzer';
import withNextIntl from 'next-intl/plugin';

const withNextIntlConfig = withNextIntl('./src/lib/i18n.ts');

const bundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  });

/** @type {import('next').NextConfig} */
export default bundleAnalyzer(
    withNextIntlConfig({})
);
