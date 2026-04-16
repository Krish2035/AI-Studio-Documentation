const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Groq = require("groq-sdk");

const Doc = require('./models/Doc');

dotenv.config();
const app = express();

// --- INITIALIZE GROQ ---
const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

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

// --- ROUTES ---

app.get('/', (req, res) => {
    res.send("Studio Documentation API (Powered by Groq) is Online!");
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
        // --- CACHE CHECK ---
        const existingDoc = await Doc.findOne({ prompt: prompt.trim() });
        if (existingDoc) {
            return res.json({ 
                diagram: existingDoc.diagramCode, 
                source: "cache",
                title: existingDoc.title 
            });
        }

        // --- GROQ API IMPLEMENTATION ---
        const chatCompletion = await groq.chat.completions.create({
            messages: [
                {
                    role: "system",
                    content: `You are a specialized Mermaid.js compiler. 
                    Rules:
                    1. Output ONLY raw Mermaid code starting with 'graph TD' or 'graph LR'.
                    2. Never include markdown backticks (\`\`\`).
                    3. Never include titles, explanations, or labels ending in '>'.
                    4. IMPORTANT: Nodes with spaces MUST use quotes: A["Step One"] --> B["Step Two"].
                    5. Strictly use pipes for labels: -->|Successful| node.`
                },
                {
                    role: "user",
                    content: `Convert this logic to a valid Mermaid flowchart: ${prompt}`
                }
            ],
            model: "llama-3.3-70b-versatile",
            temperature: 0.1, 
        });

        let rawText = chatCompletion.choices[0].message.content;
        
        // --- ENHANCED SUPER-CLEAN LOGIC ---
        // 1. Remove markdown code blocks
        // 2. Remove the word 'mermaid' if it leads the string
        // 3. Remove Mermaid comments (%%)
        // 4. Strip any conversational text before the 'graph' keyword
        const cleanText = rawText
            .replace(/```mermaid/gi, "")
            .replace(/```/g, "")
            .replace(/^mermaid/gi, "")
            .replace(/%%.*$/gm, "") 
            .replace(/^[^g]*/i, "") 
            .trim();

        // Final Syntax Guard: Rejection if the output is not a graph structure
        if (!cleanText.toLowerCase().startsWith('graph')) {
            throw new Error("AI failed to generate a valid graph structure.");
        }

        // --- SAVE TO DATABASE ---
        const newDoc = new Doc({
            title: title || "Generated Process",
            prompt: prompt.trim(),
            diagramCode: cleanText
        });

        await newDoc.save();
        res.status(200).json({ diagram: cleanText, source: "ai" });

    } catch (error) {
        console.error("--- GROQ ERROR ---", error.message);
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