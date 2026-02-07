import { Router, Request, Response } from 'express';
import { evolutionService } from '../services/evolution.service';
import { supabase } from '../lib/supabase';
import { ApiResponse, ConnectRequest, SendTextRequest, SendMediaRequest } from '../types';

const router = Router();

// 1. Connect WhatsApp (Show QR Code)
router.post('/connect', async (req: Request, res: Response) => {
    try {
        const { instanceName, number }: ConnectRequest = req.body;

        if (!instanceName || !number) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'instanceName and number are required'
                }
            });
        }

        console.log(`[WhatsApp] Creating instance: ${instanceName}`);
        const result = await evolutionService.createInstance(instanceName, number);

        const response: ApiResponse = {
            success: true,
            data: {
                qrcode: result.qrcode?.base64 || result.qrcode,
                status: result.instance?.state || 'qrcode',
                instanceName: result.instance?.instanceName || instanceName
            }
        };

        res.json(response);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'CONNECT_FAILED',
                message: error.message
            }
        });
    }
});

// 2. Check Connection Status
router.get('/status/:instanceName', async (req: Request, res: Response) => {
    try {
        const { instanceName } = req.params;

        console.log(`[WhatsApp] Checking status: ${instanceName}`);
        const result = await evolutionService.getInstanceStatus(instanceName);

        const response: ApiResponse = {
            success: true,
            data: {
                status: result.state || result.status,
                instanceName: result.instance?.instanceName || instanceName,
                profileName: result.instance?.profileName,
                profilePicUrl: result.instance?.profilePicUrl,
                number: result.instance?.number
            }
        };

        res.json(response);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'STATUS_CHECK_FAILED',
                message: error.message
            }
        });
    }
});

// 3. Fetch Contacts
router.get('/contacts/:instanceName', async (req: Request, res: Response) => {
    try {
        const { instanceName } = req.params;

        console.log(`[WhatsApp] Fetching contacts: ${instanceName}`);
        const result = await evolutionService.fetchContacts(instanceName);

        const contacts = (result || []).map((contact: any) => ({
            id: contact.id,
            name: contact.pushName || contact.name || contact.id.split('@')[0],
            number: contact.id.split('@')[0],
            profilePicUrl: contact.profilePicUrl || null
        }));

        const response: ApiResponse = {
            success: true,
            data: {
                contacts,
                count: contacts.length
            }
        };

        res.json(response);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'CONTACTS_FETCH_FAILED',
                message: error.message
            }
        });
    }
});

// 4. Send Text Message
router.post('/send-text/:instanceName', async (req: Request, res: Response) => {
    try {
        const { instanceName } = req.params;
        const { number, text, quotedMessageId }: SendTextRequest = req.body;

        if (!number || !text) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'number and text are required'
                }
            });
        }

        console.log(`[WhatsApp] Sending text to ${number} on ${instanceName}`);
        const result = await evolutionService.sendText(instanceName, number, text, quotedMessageId);

        const response: ApiResponse = {
            success: true,
            data: {
                messageId: result.key?.id || result.message?.key?.id,
                timestamp: result.messageTimestamp || Date.now()
            }
        };

        res.json(response);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'MESSAGE_SEND_FAILED',
                message: error.message
            }
        });
    }
});

// 5. Send Media Message
router.post('/send-media/:instanceName', async (req: Request, res: Response) => {
    try {
        const { instanceName } = req.params;
        const { number, mediaUrl, caption, mediaType }: SendMediaRequest = req.body;

        if (!number || !mediaUrl) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'number and mediaUrl are required'
                }
            });
        }

        console.log(`[WhatsApp] Sending ${mediaType} to ${number} on ${instanceName}`);
        const result = await evolutionService.sendMedia(instanceName, number, mediaUrl, caption, mediaType);

        const response: ApiResponse = {
            success: true,
            data: {
                messageId: result.key?.id || result.message?.key?.id,
                timestamp: result.messageTimestamp || Date.now()
            }
        };

        res.json(response);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'MEDIA_SEND_FAILED',
                message: error.message
            }
        });
    }
});

// 6. Get Messages
router.get('/messages/:instanceName', async (req: Request, res: Response) => {
    try {
        const { instanceName } = req.params;
        const { chatId } = req.query;

        if (!chatId) {
            return res.status(400).json({
                success: false,
                error: {
                    code: 'INVALID_REQUEST',
                    message: 'chatId query parameter is required'
                }
            });
        }

        console.log(`[WhatsApp] Fetching messages for ${chatId} on ${instanceName}`);
        const result = await evolutionService.fetchMessages(instanceName, chatId as string);

        const messages = (result || []).map((msg: any) => ({
            id: msg.key?.id,
            from: msg.key?.remoteJid,
            fromMe: msg.key?.fromMe || false,
            text: msg.message?.conversation || msg.message?.extendedTextMessage?.text,
            mediaUrl: msg.message?.mediaUrl,
            caption: msg.message?.imageMessage?.caption || msg.message?.videoMessage?.caption,
            timestamp: msg.messageTimestamp,
            messageType: Object.keys(msg.message || {})[0]
        }));

        const response: ApiResponse = {
            success: true,
            data: {
                messages,
                count: messages.length
            }
        };

        res.json(response);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'MESSAGES_FETCH_FAILED',
                message: error.message
            }
        });
    }
});

// 7. Get Chats
router.get('/chats/:instanceName', async (req: Request, res: Response) => {
    try {
        const { instanceName } = req.params;

        console.log(`[WhatsApp] Fetching chats for ${instanceName}`);
        const result = await evolutionService.fetchChats(instanceName);

        const chats = (result || []).map((chat: any) => ({
            id: chat.id,
            name: chat.name || chat.id.split('@')[0],
            profilePicUrl: chat.profilePicUrl || null,
            lastMessage: chat.lastMessage?.message?.conversation || chat.lastMessage?.message?.extendedTextMessage?.text,
            lastMessageTime: chat.lastMessage?.messageTimestamp,
            unreadCount: chat.unreadCount || 0
        }));

        const response: ApiResponse = {
            success: true,
            data: {
                chats,
                count: chats.length
            }
        };

        res.json(response);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'CHATS_FETCH_FAILED',
                message: error.message
            }
        });
    }
});

// 8. Disconnect WhatsApp
router.delete('/disconnect/:instanceName', async (req: Request, res: Response) => {
    try {
        const { instanceName } = req.params;

        console.log(`[WhatsApp] Disconnecting instance: ${instanceName}`);

        // 1. Logout from WhatsApp
        await evolutionService.logoutInstance(instanceName);

        // 2. Delete instance from Evolution API
        await evolutionService.deleteInstance(instanceName);

        // 3. Clear data from Supabase (messages, contacts, chats)
        try {
            // Delete messages
            await supabase
                .from('Message')
                .delete()
                .eq('instanceId', instanceName);

            // Delete chats
            await supabase
                .from('Chat')
                .delete()
                .eq('instanceId', instanceName);

            // Delete contacts
            await supabase
                .from('Contact')
                .delete()
                .eq('instanceId', instanceName);

            console.log(`[WhatsApp] Cleared database for ${instanceName}`);
        } catch (dbError) {
            console.error('[WhatsApp] Database cleanup error:', dbError);
            // Continue even if database cleanup fails
        }

        const response: ApiResponse = {
            success: true,
            data: {
                message: 'Instance disconnected and data cleared'
            }
        };

        res.json(response);
    } catch (error: any) {
        res.status(error.statusCode || 500).json({
            success: false,
            error: {
                code: error.code || 'DISCONNECT_FAILED',
                message: error.message
            }
        });
    }
});

export default router;
