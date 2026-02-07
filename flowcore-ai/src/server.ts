import express from 'express';
import cors from 'cors';
import { createProxyMiddleware } from 'http-proxy-middleware';
import { config } from './config/env';
import { errorHandler } from './middleware/error';
import { checkApiKey } from './middleware/auth';

// Routes
import healthRoutes from './routes/health';
import webhookRoutes from './routes/webhook';
import whatsappRoutes from './routes/whatsapp';

const app = express();

console.log(`[Flowcore] Starting v2.0...`);
console.log(`[Flowcore] Evolution API: ${config.evoApiUrl}`);

// Middleware
app.use(cors());

// Health check (no auth)
app.use('/health', healthRoutes);

// Webhook (no auth, JSON body)
const webhookRouter = express.Router();
webhookRouter.use(express.json());
webhookRouter.use(webhookRoutes);
app.use('/webhook', webhookRouter);

// WhatsApp API (auth required, JSON body)
const apiRouter = express.Router();
apiRouter.use(express.json());
apiRouter.use(checkApiKey);
apiRouter.use('/whatsapp', whatsappRoutes);
app.use('/api', apiRouter);

// Reverse Proxy for Manager UI and Evolution API
app.use('/', createProxyMiddleware({
    target: config.evoApiUrl,
    changeOrigin: true,
    ws: true,
    // @ts-ignore
    logLevel: 'silent'
}));

// Error handler (must be last)
app.use(errorHandler);

// Start server
const PORT = config.port;
app.listen(PORT, () => {
    console.log(`[Flowcore] ✅ Server running on port ${PORT}`);
    console.log(`[Flowcore] 📡 Webhook: http://localhost:${PORT}/webhook/evolution`);
    console.log(`[Flowcore] 🔌 API: http://localhost:${PORT}/api/whatsapp/*`);
    console.log(`[Flowcore] 🏥 Health: http://localhost:${PORT}/health`);
});
