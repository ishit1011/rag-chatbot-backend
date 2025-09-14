🚀 Project Overview
-------------------

This backend powers an **AI-powered news chatbot**. It handles **data ingestion, embedding creation, caching session history in Redis, and serving AI responses** via Gemini API.

📰 Embeddings: Creation, Indexing & Storage
-------------------------------------------

### Step 1: Data Ingestion

*   Sources: ~50 RSS feeds from global news (BBC, NYTimes, Al Jazeera, etc.)
    
*   Tools: rss-parser (RSS parsing), cheerio (HTML scraping).
    
*   Each article stored as an object:
    

`   {    id: entry.link,    title: entry.title,    url: entry.link,    published: entry.pubDate,    content_raw: extractedText  }   `

### Step 2: Text Chunking

*   Splits article into **500-word chunks with 50-word overlap**.
    
*   Ensures semantic continuity and avoids long embeddings.
    

### Step 3: Generating Embeddings

*   Model: jina-embeddings-v2-base-en.
    
*   Output: 768-dim dense vector per chunk.
    

### Step 4: Indexing & Storage

*   **Upstash Vector DB** (serverless).
    
*   Config: 768-dimension, cosine similarity.
    
*   Why? → Fully hosted, cost-efficient, simple REST API.
    

🔒 Redis Caching & Session History
----------------------------------

### Current Setup

*   **Redis DB 1 → Session Messages**
    
    *   Key: → Value: messages\[\]
        
    *   Fast read/write for chat history.
        
*   **Redis DB 2 → Email ↔ Session Mapping**
    
    *   Key: → Value:
        
    *   Ensures **1 user = 1 session**.
        
    *   Survives chat clear → avoids re-issuing new session IDs.
        
*   **Planned MySQL DB** (Permanent Storage)
    
    *   Will replace Redis DB2.
        
    *   Schema: User ↔ Session ↔ Messages.
        
    *   Supports soft deletes & history recovery.
        

🔐 API Routes
-------------

RoutePurpose :

POST /create-user-sessionCreate/retrieve session for authenticated user

POST /save-messageSave a user/AI message under session

POST /get-messagesRetrieve session messages

POST /clear-sessionClear session messages

POST /get-responseGet AI response from Gemini API & save message

*   Each route uses middleware verifyGoogleToken to validate Google idToken.
    

⚡ End-to-End Backend Flow
-------------------------

1.  User logs in → frontend sends idToken.
    
2.  /create-user-session → validates user & ensures session exists.
    
3.  /save-message → stores messages in Redis DB1.
    
4.  /get-response → queries Gemini + stores AI reply.
    
5.  /get-messages → restores session history.
    
6.  /clear-session → wipes chat but retains session ID.
    

🛠 Design Decisions
-------------------

*   **Redis TTL**:
    
    *   User ↔ Session mapping persists until logout.
        
*   **Cache warning solution**:
    
    *   On login, preload last N messages into Redis.
        
*   **Fallback MySQL**:
    
    *   For permanent history & multi-device sync.
        
*   **Scalability**:
    
    *   Multi-device login & refresh token support planned.
