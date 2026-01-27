import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    const { BAGS_API_KEY, BAGS_PARTNER_CONFIG, VITE_BAGS_API_URL } = process.env;

    if (!BAGS_API_KEY) {
        return res.status(500).json({ error: 'BAGS_API_KEY not configured' });
    }

    const bagsUrl = VITE_BAGS_API_URL || 'https://public-api-v2.bags.fm/api/v1';

    // Construct the target URL
    const { query } = req;
    const path = Array.isArray(query.slug) ? query.slug.join('/') : query.slug || '';
    const targetUrl = `${bagsUrl}/${path}`;

    try {
        // Only pass safe headers
        const safeHeaders: Record<string, string> = {};
        const allowedHeaders = ['content-type', 'accept', 'accept-language', 'user-agent'];

        for (const [key, value] of Object.entries(req.headers)) {
            if (allowedHeaders.includes(key.toLowerCase()) && typeof value === 'string') {
                safeHeaders[key] = value;
            }
        }

        // Prepare request body
        let body = req.method !== 'GET' && req.body ? req.body : undefined;

        // Auto-inject partnerConfig for token launches if available and not already provided
        if (path === 'token/launch' && req.method === 'POST' && BAGS_PARTNER_CONFIG && body) {
            if (typeof body === 'string') {
                try {
                    body = JSON.parse(body);
                } catch (e) {
                    // Ignore parse errors
                }
            }
            
            if (typeof body === 'object' && !body.partnerConfig) {
                body.partnerConfig = BAGS_PARTNER_CONFIG;
            }
        }

        const response = await fetch(targetUrl, {
            method: req.method,
            headers: {
                'x-api-key': BAGS_API_KEY,
                'Content-Type': 'application/json',
                ...safeHeaders,
            },
            body: body ? JSON.stringify(body) : undefined,
        });

        const data = await response.json();

        res.status(response.status).json(data);
    } catch (error) {
        console.error('Bags API proxy error:', error);
        res.status(500).json({ error: 'Internal server error' });
    }
}