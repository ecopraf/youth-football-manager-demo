import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';

// Versione software (allineata con backend)
const SW_VERSION = 'v3.14';

const BUILD_COUNTER_FILE = path.resolve(__dirname, '.build-counter.json');

function getBuildCounter() {
  try {
    if (fs.existsSync(BUILD_COUNTER_FILE)) {
      const data = JSON.parse(fs.readFileSync(BUILD_COUNTER_FILE, 'utf8'));
      // Reset counter se la versione è cambiata
      if (data.version === SW_VERSION) {
        return data.counter;
      }
    }
  } catch {
    // File non esiste o errore di lettura
  }
  return 0;
}

function saveBuildCounter(counter) {
  const data = {
    version: SW_VERSION,
    counter: counter,
    updatedAt: new Date().toISOString()
  };
  fs.writeFileSync(BUILD_COUNTER_FILE, JSON.stringify(data, null, 2));
}

function generateBuildInfo() {
  const currentCounter = getBuildCounter();
  const newCounter = currentCounter + 1;
  saveBuildCounter(newCounter);
  
  const buildId = `${SW_VERSION}.${newCounter}`;
  const now = new Date();
  const buildInfo = `// Auto-generated build info
// SW Version: ${SW_VERSION}
// Build Number: ${newCounter}
// Build ID: ${buildId}
// Date: ${now.toLocaleString('it-IT')}
export const BUILD_INFO = {
  id: '${buildId}',
  version: '${SW_VERSION}',
  buildNumber: ${newCounter},
  date: '${now.toISOString()}',
  buildDate: '${now.toLocaleString('it-IT')}'
};
export const SW_VERSION = '${SW_VERSION}';
`;
  const filePath = path.resolve(__dirname, 'src/build-info.js');
  fs.writeFileSync(filePath, buildInfo);
  console.log(`Build ID: ${buildId}`);
}

export default defineConfig({
  plugins: [
    tailwindcss(),
    {
      name: 'build-info',
      buildStart() {
        generateBuildInfo();
      }
    }
  ],
  build: {
    outDir: 'dist',
    rollupOptions: {
      input: {
        main: 'index.html'
      }
    }
  },
  server: {
    port: 8080
  }
});
