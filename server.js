const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

const MY_URL =  'https://alex.frp.livelyvideo.tv';
// const MEDIA_HOST =  '10.51.80.25';
const MEDIA_HOST =  '10.15.0.123';
const WIDGET_HOST =  'https://leo.frp.livelyvideo.tv';

// Create an HTTPS agent that ignores SSL certificate errors (for -k flag)
const agent = new https.Agent({
	rejectUnauthorized: false
});

let callbackUrls = null;

/**
 * Make a GET request to fetch callback URLs
 */
async function getCallbackUrls() {
	return new Promise((resolve, reject) => {
		const options = {
			hostname: MEDIA_HOST,
			port: 8443,
			path: '/foundation-transcode/callback_urls',
			method: 'GET',
			agent: agent
		};

		const req = https.request(options, (res) => {
			let data = '';

			res.on('data', (chunk) => {
				data += chunk;
			});

			res.on('end', () => {
				try {
					const parsed = JSON.parse(data);
					resolve({
						// msCtrlCallBackUrl: parsed.msCtrlCallBackUrl,
						msCtrlCallBackUrl: parsed.msCtrlCallBackUrl.replace('https', 'http').replace('8443/p/', ''),
						// ctrlCallbackUrl: parsed.ctrlCallbackUrl,
						ctrlCallbackUrl: parsed.ctrlCallbackUrl.replace('https', 'http').replace('8443/p/', ''),
						hlsEgressUrl: parsed.hlsEgressUrl,
						ngxIngressBaseUrl: parsed.ngxIngressBaseUrl,
						rtmpIngressUrl: parsed.rtmpIngressUrl,
					});
				} catch (error) {
					reject(new Error(`Failed to parse JSON: ${error.message}`));
				}
			});
		});

		req.on('error', (error) => {
			reject(error);
		});

		req.end();
	});
}

/**
 * Generate JSON payload for a specific QR code
 */
function generatePayload(callbackUrls, qrCodeId) {
	return {
		"headers": {},
		"metadata": {
			"version": 1,
			"options": {},
			"widgets": [
				{
					"url": `${WIDGET_HOST}`,
					"headers": {
						"x-stream-id": qrCodeId,
						"x-ms-ctrl-callback-url": callbackUrls.msCtrlCallBackUrl,
						"x-ctrl-callback-url": callbackUrls.ctrlCallbackUrl,
					},
					"key": "1",
					"cookies": []
				}
			],
			"location": true,
			"ptt": true,
			"locationHref": `http://${MEDIA_HOST}:8084/foundation-transcode/shmcli/api/v1/settrack`
		},
		"stun_urls": ["stun:icf-prod-usw2b-turn.livelyvideo.tv:19302"],
		"whip": `${callbackUrls.msCtrlCallBackUrl}/api/v1/whip/create/${qrCodeId}`
	};
}

/**
 * Template engine - replaces {{variableName}} with values
 */
function injectVariables(html, variables) {
	return html.replace(/\{\{(\w+)\}\}/g, (match, varName) => {
		return variables[varName] !== undefined ? variables[varName] : match;
	});
}

/**
 * Serve HTML file with variable injection
 */
function serveHtml(filePath, variables, res) {
	fs.readFile(filePath, 'utf8', (err, data) => {
		if (err) {
			res.writeHead(500, { 'Content-Type': 'text/plain' });
			res.end('Error loading page');
			return;
		}
		const processedHtml = injectVariables(data, variables);
		res.writeHead(200, { 'Content-Type': 'text/html' });
		res.end(processedHtml);
	});
}

/**
 * Create HTTP server
 */
function createServer(port = 3000) {
	const server = http.createServer((req, res) => {
		const url = new URL(req.url, `http://${MY_URL}`);

		// Serve JSON endpoints for QR codes
		if (url.pathname.startsWith('/qr/w/')) {
			const qrCodeId = url.pathname.split('/qr/w/')[1];
			const payload = generatePayload(callbackUrls, qrCodeId, port);

			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify(payload, null, 2));
			return;
		}

		// API endpoint for configuration
		if (url.pathname === '/api/config') {
			const config = {
				callbackUrls: callbackUrls,
				port: port
			};
			res.writeHead(200, { 'Content-Type': 'application/json' });
			res.end(JSON.stringify(config));
			return;
		}

		// Serve main QR codes page
		if (url.pathname === '/') {
			const templateVars = {
				MY_URL: MY_URL
			};
			serveHtml(path.join(__dirname, 'qr-codes.html'), templateVars, res);
			return;
		}

		// Serve minimap page
		if (url.pathname === '/minimap') {
			const templateVars = {
				UPDATE_URL: callbackUrls.ctrlCallbackUrl
			};
			serveHtml(path.join(__dirname, 'minimap.html'), templateVars, res);
			return;
		}

		// 404
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.end('Not Found');
	});

	server.listen(port, () => {
		console.log(`\n✅ Server running at http://${MY_URL}`);
		console.log(`\nOpen your browser to view the QR codes and callback URLs.\n`);
	});
}

/**
 * Main execution function
 */
async function main() {
	try {
		console.log('Fetching callback URLs...');
		callbackUrls = await getCallbackUrls();
		// callbackUrls = {
		// 	"msCtrlCallBackUrl": "https://10.51.80.25:8443/p/8084/foundation-transcode/msctl",
		// 	"ctrlCallbackUrl": "https://10.51.80.25:8443/p/8084/foundation-transcode/shmcli",
		// 	"hlsEgressUrl": "https://10.51.80.25:8443/p/8084/foundation-transcode",
		// 	"ngxIngressBaseUrl": "https://localhost:8443/p/8083/foundation-transcode",
		// 	"rtmpIngressUrl": "rtmp://localhost/live"
		// }
		console.log('Callback URLs received:');
		console.log(JSON.stringify(callbackUrls, null, 2));

		const port = process.env.PORT || 3000;
		createServer(port);
	} catch (error) {
		console.error('Error occurred:', error.message);
		process.exit(1);
	}
}

// Run the script
main();