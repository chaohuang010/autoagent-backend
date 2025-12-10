
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  // Vite automatically loads .env files starting with VITE_
  // No need to manually define process.env for standard Vite usage unless using legacy libs
  define: {
    // Some legacy libs might verify process.env
    'process.env': {}
  }
});
