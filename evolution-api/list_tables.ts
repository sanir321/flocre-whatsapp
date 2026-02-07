import { Client } from 'pg';

const client = new Client({
    connectionString: 'postgresql://postgres:nN0dfnfesLu5Zzuj@db.kbzilehbqybxiwldwgii.supabase.co:5432/postgres?schema=evolution_api',
});

async function listTables() {
    try {
        await client.connect();
        console.log('Connected to database');

        const res = await client.query(`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'evolution_api'
    `);

        console.log('Tables found:', res.rows.map(row => row.table_name));

        await client.end();
    } catch (err) {
        console.error('Database error', err);
    }
}

listTables();
