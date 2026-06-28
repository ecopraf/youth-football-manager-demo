import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

// Versione software (allineata con backend)
const SW_VERSION = 'v3.14';

// Ottieni git commit hash (short, 7 chars)
function getGitHash() {
  try {
    const hash = execSync('git rev-parse --short HEAD', { cwd: __dirname }).toString().trim();
    return hash;
  } catch {
    return 'unknown';
  }
}

function generateBuildInfo() {
  const gitHash = getGitHash();
  const buildId = `${SW_VERSION}.${gitHash}`;
  const buildInfo = `// Auto-generated build info
// SW Version: ${SW_VERSION}
// Git Hash: ${gitHash}
// Date: ${new Date().toISOString()}
export const BUILD_INFO = {
  id: '${buildId}',
  version: '${SW_VERSION}',
  gitHash: '${gitHash}',
  date: '${new Date().toISOString()}'
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
