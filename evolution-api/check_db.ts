import { Client } from 'pg';

const client = new Client({
    connectionString: 'postgresql://postgres:nN0dfnfesLu5Zzuj@db.kbzilehbqybxiwldwgii.supabase.co:5432/postgres?schema=evolution_api',
});

async function checkDb() {
    try {
        await client.connect();
        console.log('Connected to database');

        await client.query('SET search_path TO evolution_api');

        const res = await client.query('SELECT count(*) FROM "Contact"');
        console.log('Contact count:', res.rows[0].count);

        const contacts = await client.query('SELECT * FROM "Contact"');
        contacts.rows.forEach(c => {
            console.log(`- Contact: ${c.pushName} (${c.remoteJid}) - Instance: ${c.instanceId}`);
        });

        const instanceRes = await client.query('SELECT * FROM "Instance"');
        console.log('Instances found:', instanceRes.rows.length);
        instanceRes.rows.forEach(row => {
            console.log(`- ${row.name} (${row.connectionStatus}) - ID: ${row.id}`);
        });

        await client.end();
    } catch (err) {
        console.error('Database connection error', err);
    }
}

checkDb();
