import axios from 'axios';

const API_URL = 'http://localhost:8080';
const API_KEY = 'flowcore123';
const INSTANCE_NAME = 'samir khadka G';

async function verifyContacts() {
    try {
        console.log(`Checking contacts for instance: ${INSTANCE_NAME}...`);

        // First check instance status
        const statusRes = await axios.get(`${API_URL}/instance/connectionState/${INSTANCE_NAME}`, {
            headers: { 'apikey': API_KEY }
        });
        console.log('Instance Status:', JSON.stringify(statusRes.data, null, 2));

        // Check contact count from fetchInstances
        const instancesRes = await axios.get(`${API_URL}/instance/fetchInstances`, {
            headers: { 'apikey': API_KEY }
        });
        console.log('Full Instances Response:', JSON.stringify(instancesRes.data, null, 2));

        const instanceData = Array.isArray(instancesRes.data)
            ? instancesRes.data.find((i: any) => i.instance && i.instance.instanceName === INSTANCE_NAME) || instancesRes.data.find((i: any) => i.name === INSTANCE_NAME)
            : null;

        if (instanceData) {
            if (instanceData._count) {
                console.log('Instance Data Count:', JSON.stringify(instanceData._count, null, 2));
            } else {
                console.log('Instance found but no _count property');
            }
        } else {
            console.log('Instance not found in fetchInstances list');
        }

        // Try to fetch contacts directly
        const contactsRes = await axios.post(`${API_URL}/chat/findContacts/${INSTANCE_NAME}`, {}, {
            headers: { 'apikey': API_KEY }
        });

        console.log('Contacts endpoint response status:', contactsRes.status);
        console.log('Contacts found:', contactsRes.data.length);
        if (contactsRes.data.length > 0) {
            console.log('First contact example:', JSON.stringify(contactsRes.data[0], null, 2));
        }

    } catch (error: any) {
        console.error('Error verifying contacts:');
        if (error.response) {
            console.error('Status:', error.response.status);
            console.error('Data:', JSON.stringify(error.response.data, null, 2));
        } else {
            console.error(error.message);
        }
    }
}

verifyContacts();
