import withBundleAnalyzer from '@next/bundle-analyzer';


const bundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  });

/** @type {import('next').NextConfig} */
export default bundleAnalyzer({});
