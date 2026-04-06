const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Import the Model
const Doc = require('./models/Doc');

dotenv.config();

const app = express();

// --- CORS CONFIGURATION ---
// Replace the origin with your actual Vercel frontend URL after deployment
app.use(cors({
    origin: ["http://localhost:5173", "https://your-frontend-project.vercel.app"],
    methods: ["GET", "POST"],
    credentials: true
}));

app.use(express.json());

// --- DATABASE CONNECTION ---
// Added logic to prevent multiple connections in a serverless environment
if (mongoose.connection.readyState === 0) {
    mongoose.connect(process.env.MONGO_URI)
        .then(() => console.log("✅ MongoDB Connected Successfully!"))
        .catch(err => console.error("❌ MongoDB Connection Error:", err));
}

// --- INITIALIZE GEMINI ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
// Note: Ensure your API key supports 1.5-flash or 2.0-flash as per latest availability
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); 

// --- ROUTES ---

// Root Check
app.get('/', (req, res) => {
    res.send("Studio Documentation API is Online!");
});

// 1. HISTORY ROUTE: Fetch the 10 most recent diagrams
app.get('/history', async (req, res) => {
    try {
        const history = await Doc.find().sort({ createdAt: -1 }).limit(10);
        res.status(200).json(history);
    } catch (error) {
        console.error("History Error:", error.message);
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

// 2. SMART GENERATION ROUTE: (Check Cache -> Call AI -> Save Cache)
app.post('/generate', async (req, res) => {
    const { prompt, title } = req.body;

    if (!prompt) {
        return res.status(400).json({ error: "Prompt is required" });
    }

    try {
        // STEP A: Check Cache (Optimizes Token Usage)
        const existingDoc = await Doc.findOne({ prompt: prompt.trim() });
        
        if (existingDoc) {
            console.log("💾 Found in Database! Returning cached diagram.");
            return res.json({ 
                diagram: existingDoc.diagramCode, 
                source: "cache",
                title: existingDoc.title 
            });
        }

        // STEP B: Call Gemini API
        console.log("🤖 Not in cache. Calling Gemini API...");
        const result = await model.generateContent(`
            Act as a Mermaid.js expert. 
            Convert the following description into valid Mermaid.js flowchart syntax.
            Rules:
            1. Return ONLY the raw mermaid code.
            2. Do NOT include markdown code blocks like \`\`\`mermaid.
            3. Do NOT include any introductory text or explanation.
            4. Start with a direction like 'graph TD' or 'graph LR'.
            
            Description: ${prompt}
        `);
        
        const response = await result.response;
        let text = response.text();
        
        // Clean markdown blocks if the AI accidentally includes them
        const cleanText = text.replace(/```mermaid/g, "").replace(/```/g, "").trim();

        // STEP C: Save New Record
        const newDoc = new Doc({
            title: title || "Generated Process",
            prompt: prompt.trim(),
            diagramCode: cleanText
        });

        await newDoc.save();
        console.log("⭐ New diagram saved to MongoDB!");

        res.status(200).json({ 
            diagram: cleanText, 
            source: "ai" 
        });

    } catch (error) {
        console.error("--- BACKEND ERROR ---", error.message);
        res.status(500).json({ 
            error: "Generation Failed", 
            details: error.message 
        });
    }
});

// --- VERCEL EXPORT ---
// Important: Vercel needs the app exported to handle it as a serverless function
module.exports = app;

// Local Development listener
if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => {
        console.log(`🚀 Server running on http://localhost:${PORT}`);
    });
}