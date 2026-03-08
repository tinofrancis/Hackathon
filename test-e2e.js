const { chromium } = require('playwright');

(async () => {
    console.log("Launching playwright for full E2E application audit...");
    const browser = await chromium.launch({ headless: true });

    let crashCount = 0;

    // Helper to test a list of routes under a specific role
    async function testRoutes(roleContext, routes) {
        console.log(`\n=========================================`);
        console.log(`Testing under context: ${roleContext ? roleContext.role.toUpperCase() : 'GUEST'}`);
        console.log(`=========================================`);

        const context = await browser.newContext();
        const page = await context.newPage();

        page.on('console', msg => {
            if (msg.type() === 'error' && !msg.text().includes('favicon.ico')) {
                console.log(`[BROWSER ERROR]`, msg.text());
            }
        });

        page.on('pageerror', error => {
            crashCount++;
            console.log(`[PAGE EXCEPTION]`, error.message);
        });

        // Set role if provided
        if (roleContext) {
            await page.goto('http://localhost:5173/');
            await page.evaluate((roleData) => {
                localStorage.setItem('trustcert_user', JSON.stringify(roleData));
            }, roleContext);
        }

        for (const route of routes) {
            process.stdout.write(`Testing ${route}... `);
            try {
                await page.goto(`http://localhost:5173${route}`, { waitUntil: 'networkidle', timeout: 8000 });
                await page.waitForTimeout(500); // Give react an extra beat to crash if it's going to

                const bodyHTML = await page.evaluate(() => document.body.innerHTML);
                if (bodyHTML.length < 500) {
                    crashCount++;
                    console.log(`[FAILED] - Black Screen Detected (Length: ${bodyHTML.length})`);
                } else {
                    console.log(`[OK]`);
                }
            } catch (err) {
                crashCount++;
                console.log(`[TIMEOUT/ERROR] ${err.message}`);
            }
        }
        await context.close();
    }

    try {
        // 1. Test Unprotected & Catch-all Routes
        const publicRoutes = [
            '/', '/login', '/invalid-route-404',
            '/how-it-works', '/institutions', '/verification-apis', '/trust-network',
            '/documentation', '/privacy-policy', '/terms-of-service', '/status',
            '/help-center', '/security'
        ];
        await testRoutes(null, publicRoutes);

        // 2. Test Institution Routes
        const instRole = { id: 'test-inst', name: 'Admin', role: 'institution', orgName: 'Test Uni', orgType: 'institution' };
        const instRoutes = ['/admin', '/analytics', '/graduate'];
        await testRoutes(instRole, instRoutes);

        // 3. Test Organization Routes
        const orgRole = { id: 'test-org', name: 'HR', role: 'organization', orgName: 'Test Corp', orgType: 'organization' };
        const orgRoutes = ['/verify', '/graduate'];
        await testRoutes(orgRole, orgRoutes);

        console.log(`\n=========================================`);
        if (crashCount > 0) {
            console.log(`❌ AUDIT FAILED. Found ${crashCount} page crashes/errors.`);
        } else {
            console.log(`✅ AUDIT PASSED. 0 errors. All pages run without errors in all phases!`);
        }

    } catch (e) {
        console.error("Critical Test Error:", e);
    } finally {
        await browser.close();
    }
})();
