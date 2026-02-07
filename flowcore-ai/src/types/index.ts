export interface WhatsAppMessage {
    id: string;
    from: string;
    fromMe: boolean;
    text?: string;
    mediaUrl?: string;
    caption?: string;
    timestamp: number;
    messageType: string;
    quotedMessageId?: string;
}

export interface WhatsAppChat {
    id: string;
    name: string;
    profilePicUrl?: string;
    lastMessage?: string;
    lastMessageTime?: number;
    unreadCount: number;
}

export interface WhatsAppContact {
    id: string;
    name: string;
    number: string;
    profilePicUrl?: string;
}

export interface ApiResponse<T = any> {
    success: boolean;
    data?: T;
    error?: {
        code: string;
        message: string;
    };
}

export interface ConnectRequest {
    instanceName: string;
    number: string;
}

export interface SendTextRequest {
    number: string;
    text: string;
    quotedMessageId?: string;
}

export interface SendMediaRequest {
    number: string;
    mediaUrl: string;
    caption?: string;
    mediaType: 'image' | 'video' | 'audio' | 'document';
}
