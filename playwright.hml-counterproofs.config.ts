import { defineConfig, devices } from '@playwright/test';
export default defineConfig({
 testDir:'./tests/hml/counterproofs',testMatch:/\.spec\.ts$/,fullyParallel:false,
 forbidOnly:true,retries:0,workers:1,timeout:45000,expect:{timeout:12000},
 reporter:[['list'],['json',{outputFile:'artifacts/hml-counterproofs/playwright-results.json'}]],
 use:{baseURL:process.env.CONTAOS_HML_FRONTEND_URL,...devices['Desktop Chrome'],trace:'off',screenshot:'off',video:'off',ignoreHTTPSErrors:false}
});
