import { defineConfig } from '@playwright/test';

export default defineConfig({
    testDir: './e2e',
    timeout: 15_000,
    retries: 1,
    use: {
        baseURL: 'http://localhost:4173',
        headless: true,
    },
    webServer: {
        command: 'npm run preview',
        port: 4173,
        reuseExistingServer: true,
        timeout: 30_000,
    },
});
