import express from 'express';
import dotenv from 'dotenv';
import axios from 'axios';

import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;
const EVO_API_URL = process.env.EVO_API_URL || 'http://localhost:8080';
const EVO_API_KEY = process.env.EVO_API_KEY || 'flowcore123';

app.use(cors());
app.use(express.json());

// API Key Middleware
const FLOWCORE_API_KEY = 'flowcore123';
const checkApiKey = (req: express.Request, res: express.Response, next: express.NextFunction) => {
    // Skip auth for health, webhook, and root
    if (req.path === '/health' || req.path === '/' || req.path.startsWith('/webhook/')) {
        return next();
    }

    const apiKey = req.headers['apikey'];
    if (apiKey !== FLOWCORE_API_KEY) {
        return res.status(401).json({ error: 'Unauthorized: Invalid API Key' });
    }
    next();
};
app.use(checkApiKey);

// --- ROUTES ---

// 1. Health Check
app.get('/health', (req, res) => {
    res.json({ status: 'ok', service: 'flowcore-ai' });
});

// Root Endpoint
app.get('/', (req, res) => {
    res.json({
        message: 'Flowcore AI Service is running 🚀',
        docs: 'See API_DOCUMENTATION.md',
        endpoints: {
            health: '/health',
            instances: '/api/whatsapp/instances'
        }
    });
});

// 2. Webhook Handler (Listeners for Evolution API events)
app.post('/webhook/evolution', (req: express.Request, res: express.Response) => {
    const { event, data, instance, sender } = req.body;

    console.log(`[Webhook] Event: ${event} | Instance: ${instance || 'N/A'}`);

    // Handle specific events
    if (event === 'messages.upsert') {
        // This is where we will hook in the AI Agent logic
        // data.message -> contains the message content
        console.log('Received Message:', JSON.stringify(data, null, 2));

        // TODO: Verify if message is from user (not fromMe) and reply
    }

    if (event === 'qrcode.updated') {
        console.log('QR Code Updated:', data);
        // TODO: Push to Frontend via WebSocket/SSE if building a real UI
    }

    if (event === 'connection.update') {
        const { status, reason } = data;
        console.log(`[Connection] Status: ${status} (${reason})`);
    }

    res.sendStatus(200);
});

// 3. API Client Wrapper (Actions Triggered by User/AI)

// A. Create Instance / Get QR (Improved Logic)
app.post('/api/whatsapp/connect', async (req, res) => {
    const { instanceName } = req.body;

    try {
        console.log(`[API] Connect/Create requested for: ${instanceName}`);

        // 1. Fetch current instances to see if it exists
        const instancesResponse = await axios.get(`${EVO_API_URL}/instance/fetchInstances`, {
            headers: { 'apikey': EVO_API_KEY }
        });

        const instances = Array.isArray(instancesResponse.data) ? instancesResponse.data : [instancesResponse.data];
        const existingInstance = instances.find((i: any) => i && (i.instanceName === instanceName || i.name === instanceName));

        if (existingInstance) {
            console.log(`[API] Instance "${instanceName}" found. Status: ${existingInstance.connectionStatus || existingInstance.status}. Calling connect...`);
            const connectResponse = await axios.get(`${EVO_API_URL}/instance/connect/${instanceName}`, {
                headers: { 'apikey': EVO_API_KEY }
            });
            console.log(`[API] Connect successful for existing instance.`);
            return res.json(connectResponse.data);
        }

        // 2. If it doesn't exist, Create it
        console.log(`[API] Instance "${instanceName}" not found. Creating new instance...`);
        const createResponse = await axios.post(`${EVO_API_URL}/instance/create`, {
            instanceName: instanceName,
            integration: "WHATSAPP-BAILEYS",
            qrcode: true
        }, {
            headers: { 'apikey': EVO_API_KEY }
        });

        // 3. Configure Webhook
        try {
            await axios.post(`${EVO_API_URL}/webhook/set/${instanceName}`, {
                url: `http://localhost:${PORT}/webhook/evolution`,
                enabled: true,
                webhookByEvents: false,
                events: ["MESSAGES_UPSERT", "CONNECTION_UPDATE", "QRCODE_UPDATED"]
            }, {
                headers: { 'apikey': EVO_API_KEY }
            });
            console.log(`[API] Webhook configured for ${instanceName}`);
        } catch (webhookError: any) {
            console.error(`[API] Webhook config failed (ignored):`, webhookError.message);
        }

        res.json(createResponse.data);

    } catch (error: any) {
        const errorData = error.response?.data || error.message;
        console.error('[API] Connection Sequence Error:', JSON.stringify(errorData));

        // Extract a readable message
        let msg = 'Failed to connect instance';
        if (error.response?.data?.response?.message) {
            msg = Array.isArray(error.response.data.response.message)
                ? error.response.data.response.message.join(', ')
                : error.response.data.response.message;
        } else if (typeof errorData === 'string') {
            msg = errorData;
        }

        res.status(500).json({
            status: 500,
            error: 'Internal Server Error',
            response: {
                message: [msg]
            }
        });
    }
});

// B. Logout Instance
app.post('/api/whatsapp/logout', async (req, res) => {
    const { instanceName } = req.body;
    try {
        console.log(`[API] Logout requested for ${instanceName}`);
        const response = await axios.delete(`${EVO_API_URL}/instance/logout/${instanceName}`, {
            headers: { 'apikey': EVO_API_KEY }
        });
        res.json(response.data);
    } catch (error: any) {
        // PER USER REQUEST: "I dont want it to show real errors it should disconnected"
        // Force success even if backend fails (e.g. already closed, not found, or API error)
        console.error(`[API] Logout error (ignored for UI force disconnect): ${JSON.stringify(error.response?.data || error.message)}`);

        console.log('[API] Treating error as success => Force Disconnect');
        res.json({ status: 'ok', message: 'Logged out (Forced)' });
    }
});

// C. Delete Instance
app.delete('/api/whatsapp/delete/:instanceName', async (req, res) => {
    const { instanceName } = req.params;
    try {
        console.log(`[API] Delete requested for ${instanceName}`);
        const response = await axios.delete(`${EVO_API_URL}/instance/delete/${instanceName}`, {
            headers: { 'apikey': EVO_API_KEY }
        });
        res.json(response.data);
    } catch (error: any) {
        // PER USER REQUEST: "I dont want it to show real errors it should disconnected"
        // Force success even if backend fails (e.g. already closed, not found, or API error)
        console.error(`[API] Delete error (ignored for UI force disconnect): ${JSON.stringify(error.response?.data || error.message)}`);

        console.log('[API] Treating error as success => Force Delete');
        res.json({ status: 'ok', message: 'Instance deleted (Forced)' });
    }
});
// D. List All Instances
app.get('/api/whatsapp/instances', async (req, res) => {
    try {
        console.log('[API] Fetching all instances');
        const response = await axios.get(`${EVO_API_URL}/instance/fetchInstances`, {
            headers: { 'apikey': EVO_API_KEY }
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('[API] Error fetching instances:', error.response?.data || error.message);
        res.json([]); // Return empty array on error
    }
});

// E. Get Instance Status
app.get('/api/whatsapp/status/:instanceName', async (req, res) => {
    const { instanceName } = req.params;
    try {
        console.log(`[API] Status requested for ${instanceName}`);
        const response = await axios.get(`${EVO_API_URL}/instance/connectionState/${instanceName}`, {
            headers: { 'apikey': EVO_API_KEY }
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('[API] Error getting status:', error.response?.data || error.message);
        res.json({ instance: instanceName, state: 'unknown' });
    }
});

// F. Restart Instance
app.post('/api/whatsapp/restart', async (req, res) => {
    const { instanceName } = req.body;
    try {
        console.log(`[API] Restart requested for ${instanceName}`);
        const response = await axios.post(`${EVO_API_URL}/instance/restart/${instanceName}`, {}, {
            headers: { 'apikey': EVO_API_KEY }
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('[API] Error restarting:', error.response?.data || error.message);
        // Force success for UI consistency
        res.json({ status: 'ok', message: 'Restart initiated' });
    }
});

// G. Send Text Message
app.post('/api/whatsapp/send', async (req, res) => {
    const { instanceName, number, message } = req.body;

    if (!instanceName || !number || !message) {
        return res.status(400).json({ error: 'Missing required fields: instanceName, number, message' });
    }

    try {
        console.log(`[API] Sending message from ${instanceName} to ${number}`);

        // Format number (ensure it has country code, no +, no spaces)
        const formattedNumber = number.replace(/\D/g, '');

        const response = await axios.post(`${EVO_API_URL}/message/sendText/${instanceName}`, {
            number: formattedNumber,
            text: message
        }, {
            headers: { 'apikey': EVO_API_KEY }
        });

        console.log(`[API] Message sent successfully`);
        res.json(response.data);
    } catch (error: any) {
        console.error('[API] Error sending message:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to send message', details: error.response?.data });
    }
});

// H. Fetch Contacts
app.get('/api/whatsapp/contacts/:instanceName', async (req, res) => {
    const { instanceName } = req.params;
    try {
        console.log(`[API] Fetching contacts for ${instanceName}`);
        const response = await axios.post(`${EVO_API_URL}/chat/findContacts/${instanceName}`, {}, {
            headers: { 'apikey': EVO_API_KEY }
        });
        res.json(response.data);
    } catch (error: any) {
        console.error('[API] Error fetching contacts:', error.response?.data || error.message);
        res.json([]); // Return empty array on error
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`Flowcore AI Service running on port ${PORT}`);
    console.log(`Evolution API Target: ${EVO_API_URL}`);
});
