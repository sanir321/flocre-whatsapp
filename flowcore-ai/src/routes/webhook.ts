import { Router, Request, Response } from 'express';
import { uploadMediaToSupabase } from '../services/media-upload';

const router = Router();

router.post('/evolution', async (req: Request, res: Response) => {
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

            // Handle media messages - upload to Supabase
            if (['imageMessage', 'videoMessage', 'audioMessage', 'documentMessage'].includes(messageType)) {
                const mediaMessage = msg.message[messageType];

                if (mediaMessage?.url) {
                    console.log(`[Webhook] 📎 Uploading ${messageType} to Supabase...`);

                    const result = await uploadMediaToSupabase(
                        mediaMessage.url,
                        msg.key.id,
                        mediaMessage.mimetype || 'application/octet-stream'
                    );

                    if (result.publicUrl) {
                        // Add mediaUrl to the message so it gets saved in database
                        msg.message.mediaUrl = result.publicUrl;
                        console.log(`[Webhook] ✅ Media uploaded: ${result.publicUrl}`);
                    } else {
                        console.error(`[Webhook] ❌ Media upload failed: ${result.error}`);
                    }
                }
            }
        }
    }

    if (event === 'contacts.upsert') {
        const contacts = Array.isArray(data) ? data : (data.data || []);
        for (const contact of contacts) {
            console.log(`[Webhook] 👤 New Contact Synced: ${contact.id} (${contact.name || contact.pushName || 'Unknown'})`);
        }
    }

    if (event === 'qrcode.updated') {
        console.log('[Webhook] 🔄 QR Code Updated');
    }

    if (event === 'connection.update') {
        const { status, reason } = data;
        console.log(`[Webhook] 🔌 Connection: ${status} (${reason || 'N/A'})`);
    }

    res.sendStatus(200);
});

export default router;
