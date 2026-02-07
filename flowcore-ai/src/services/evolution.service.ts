import axios, { AxiosInstance } from 'axios';
import { config } from '../config/env';
import { ApiError } from '../middleware/error';

class EvolutionService {
    private client: AxiosInstance;

    constructor() {
        this.client = axios.create({
            baseURL: config.evoApiUrl,
            headers: {
                'apikey': config.evoApiKey,
                'Content-Type': 'application/json'
            },
            timeout: 30000
        });
    }

    // Create instance and get QR code
    async createInstance(instanceName: string, number: string) {
        try {
            const response = await this.client.post(`/instance/create`, {
                instanceName,
                number,
                qrcode: true,
                integration: 'WHATSAPP-BAILEYS'
            });
            return response.data;
        } catch (error: any) {
            console.error('[Evolution] Create instance error:', error.response?.data || error.message);
            throw new ApiError(500, 'INSTANCE_CREATE_FAILED', 'Failed to create WhatsApp instance');
        }
    }

    // Get instance connection status
    async getInstanceStatus(instanceName: string) {
        try {
            const response = await this.client.get(`/instance/connectionState/${instanceName}`);
            return response.data;
        } catch (error: any) {
            if (error.response?.status === 404) {
                throw new ApiError(404, 'INSTANCE_NOT_FOUND', 'WhatsApp instance not found');
            }
            throw new ApiError(500, 'STATUS_CHECK_FAILED', 'Failed to check instance status');
        }
    }

    // Fetch contacts
    async fetchContacts(instanceName: string) {
        try {
            const response = await this.client.get(`/chat/findContacts/${instanceName}`);
            return response.data;
        } catch (error: any) {
            console.error('[Evolution] Fetch contacts error:', error.response?.data || error.message);
            throw new ApiError(500, 'CONTACTS_FETCH_FAILED', 'Failed to fetch contacts');
        }
    }

    // Send text message
    async sendText(instanceName: string, number: string, text: string, quotedMessageId?: string) {
        try {
            const payload: any = {
                number: number.replace(/\D/g, ''),
                text
            };

            if (quotedMessageId) {
                payload.quoted = { key: { id: quotedMessageId } };
            }

            const response = await this.client.post(`/message/sendText/${instanceName}`, payload);
            return response.data;
        } catch (error: any) {
            console.error('[Evolution] Send text error:', error.response?.data || error.message);
            throw new ApiError(500, 'MESSAGE_SEND_FAILED', 'Failed to send message');
        }
    }

    // Send media message
    async sendMedia(instanceName: string, number: string, mediaUrl: string, caption?: string, mediaType: string = 'image') {
        try {
            const payload = {
                number: number.replace(/\D/g, ''),
                mediatype: mediaType,
                media: mediaUrl,
                caption: caption || ''
            };

            const response = await this.client.post(`/message/sendMedia/${instanceName}`, payload);
            return response.data;
        } catch (error: any) {
            console.error('[Evolution] Send media error:', error.response?.data || error.message);
            throw new ApiError(500, 'MEDIA_SEND_FAILED', 'Failed to send media');
        }
    }

    // Fetch messages from a chat
    async fetchMessages(instanceName: string, chatId: string) {
        try {
            const response = await this.client.get(`/chat/findMessages/${instanceName}`, {
                params: { where: { key: { remoteJid: chatId } } }
            });
            return response.data;
        } catch (error: any) {
            console.error('[Evolution] Fetch messages error:', error.response?.data || error.message);
            throw new ApiError(500, 'MESSAGES_FETCH_FAILED', 'Failed to fetch messages');
        }
    }

    // Fetch chats
    async fetchChats(instanceName: string) {
        try {
            const response = await this.client.get(`/chat/findChats/${instanceName}`);
            return response.data;
        } catch (error: any) {
            console.error('[Evolution] Fetch chats error:', error.response?.data || error.message);
            throw new ApiError(500, 'CHATS_FETCH_FAILED', 'Failed to fetch chats');
        }
    }

    // Delete instance
    async deleteInstance(instanceName: string) {
        try {
            const response = await this.client.delete(`/instance/delete/${instanceName}`);
            return response.data;
        } catch (error: any) {
            console.error('[Evolution] Delete instance error:', error.response?.data || error.message);
            throw new ApiError(500, 'INSTANCE_DELETE_FAILED', 'Failed to delete instance');
        }
    }

    // Logout instance
    async logoutInstance(instanceName: string) {
        try {
            const response = await this.client.delete(`/instance/logout/${instanceName}`);
            return response.data;
        } catch (error: any) {
            console.error('[Evolution] Logout instance error:', error.response?.data || error.message);
            // Don't throw error, logout might fail if already disconnected
            return { success: false };
        }
    }
}

export const evolutionService = new EvolutionService();
