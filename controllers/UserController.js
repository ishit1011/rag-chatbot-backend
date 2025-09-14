
const {redis_sessionID} = require('../services/sessionIdRedis'); // email-session redis DB
const { v4: uuidv4 } = require("uuid");

const createUserSession = async(req,res)=>{
    // 1. frontend gives email --> 2. checks if session id present in session DB ---> 3. generate sessionId(if NOT) ---> 3. save in sessionID Redis <email>:<sessionID> 
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ error: "Email is required" });
        }


        let sessionId = await redis_sessionID.get(`session:${email}`);

        if (!sessionId) {
            sessionId = uuidv4();
            await redis_sessionID.set(`session:${email}`, sessionId);
        }

        return res.status(201).json({
        message: "Session created successfully",
        email,
        sessionId,
        });
    } catch (error) {
        console.error("Error creating session:", error);
        return res.status(500).json({ error: "Internal Server Error" });
    }
}


module.exports = {createUserSession};