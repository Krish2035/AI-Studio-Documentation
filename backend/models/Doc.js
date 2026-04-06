const mongoose = require('mongoose');

const DocSchema = new mongoose.Schema({
    title: { type: String, required: true, default: "Untitled" },
    prompt: { type: String, required: true },
    diagramCode: { type: String, required: true },
    createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Doc', DocSchema);