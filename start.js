const { spawn } = require('child_process');
const path = require('path');
const http = require('http');

// Validate environment
const requiredEnvVars = [
    'DATABASE_CONNECTION_URI',
    'SUPABASE_URL',
    'SUPABASE_ANON_KEY',
    'AUTHENTICATION_API_KEY',
    'FLOWCORE_API_KEY'
];

console.log('🔍 Validating environment variables...');
const missingVars = requiredEnvVars.filter(v => !process.env[v]);
if (missingVars.length > 0) {
    console.error('❌ Missing required environment variables:', missingVars.join(', '));
    process.exit(1);
}
console.log('✅ Environment validated\n');

console.log('🚀 Starting Evolution Lab - All Services');
console.log('==========================================');

let evolutionApi = null;
let flowcoreAi = null;
let isShuttingDown = false;

// Health check function
function checkHealth(port, serviceName) {
    return new Promise((resolve) => {
        const req = http.get(`http://localhost:${port}/health`, (res) => {
            if (res.statusCode === 200) {
                console.log(`✅ ${serviceName} health check passed`);
                resolve(true);
            } else {
                console.log(`⚠️  ${serviceName} health check failed (status: ${res.statusCode})`);
                resolve(false);
            }
        });
        req.on('error', () => {
            console.log(`⚠️  ${serviceName} not ready yet...`);
            resolve(false);
        });
        req.setTimeout(2000, () => {
            req.destroy();
            resolve(false);
        });
    });
}

// Wait for service to be healthy
async function waitForHealth(port, serviceName, maxAttempts = 30) {
    for (let i = 0; i < maxAttempts; i++) {
        const healthy = await checkHealth(port, serviceName);
        if (healthy) return true;
        await new Promise(resolve => setTimeout(resolve, 2000));
    }
    return false;
}

// Graceful shutdown
function shutdown(code = 0) {
    if (isShuttingDown) return;
    isShuttingDown = true;

    console.log('\n🛑 Shutting down gracefully...');

    const killPromises = [];

    if (flowcoreAi) {
        killPromises.push(new Promise((resolve) => {
            flowcoreAi.on('exit', resolve);
            flowcoreAi.kill('SIGTERM');
            setTimeout(() => {
                if (!flowcoreAi.killed) flowcoreAi.kill('SIGKILL');
                resolve();
            }, 5000);
        }));
    }

    if (evolutionApi) {
        killPromises.push(new Promise((resolve) => {
            evolutionApi.on('exit', resolve);
            evolutionApi.kill('SIGTERM');
            setTimeout(() => {
                if (!evolutionApi.killed) evolutionApi.kill('SIGKILL');
                resolve();
            }, 5000);
        }));
    }

    Promise.all(killPromises).then(() => {
        console.log('✅ All services stopped');
        process.exit(code);
    });
}

// Start Evolution API
console.log('\n📡 Starting Evolution API on port 8080...');
evolutionApi = spawn('npm', ['run', 'dev:stable'], {
    cwd: path.join(__dirname, 'evolution-api'),
    stdio: 'inherit',
    shell: true,
    env: { ...process.env, PORT: '8080' }
});

evolutionApi.on('error', (err) => {
    console.error('❌ Evolution API failed to start:', err);
    shutdown(1);
});

evolutionApi.on('exit', (code) => {
    if (!isShuttingDown) {
        console.error(`❌ Evolution API exited unexpectedly with code ${code}`);
        shutdown(1);
    }
});

// Wait for Evolution API to be healthy, then start Flowcore AI
console.log('⏳ Waiting for Evolution API to be ready...');
waitForHealth(8080, 'Evolution API').then((healthy) => {
    if (!healthy) {
        console.error('❌ Evolution API failed to become healthy');
        shutdown(1);
        return;
    }

    console.log('\n🔌 Starting Flowcore AI on port 3000...');
    flowcoreAi = spawn('npm', ['start'], {
        cwd: path.join(__dirname, 'flowcore-ai'),
        stdio: 'inherit',
        shell: true,
        env: {
            ...process.env,
            PORT: '3000',
            EVO_API_URL: 'http://localhost:8080'
        }
    });

    flowcoreAi.on('error', (err) => {
        console.error('❌ Flowcore AI failed to start:', err);
        shutdown(1);
    });

    flowcoreAi.on('exit', (code) => {
        if (!isShuttingDown) {
            console.error(`❌ Flowcore AI exited unexpectedly with code ${code}`);
            shutdown(1);
        }
    });

    // Wait for Flowcore AI to be healthy
    console.log('⏳ Waiting for Flowcore AI to be ready...');
    waitForHealth(3000, 'Flowcore AI').then((healthy) => {
        if (!healthy) {
            console.error('❌ Flowcore AI failed to become healthy');
            shutdown(1);
            return;
        }

        console.log('\n✅ All services started successfully!');
        console.log('==========================================');
        console.log('Evolution API: http://localhost:8080');
        console.log('Flowcore AI: http://localhost:3000');
        console.log('Manager UI: http://localhost:3000/manager');
        console.log('Platform API: http://localhost:3000/api/whatsapp/*');
        console.log('==========================================\n');
    });
});

// Handle termination signals
process.on('SIGTERM', () => {
    console.log('\n📨 SIGTERM received');
    shutdown(0);
});

process.on('SIGINT', () => {
    console.log('\n📨 SIGINT received');
    shutdown(0);
});

process.on('uncaughtException', (err) => {
    console.error('❌ Uncaught exception:', err);
    shutdown(1);
});

process.on('unhandledRejection', (reason, promise) => {
    console.error('❌ Unhandled rejection at:', promise, 'reason:', reason);
    shutdown(1);
});
