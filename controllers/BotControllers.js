const {askGemini} = require('../services/geminiService')

const getGeminiResponse = async(req,res) =>{
    try {
        const {userQuery} = req.body;
        if (!userQuery) {
            return res.status(400).json({ error: "userQuery is required" });
        }
        const response = await askGemini(userQuery);
        
        return res.status(200).json({response});
    } catch (error) {
        console.error("Error fetching gemini response :", error);
        return res.status(500).json({ error: "Error fetching gemini response" });
    }
}

module.exports = {getGeminiResponse}