import {PlaywrightTestConfig, devices} from 'playwright_ui_tests/index';

// @ts-ignore
const config: PlaywrightTestConfig = {
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    timeout: 50000,
    workers: 5,
    use: {
        trace: 'on-first-retry',
        video: 'on-first-retry',
        screenshot: 'only-on-failure',
        ignoreHTTPSErrors: true,
        viewport: {width: 2560, height: 1600},
        baseURL: process.env.BASE_URL,
        // @ts-ignore
        sso: !!process.env.SSO,
        timeout: 15000
    },
    projects: [
        {
            name: 'chromium',
            use: {...devices['Desktop Chrome']}
        }
    ]
};

export default config;
