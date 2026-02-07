import { supabase } from '../lib/supabase';
import axios from 'axios';

interface MediaUploadResult {
    publicUrl: string | null;
    error?: string;
}

export async function uploadMediaToSupabase(
    mediaUrl: string,
    messageId: string,
    mimeType: string
): Promise<MediaUploadResult> {
    try {
        console.log(`[Media Upload] Downloading media from: ${mediaUrl}`);

        // 1. Download media from WhatsApp/Evolution API
        const response = await axios.get(mediaUrl, {
            responseType: 'arraybuffer',
            timeout: 30000, // 30 second timeout
        });

        const buffer = Buffer.from(response.data);
        console.log(`[Media Upload] Downloaded ${buffer.length} bytes`);

        // 2. Generate filename with proper extension
        const extension = mimeType.split('/')[1]?.split(';')[0] || 'bin';
        const timestamp = Date.now();
        const filename = `${messageId}_${timestamp}.${extension}`;
        const filepath = `media/${filename}`;

        console.log(`[Media Upload] Uploading to Supabase: ${filepath}`);

        // 3. Upload to Supabase Storage
        const { data, error } = await supabase.storage
            .from('whatsapp-media')
            .upload(filepath, buffer, {
                contentType: mimeType,
                upsert: true,
            });

        if (error) {
            console.error('[Media Upload] Supabase upload error:', error);
            return { publicUrl: null, error: error.message };
        }

        // 4. Get public URL
        const { data: publicUrlData } = supabase.storage
            .from('whatsapp-media')
            .getPublicUrl(filepath);

        console.log(`[Media Upload] Success! Public URL: ${publicUrlData.publicUrl}`);

        return { publicUrl: publicUrlData.publicUrl };
    } catch (error: any) {
        console.error('[Media Upload] Error:', error.message);
        return {
            publicUrl: null,
            error: error.message || 'Unknown error'
        };
    }
}
