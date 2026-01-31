# 📟 Flowcore AI - WhatsApp API Reference

**The intelligent bridge for multi-agent WhatsApp orchestration.**

- **Local Base URL:** `http://localhost:3000`
- **Public Entry Point:** `https://29513a195b2b3f.lhr.life`
- **Authentication:** Header `apikey: flowcore123`

---

## 🏗️ Core Instance Management

### 1. Smart Connection (The All-in-One)
This is the only endpoint you'll likely need for onboarding users. It intelligently detects if an instance exists and returns a QR code accordingly.

```http
POST /api/whatsapp/connect
Content-Type: application/json
apikey: flowcore123

{
    "instanceName": "user_id_001"
}
```

> [!TIP]
> **Pro-Tip:** Use your internal database User ID as the `instanceName`. This keeps every user's connection perfectly isolated.

**Sample Response:**
```json
{
    "instance": {
        "instanceName": "user_id_001",
        "status": "connecting"
    },
    "qrcode": "2@...base64_string..."
}
```

---

### 2. Global Monitoring
Retrieve all active instances and their current connection status.

```http
GET /api/whatsapp/instances
```

---

### 3. Instance Lifecycle Control

| Action | Endpoint | Method |
| :--- | :--- | :--- |
| **Status Check** | `/api/whatsapp/status/:name` | `GET` |
| **Hard Restart** | `/api/whatsapp/restart` | `POST` |
| **Logout** | `/api/whatsapp/logout` | `POST` |
| **Pure Delete** | `/api/whatsapp/delete/:name` | `DELETE` |

---

## 💬 Messaging & Interaction

### 4. Send Message (Text)
Send high-speed WhatsApp messages from any connected instance.

```http
POST /api/whatsapp/send
{
    "instanceName": "user_id_001",
    "number": "1234567890",
    "message": "Hello from Flowcore AI!"
}
```

> [!IMPORTANT]
> **Number Format:** Always use the full country code without `+` or spaces (e.g., `919876543210`).

---

## 🪝 Webhooks (Receiving Events)

Configure your app to listen at:
`POST /webhook/evolution`

**Incoming Message Event:**
```json
{
    "event": "messages.upsert",
    "instance": "user_id_001",
    "data": {
        "message": { "conversation": "Hey! How can I buy?" }
    }
}
```

---

## 🚀 Scaling & Performance

Flowcore AI is optimized for extreme density.
- **RAM per User:** ~120MB
- **Concurrency:** Verified for 500+ active users.
- **Persistence:** Configurable to Supabase/PostgreSQL for long-term message storage.

---

© 2026 Flowcore AI Platform. Build Faster. Scale Smarter.
