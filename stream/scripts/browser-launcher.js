
const { chromium } = require('playwright');

(async () => {
	const browser = await chromium.launch({
		headless: false,
		args: [
			'--no-sandbox',
			'--disable-setuid-sandbox',
			'--disable-dev-shm-usage',
			'--disable-gpu',
			'--no-first-run',
			'--no-default-browser-check',
			'--disable-blink-features=AutomationControlled',
			`--window-size=${process.env.SCREEN_WIDTH || 1920},${process.env.SCREEN_HEIGHT || 1080}`,
			'--window-position=0,0',
			'--autoplay-policy=no-user-gesture-required',
			'--enable-usermedia-screen-capturing',
			'--allow-http-screen-capture',
		]
	});

	const context = await browser.newContext({
		viewport: {
			width: parseInt(process.env.SCREEN_WIDTH || 1920),
			height: parseInt(process.env.SCREEN_HEIGHT || 1080)
		},
		ignoreHTTPSErrors: true,
		permissions: ['camera', 'microphone', 'clipboard-read', 'clipboard-write'],
	});

	const page = await context.newPage();

	// Navigate to the target URL
	await page.goto(process.env.BROWSER_URL || 'https://example.com', {
		waitUntil: 'networkidle'
	});

	// Optional: Inject custom JavaScript for widget interaction
	if (process.env.INJECT_SCRIPT) {
		await page.evaluate(process.env.INJECT_SCRIPT);
	}

	// Keep the browser running
	await new Promise(() => { });
})();