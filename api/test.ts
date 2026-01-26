import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
    // Test endpoint to verify environment variables
    const { BAGS_API_KEY, VITE_BAGS_API_URL } = process.env;
    
    return res.status(200).json({
        message: 'API route test',
        hasBagsApiKey: !!BAGS_API_KEY,
        bagsApiKeyLength: BAGS_API_KEY ? BAGS_API_KEY.length : 0,
        bagsApiUrl: VITE_BAGS_API_URL || 'https://public-api-v2.bags.fm/api/v1',
        timestamp: new Date().toISOString()
    });
}