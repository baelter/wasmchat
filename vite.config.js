import { defineConfig } from 'vite';

export default defineConfig({
  root: './src',
  publicDir: '../public',
  envDir: '../', // Look for .env files in the project root
  build: {
    outDir: '../dist',
    emptyOutDir: true,
  },
  server: {
    port: 3000,
    open: true,
  },
  optimizeDeps: {
    exclude: ['@cloudamqp/amqp-client']
  }
});
