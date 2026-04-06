const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const { GoogleGenerativeAI } = require("@google/generative-ai");

const Doc = require('./models/Doc');

dotenv.config();
const app = express();

// --- CORS CONFIGURATION ---
app.use(cors({
    origin: [
        "http://localhost:5173", 
        "https://ai-studio-documentation-l2ek.vercel.app" 
    ],
    methods: ["GET", "POST", "OPTIONS"],
    credentials: true
}));

app.use(express.json());

// --- DATABASE CONNECTION ---
const connectDB = async () => {
    if (mongoose.connection.readyState >= 1) return;
    try {
        await mongoose.connect(process.env.MONGO_URI);
        console.log("✅ MongoDB Connected");
    } catch (err) {
        console.error("❌ MongoDB Error:", err.message);
    }
};

// --- INITIALIZE GEMINI ---
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send("Studio Documentation API is Online!");
});

app.get('/history', async (req, res) => {
    await connectDB();
    try {
        const history = await Doc.find().sort({ createdAt: -1 }).limit(10);
        res.status(200).json(history);
    } catch (error) {
        res.status(500).json({ error: "Failed to fetch history" });
    }
});

app.post('/generate', async (req, res) => {
    await connectDB();
    const { prompt, title } = req.body;
    if (!prompt) return res.status(400).json({ error: "Prompt is required" });

    try {
        const existingDoc = await Doc.findOne({ prompt: prompt.trim() });
        if (existingDoc) {
            return res.json({ 
                diagram: existingDoc.diagramCode, 
                source: "cache",
                title: existingDoc.title 
            });
        }

        // --- USING THE LATEST STABLE MODEL ---
        const model = genAI.getGenerativeModel({ 
            model: "gemini-2.0-flash" 
        });

        const result = await model.generateContent(`
            Act as a Mermaid.js expert. 
            Convert the following description into valid Mermaid.js flowchart syntax.
            Rules:
            1. Return ONLY the raw mermaid code.
            2. Do NOT include markdown code blocks.
            3. Start with 'graph TD' or 'graph LR'.
            
            Description: ${prompt}
        `);
        
        const response = await result.response;
        const text = response.text();
        const cleanText = text.replace(/```mermaid/g, "").replace(/```/g, "").trim();

        const newDoc = new Doc({
            title: title || "Generated Process",
            prompt: prompt.trim(),
            diagramCode: cleanText
        });

        await newDoc.save();
        res.status(200).json({ diagram: cleanText, source: "ai" });

    } catch (error) {
        console.error("--- AI ERROR ---", error.message);
        res.status(500).json({ 
            error: "Generation Failed", 
            details: error.message 
        });
    }
});

module.exports = app;

if (process.env.NODE_ENV !== 'production') {
    const PORT = process.env.PORT || 5000;
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}