const {redis} = require('../services/redis'); // messages redis DB

const saveSessionMessage = async(req,res)=>{
    // 1. get sessionId + message --> 2. save to redis <sessionId> - <message>
    try {
        const { sessionId, role, content } = req.body;

        if (!sessionId) {
            return res.status(400).json({ error: "sessionId is required" });
        }
        if (!role) {
            return res.status(400).json({ error: "role is required" });
        }
        if (!content) {
            return res.status(400).json({ error: "content is required" });
        }


        // Build message object
        const messageObj = {role, content,timestamp: new Date().toISOString(),};

        // Save message in Redis list: session:<sessionId>:messages
        await redis.rpush(`session:${sessionId}:messages`, JSON.stringify(messageObj));

        return res.status(201).json({
        message: "Message saved successfully",
        data: messageObj,
        });
        
    } catch (error) {
        console.error("Error saving message to session :", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

const getSessionMessages = async(req,res)=>{
    // get array of all messages --> related to session
    try {
        const { sessionId } = req.body;
        if (!sessionId) {
            return res.status(400).json({ error: "sessionId is required" });
        }

        // Fetch all messages from Redis list
        const messages = await redis.lrange(`session:${sessionId}:messages`, 0, -1);

        return res.status(200).json({
        sessionId,
        messages,
        });
    } catch (error) {
        console.error("Error fetching messages from session:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

const deleteSessionMessages = async(req,res)=>{
    // 1. user provides session_id ---> 2. only delete from <session_id> - <message> redis DB
    try {
        const {sessionId} = req.body;
        if (!sessionId) {
            return res.status(400).json({ error: "sessionId is required" });
        }

        await redis.del(`session:${sessionId}:messages`);

        res.status(200).json({message: 'All chats deleted'});
    } catch (error) {
        console.error("Error deleting session :", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}

module.exports = {saveSessionMessage, getSessionMessages, deleteSessionMessages}