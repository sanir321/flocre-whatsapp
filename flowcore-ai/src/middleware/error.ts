import { Request, Response, NextFunction } from 'express';

export const errorHandler = (err: any, req: Request, res: Response, next: NextFunction) => {
    console.error('[Error]', err);

    const statusCode = err.statusCode || 500;
    const errorCode = err.code || 'INTERNAL_ERROR';
    const message = err.message || 'An unexpected error occurred';

    res.status(statusCode).json({
        success: false,
        error: {
            code: errorCode,
            message: message
        }
    });
};

export class ApiError extends Error {
    constructor(
        public statusCode: number,
        public code: string,
        message: string
    ) {
        super(message);
        this.name = 'ApiError';
    }
}
