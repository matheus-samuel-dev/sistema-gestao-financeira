import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  build: {
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.indexOf('node_modules') === -1) {
            return undefined;
          }

          const normalizedId = id.split('\\').join('/');

          if (
            normalizedId.indexOf('/node_modules/react/') !== -1 ||
            normalizedId.indexOf('/node_modules/react-dom/') !== -1 ||
            normalizedId.indexOf('/node_modules/scheduler/') !== -1
          ) {
            return 'vendor-react';
          }
          if (
            normalizedId.indexOf('/node_modules/@mui/') !== -1 ||
            normalizedId.indexOf('/node_modules/@emotion/') !== -1 ||
            normalizedId.indexOf('/node_modules/prop-types/') !== -1 ||
            normalizedId.indexOf('/node_modules/react-is/') !== -1 ||
            normalizedId.indexOf('/node_modules/react-transition-group/') !== -1
          ) {
            return 'vendor-mui';
          }
          if (id.indexOf('recharts') !== -1 || id.indexOf('d3-') !== -1) {
            return 'vendor-charts';
          }
          if (id.indexOf('html2canvas') !== -1) {
            return 'vendor-canvas';
          }
          if (id.indexOf('dompurify') !== -1) {
            return 'vendor-purify';
          }
          if (id.indexOf('jspdf-autotable') !== -1) {
            return 'vendor-pdf-table';
          }
          if (id.indexOf('jspdf') !== -1) {
            return 'vendor-pdf';
          }
          if (id.indexOf('xlsx') !== -1) {
            return 'vendor-xlsx';
          }

          return undefined;
        },
      },
    },
  },
  server: {
    host: '0.0.0.0',
    port: 5176,
    strictPort: true,
    hmr: {
      clientPort: 5176,
    },
  },
});
