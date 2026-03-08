const { chromium } = require('playwright');

(async () => {
    console.log("Launching playwright to capture Search Form alignment...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    try {
        await page.goto('http://localhost:5173/');
        await page.evaluate(() => {
            localStorage.setItem('trustcert_user', JSON.stringify({
                id: 'demo-org-001',
                name: 'HR Manager',
                role: 'organization',
                orgName: 'Google',
                orgType: 'organization'
            }));
        });

        await page.goto('http://localhost:5173/verify', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        await page.screenshot({ path: 'alignment_fix_verify.png' });
        console.log("Screenshot saved as alignment_fix_verify.png");

    } catch (e) {
        console.error("TEST FAILED:", e);
    } finally {
        await browser.close();
    }
})();
