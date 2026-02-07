import dotenv from 'dotenv';

dotenv.config();

export const config = {
    port: process.env.PORT || 3000,
    evoApiUrl: (process.env.EVO_API_URL || 'http://localhost:8080').replace(/\/$/, ''),
    evoApiKey: (process.env.EVO_API_KEY || 'flowcore123').trim(),
    flowcoreApiKey: process.env.FLOWCORE_API_KEY || 'flowcore123',
    supabaseUrl: process.env.SUPABASE_URL || 'https://kbzilehbqybxiwldwgii.supabase.co',
    supabaseAnonKey: process.env.SUPABASE_ANON_KEY || '',
};

console.log(`[Config] Evolution API: ${config.evoApiUrl}`);
console.log(`[Config] API Key: ${config.evoApiKey.substring(0, 3)}***${config.evoApiKey.slice(-3)}`);
