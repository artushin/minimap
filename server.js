const https = require('https');
const http = require('http');
const fs = require('fs');
const path = require('path');
const { URL } = require('url');

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
			hostname: '10.51.80.25',
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
					resolve(parsed);
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
function generatePayload(msCtrlCallBackUrl, qrCodeId) {
	return {
		"headers": {},
		"metadata": {
			"version": 1,
			"options": {},
			"widgets": [
				{
					"url": "",
					"headers": {},
					"key": "",
					"cookies": [{}]
				}
			],
			"location": true,
			"ptt": true,
			"locationHref": ""
		},
		"stun_urls": ["stun:icf-prod-usw2b-turn.livelyvideo.tv:19302"],
		"whip": `${msCtrlCallBackUrl}/api/v1/whip/create/${qrCodeId}`
	};
}

/**
 * Create HTTP server
 */
function createServer(port = 3000) {
	const server = http.createServer((req, res) => {
		const url = new URL(req.url, `http://localhost:${port}`);

		// Serve JSON endpoints for QR codes
		if (url.pathname.startsWith('/qr/')) {
			const qrCodeId = url.pathname.split('/qr/')[1];
			const payload = generatePayload(callbackUrls.msCtrlCallBackUrl, qrCodeId);

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
			const filePath = path.join(__dirname, 'qr-codes.html');
			fs.readFile(filePath, 'utf8', (err, data) => {
				if (err) {
					res.writeHead(500, { 'Content-Type': 'text/plain' });
					res.end('Error loading page');
					return;
				}
				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.end(data);
			});
			return;
		}

		// Serve minimap page
		if (url.pathname === '/minimap') {
			const filePath = path.join(__dirname, 'index.html');
			fs.readFile(filePath, 'utf8', (err, data) => {
				if (err) {
					res.writeHead(500, { 'Content-Type': 'text/plain' });
					res.end('Error loading minimap');
					return;
				}
				res.writeHead(200, { 'Content-Type': 'text/html' });
				res.end(data);
			});
			return;
		}

		// 404
		res.writeHead(404, { 'Content-Type': 'text/plain' });
		res.end('Not Found');
	});

	server.listen(port, () => {
		console.log(`\n✅ Server running at http://localhost:${port}`);
		console.log(`\nOpen your browser to view the QR codes and callback URLs.\n`);
	});
}

/**
 * Main execution function
 */
async function main() {
	try {
		console.log('Fetching callback URLs...');
		// callbackUrls = await getCallbackUrls();
		callbackUrls = {
			"msCtrlCallBackUrl": "https://10.51.80.25:8443/p/8084/foundation-transcode/msctl",
			"ctrlCallbackUrl": "https://10.51.80.25:8443/p/8084/foundation-transcode/shmcli",
			"hlsEgressUrl": "https://10.51.80.25:8443/p/8084/foundation-transcode",
			"ngxIngressBaseUrl": "https://localhost:8443/p/8083/foundation-transcode",
			"rtmpIngressUrl": "rtmp://localhost/live"
		}
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