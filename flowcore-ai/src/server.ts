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
app.get('/health', async (req, res) => {
    try {
        await axios.get(`${EVO_API_URL}/health_check_endpoint_if_exists_or_just_root`, { timeout: 1000 }).catch(() => { });
        // Evolution API usually doesn't have a public /health without auth? 
        // Let's just try to connect to TCP port or assume if axios fails it's down.
        // Actually, let's just return local status and maybe a "upstream" flag.
        res.json({ status: 'ok', service: 'flowcore-ai', upstream: 'unknown' });
    } catch (e) {
        res.json({ status: 'ok', service: 'flowcore-ai', upstream: 'unreachable' });
    }
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
        const msg = data.data || data;
        const messageType = Object.keys(msg.message || {})[0];
        const from = msg.key?.remoteJid;
        const fromMe = msg.key?.fromMe;

        if (!fromMe) {
            console.log(`[Webhook] 📩 Received ${messageType} from ${from}`);
            // TODO: Call Platform API to save message
        }
    }

    if (event === 'contacts.upsert') {
        const contacts = Array.isArray(data) ? data : (data.data || []);
        for (const contact of contacts) {
            console.log(`[Webhook] 👤 New Contact Synced: ${contact.id} (${contact.name || contact.pushName || 'Unknown'})`);
            // TODO: Call Platform API to create contact
        }
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

// I. Check User & Sync (Platform -> WhatsApp)
app.post('/api/whatsapp/check-user', async (req, res) => {
    const { instanceName, number } = req.body;

    if (!instanceName || !number) {
        return res.status(400).json({ error: 'Missing instanceName or number' });
    }

    try {
        console.log(`[API] Checking user ${number} on ${instanceName}`);

        // 1. Check existence
        const formattedNumber = number.replace(/\D/g, '');
        const existsRes = await axios.post(`${EVO_API_URL}/chat/whatsappNumbers/${instanceName}`, {
            numbers: [formattedNumber]
        }, { headers: { 'apikey': EVO_API_KEY } });

        const result = existsRes.data[0];

        if (!result?.exists) {
            return res.json({ exists: false });
        }

        // 2. Fetch Profile Picture
        let profilePicUrl = null;
        try {
            const ppRes = await axios.post(`${EVO_API_URL}/chat/fetchProfilePictureUrl/${instanceName}`, {
                number: formattedNumber
            }, { headers: { 'apikey': EVO_API_KEY } });
            profilePicUrl = ppRes.data.profilePictureUrl;
        } catch (e) {
            console.warn(`[API] Failed to fetch profile pic for ${number}`);
        }

        // 3. Fetch Profile Info (Status/About)
        let status = null;
        try {
            const profileRes = await axios.post(`${EVO_API_URL}/chat/fetchProfile/${instanceName}`, {
                number: formattedNumber
            }, { headers: { 'apikey': EVO_API_KEY } });
            status = profileRes.data.status;
        } catch (e) {
            console.warn(`[API] Failed to fetch profile status for ${number}`);
        }

        res.json({
            exists: true,
            jid: result.jid,
            profile: {
                picture: profilePicUrl,
                status: status
            }
        });

    } catch (error: any) {
        console.error('[API] Error checking user:', error.response?.data || error.message);
        res.status(500).json({ error: 'Failed to check user' });
    }
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

        // 2. If it doesn't exist, Create it (Step 1: Create without QR)
        console.log(`[API] Instance "${instanceName}" not found. Creating new instance...`);
        await axios.post(`${EVO_API_URL}/instance/create`, {
            instanceName: instanceName,
            integration: "WHATSAPP-BAILEYS",
            qrcode: false
        }, {
            headers: { 'apikey': EVO_API_KEY }
        });

        // Step 2: Enable Full History Sync
        console.log(`[API] Configuring History Sync for "${instanceName}"...`);
        try {
            await axios.post(`${EVO_API_URL}/settings/set/${instanceName}`, {
                syncFullHistory: true,
                readMessages: true,
                readStatus: false,
                alwaysOnline: true,
                rejectCall: false,
                groupsIgnore: false,
            }, {
                headers: { 'apikey': EVO_API_KEY }
            });
        } catch (settingsError: any) {
            console.error(`[API] Settings config failed:`, settingsError.message);
        }

        // Step 3: Connect and Get QR
        console.log(`[API] Initiating connection for "${instanceName}"...`);
        const connectResponse = await axios.get(`${EVO_API_URL}/instance/connect/${instanceName}`, {
            headers: { 'apikey': EVO_API_KEY }
        });

        const createResponse = connectResponse; // Use connect response as determination for success

        // 4. Configure Webhook
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
                message: [msg],
                debug: errorData // Added for debugging
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
