import { Request, Response, NextFunction } from 'express';
import { config } from '../config/env';

export const checkApiKey = (req: Request, res: Response, next: NextFunction) => {
    const apiKey = req.headers['apikey'];

    if (apiKey !== config.flowcoreApiKey) {
        return res.status(401).json({
            success: false,
            error: {
                code: 'UNAUTHORIZED',
                message: 'Invalid API key'
            }
        });
    }

    next();
};
