# Flowcore AI - WhatsApp API Documentation

**Base URL:** `http://localhost:3000`
**Public Base URL (Live):** `https://29513a195b2b3f.lhr.life`

---

## Instance Management

### 1. Create or Connect Instance (Smart Connection)

```http
POST /api/whatsapp/connect
Content-Type: application/json
apikey: flowcore123

{
    "instanceName": "my_bot"
}
```

> [!NOTE]
> **Smart Behavior:** This endpoint automatically detects if the instance exists. If it does, it retrieves the current QR code. If not, it creates a new instance. You don't need to check existence manually.

**Response:**
```json
{
    "instance": {
        "instanceName": "my_bot",
        "status": "open" 
    },
    "qrcode": "2@...base64_string..."
}
```

Display the QR code for user to scan with WhatsApp.

---

### 2. List All Instances

```http
GET /api/whatsapp/instances
```

**Response:**
```json
[
    {
        "name": "my_bot",
        "connectionStatus": "open",
        "ownerJid": "919876543210@s.whatsapp.net",
        "profileName": "John Doe"
    }
]
```

---

### 3. Get Instance Status

```http
GET /api/whatsapp/status/:instanceName
```

**Response:**
```json
{
    "instance": "my_bot",
    "state": "open"
}
```

States: `open` (connected), `close` (disconnected), `connecting`

---

### 4. Restart Instance

```http
POST /api/whatsapp/restart
Content-Type: application/json

{
    "instanceName": "my_bot"
}
```

---

### 5. Disconnect (Logout)

```http
POST /api/whatsapp/logout
Content-Type: application/json

{
    "instanceName": "my_bot"
}
```

---

### 6. Delete Instance

```http
DELETE /api/whatsapp/delete/:instanceName
```

---

## Messaging

### 7. Send Text Message

```http
POST /api/whatsapp/send
Content-Type: application/json

{
    "instanceName": "my_bot",
    "number": "919876543210",
    "message": "Hello from Flowcore AI!"
}
```

**Note:** Number must include country code, no + or spaces.

**Response:**
```json
{
    "key": {
        "remoteJid": "919876543210@s.whatsapp.net",
        "id": "ABC123..."
    },
    "status": "PENDING"
}
```

---

## Contacts

### 8. Fetch Contacts

```http
GET /api/whatsapp/contacts/:instanceName
```

**Response:**
```json
[
    {
        "id": "919876543210@s.whatsapp.net",
        "pushName": "John Doe",
        "profilePictureUrl": "https://..."
    }
]
```

---

## Webhooks (Receiving Messages)

Your platform receives messages via webhook. Configure your endpoint to receive:

```http
POST /webhook/evolution
```

**Incoming Message Event (messages.upsert):**
```json
{
    "event": "messages.upsert",
    "instance": "my_bot",
    "data": {
        "key": {
            "remoteJid": "919876543210@s.whatsapp.net",
            "fromMe": false,
            "id": "ABC123..."
        },
        "message": {
            "conversation": "Hello, I need help!"
        },
        "messageTimestamp": 1706700000
    }
}
```

**Connection Update Event:**
```json
{
    "event": "connection.update",
    "instance": "my_bot",
    "data": {
        "status": "open"
    }
}
```

---

## Integration Flow

```
┌─────────────────────────────────────────────────────────────┐
│                     FLOWCORE.AI PLATFORM                     │
├─────────────────────────────────────────────────────────────┤
│                                                             │
│  1. User clicks "Connect WhatsApp"                          │
│     → POST /api/whatsapp/connect                            │
│     → Display QR code to user                               │
│                                                             │
│  2. User scans QR with WhatsApp                             │
│     → Connection established                                │
│     → Status changes to "open"                              │
│                                                             │
│  3. Customer sends message to WhatsApp                      │
│     → Webhook receives messages.upsert                      │
│     → Route to AI agent for processing                      │
│                                                             │
│  4. AI generates response                                   │
│     → POST /api/whatsapp/send                               │
│     → Message delivered to customer                         │
│                                                             │
└─────────────────────────────────────────────────────────────┘
```

---

## Error Handling

All endpoints return JSON. On error:

```json
{
    "error": "Error message",
    "details": { ... }
}
```

HTTP status codes:
- `200` - Success
- `400` - Bad request (missing fields)
- `500` - Server error

---

## Environment Variables

```env
PORT=3000
EVO_API_URL=http://localhost:8080
EVO_API_KEY=flowcore123
```

**Note:** Both the Evolution API and Flowcore Service now use `apikey: flowcore123`.

**Note:** All requests to Flowcore AI Service must include header `apikey: flowcore123`.
