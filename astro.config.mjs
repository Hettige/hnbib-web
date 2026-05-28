import { defineConfig } from 'astro/config';

export default defineConfig({
  site: process.env.SITE_URL  || 'https://hettige.github.io',
  base: process.env.BASE_PATH || '/hnbib-web',
  output: 'static',
  trailingSlash: 'always',
});
