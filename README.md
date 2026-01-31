# 🚀 Flowcore AI - Ultimate WhatsApp Multi-Agent Platform

Flowcore AI is a high-performance, multi-instance WhatsApp orchestration platform designed for scaling AI employees, customer support bots, and marketing automation. It provides a robust bridge between the WhatsApp network and your AI/SaaS applications.

---

## 🏗️ Architecture

Flowcore AI consists of three core components working in harmony:

1.  **Evolution API (Backend Proxy):** A robust multi-instance engine based on Baileys, capable of handling 500+ concurrent WhatsApp connections.
2.  **Flowcore Service (Middleware):** A "Smart Connector" that manages instance lifecycles, intelligent QR retrieval, and centralized webhook routing.
3.  **Flowcore Manager (Dashboard):** A React-based interface for real-time monitoring, QR scanning, and instance control.

---

## ✨ Key Features

-   **Smart Connection:** Automatically handles instance creation and connection retrieval in a single API call.
-   **Multi-Instance Scaling:** Host hundreds of separate WhatsApp accounts on a single server.
-   **Real-time Webhooks:** Receive messages, status updates, and connection events instantly via standardized JSON payloads.
-   **Lite Mode Optimized:** Low RAM footprint (100-150MB per instance), perfect for high-density deployments.
-   **Unified API Key:** Simplified security model using `flowcore123` across all services.
-   **Developer Friendly:** Detailed documentation and easy integration with any AI or SaaS platform.

---

## 🛠️ Quick Start

### 1. Prerequisites
- Node.js (v18+)
- PostgreSQL (Supabase recommended)
- Git

### 2. Environment Setup
Create a `.env` file in the root directory (or use the ones in sub-folders) with:
```env
EVO_API_URL=http://localhost:8080
EVO_API_KEY=flowcore123
PORT=3000
```

### 3. Start the Platform
Run the following commands in separate terminals:

**Evolution API:**
```bash
cd evolution-api
npm run dev:stable
```

**Flowcore Service:**
```bash
cd flowcore-ai
npm run dev
```

**Manager Dashboard:**
```bash
cd evolution-api/evolution-manager-v2
npm run dev
```

---

## 📖 Documentation

-   **[Detailed API Guide](./flowcore-ai/API_DOCUMENTATION.md):** Learn how to connect, send messages, and handle webhooks.
-   **[Integration Roadmap](./.gemini/antigravity/brain/b500322b-2953-4c62-9b00-75c11de7242d/walkthrough.md):** Technical walkthrough of the platform logic.

---

## 🚀 Scaling to 500+ Users

For production scaling:
1.  **Memory:** Aim for 16GB+ RAM for 500+ active sessions.
2.  **Cache:** Enable Redis for offloading session data.
3.  **Database:** Use a managed PostgreSQL instance (like Supabase).

---

## 🔒 Security
All sessions and messages are authenticated via the `apikey` header. The default development key is `flowcore123`.

---

© 2026 Flowcore AI. Built for the next generation of AI Employee Platforms.
