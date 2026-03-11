const { chromium } = require('playwright');

(async () => {
    console.log("Launching playwright to reproduce navigation crash...");
    const browser = await chromium.launch({ headless: true });
    const context = await browser.newContext();
    const page = await context.newPage();

    page.on('console', msg => {
        console.log(`[BROWSER ${msg.type().toUpperCase()}]`, msg.text());
    });

    page.on('pageerror', error => {
        console.log(`[PAGE EXCEPTION!!]`, error.message);
        console.log(error.stack);
    });

    try {
        console.log("\n--- Scenario 1: Direct visit to /verify ---");
        await page.goto('http://localhost:5173/verify', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);
        let content = await page.evaluate(() => document.body.innerText);
        console.log("Content length:", content.trim().length);
        try {
            const h2 = await page.innerText('h2');
            console.log("H2 Heading:", h2);
        } catch (e) {
            console.log("H2 Heading NOT FOUND");
        }

        console.log("\n--- Scenario 2: Navigate from / to /verify ---");
        await page.goto('http://localhost:5173/', { waitUntil: 'networkidle' });
        await page.waitForTimeout(1000);

        // Click "Explore Demo" button which navigate to /verify
        console.log("Clicking Explore Demo...");
        await page.click('button:has-text("Explore Demo")');
        await page.waitForTimeout(2000);

        content = await page.evaluate(() => document.body.innerText);
        console.log("Content length after nav:", content.trim().length);
        try {
            const h2 = await page.innerText('h2');
            console.log("H2 Heading after nav:", h2);
        } catch (e) {
            console.log("H2 Heading NOT FOUND after nav");
        }
        if (content.trim().length < 50) {
            console.log("CRASH REPRODUCED: Black screen detected.");
            await page.screenshot({ path: 'black_screen_nav.png' });
        } else {
            console.log("No crash detected in Scenario 2.");
        }

        console.log("\n--- Scenario 3: Login as Org and navigate ---");
        await page.goto('http://localhost:5173/login', { waitUntil: 'networkidle' });
        console.log("Clicking Company (Organization) Demo...");
        await page.click('button:has-text("Company")');
        await page.waitForTimeout(3000);

        content = await page.evaluate(() => document.body.innerText);
        console.log("Content length after login nav:", content.trim().length);
        try {
            const h2 = await page.innerText('h2');
            console.log("H2 Heading after login nav:", h2);
        } catch (e) {
            console.log("H2 Heading NOT FOUND after login nav");
        }
        if (content.trim().length < 50) {
            console.log("CRASH REPRODUCED during login nav.");
            await page.screenshot({ path: 'black_screen_login.png' });
        } else {
            console.log("No crash detected in Scenario 3.");
        }

    } catch (e) {
        console.error("Test execution failed:", e);
    } finally {
        await browser.close();
    }
})();
