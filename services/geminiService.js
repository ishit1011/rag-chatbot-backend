const {GoogleGenerativeAI} = require('@google/generative-ai');
const {jinaEmbed} = require('../scripts/feedDataServer');
const upstashVector = require('../services/vectorDB');

// Initialize with your API key
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const askGemini = async(query)=>{
    try {
    // Choose the model
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

    // 1. convert user query to vector embedding
    const queryVector = await jinaEmbed(query);

    // 2. get top-K results from vector DB over the user query
    const topKResults = await upstashVector.query({
        vector: queryVector,
        topK: 5,
        includeMetadata: true,
    });

    
    if (!topKResults || topKResults.length === 0) {
        return "I don’t know the answer to that based on the news articles I’ve read.";
    }

    // 3. Calling Gemini for results
    const context = topKResults.map(r => r.metadata.text).join("\n\n");

    const prompt = `
    You are a news assistant. 
    Answer the question using ONLY the following context:

    ${context}

    Question: ${query}

    Rules:
    - Reply in plain text only.
    - Do not use *, -, #, markdown, or any special formatting.
    - Output must be a clean paragraph of plain sentences only.
    - Keep the text clean and readable and concise.`;

    const result = await model.generateContent(prompt);

    // Extract text response
    const response = result.response.text();
    return response;
  } catch (error) {
    console.error("Error calling Gemini API:", error);
    return 'The news assistant is temporarily unavailable, please try again.';
  }
}

module.exports = {askGemini}