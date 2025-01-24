import withBundleAnalyzer from '@next/bundle-analyzer';
import withNextIntl from 'next-intl/plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';
import fs from 'fs'

const __dirname = path.dirname(new URL(import.meta.url).pathname);

const withNextIntlConfig = withNextIntl('./src/lib/i18n.ts');

const bundleAnalyzer = withBundleAnalyzer({
    enabled: process.env.ANALYZE === 'true',
  });

/** @type {import('next').NextConfig} */
export default bundleAnalyzer(
  withNextIntlConfig({
    webpack(config, { isServer }) {
      
      // This is necessary because we only want to apply the plugin on the client side
      if (!isServer) {
        config.plugins.push(
          new CopyWebpackPlugin({
            patterns: [
              {
                from: path.resolve('node_modules/@audio-samples/piano-pedals/audio/'),
                to: path.resolve(__dirname, 'public/samples/'), 
              },
              {
                from: path.resolve('node_modules/@audio-samples/piano-velocity6/audio/'), // Path to source files in node_modules
                to ({ absoluteFilename }) { return path.resolve(__dirname, 'public/samples/', absoluteFilename.split('/').pop().replace('#', 's')); },
              },
              {
                from: path.resolve('node_modules/@audio-samples/piano-release/audio/'),
                to: path.resolve(__dirname, 'public/samples/'), 
              },
              {
                from: path.resolve('node_modules/@audio-samples/piano-harmonics/audio/'), 
                to ({ absoluteFilename }) { return path.resolve(__dirname, 'public/samples/', absoluteFilename.split('/').pop().replace('#', 's')); }, 
              },
            ],
          })
        );
      }
      return config;
    }
  })
);
