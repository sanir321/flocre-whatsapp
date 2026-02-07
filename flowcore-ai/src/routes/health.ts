import { Router, Request, Response } from 'express';
import axios from 'axios';
import { config } from '../config/env';

const router = Router();

// Health check endpoint
router.get('/', async (req: Request, res: Response) => {
    try {
        // Try to ping Evolution API
        await axios.get(`${config.evoApiUrl}`, { timeout: 1000 }).catch(() => { });

        res.json({
            status: 'ok',
            service: 'flowcore-ai',
            timestamp: new Date().toISOString(),
            upstream: {
                evolutionApi: config.evoApiUrl,
                status: 'reachable'
            }
        });
    } catch (e) {
        res.json({
            status: 'ok',
            service: 'flowcore-ai',
            timestamp: new Date().toISOString(),
            upstream: {
                evolutionApi: config.evoApiUrl,
                status: 'unreachable'
            }
        });
    }
});

// Root endpoint
router.get('/root', (req: Request, res: Response) => {
    res.json({
        message: 'Flowcore AI - WhatsApp Platform Integration 🚀',
        version: '2.0.0',
        endpoints: {
            health: '/health',
            webhook: '/webhook/evolution',
            api: {
                connect: 'POST /api/whatsapp/connect',
                status: 'GET /api/whatsapp/status/:instanceName',
                contacts: 'GET /api/whatsapp/contacts/:instanceName',
                sendText: 'POST /api/whatsapp/send-text/:instanceName',
                sendMedia: 'POST /api/whatsapp/send-media/:instanceName',
                messages: 'GET /api/whatsapp/messages/:instanceName',
                chats: 'GET /api/whatsapp/chats/:instanceName',
                disconnect: 'DELETE /api/whatsapp/disconnect/:instanceName'
            }
        }
    });
});

export default router;
