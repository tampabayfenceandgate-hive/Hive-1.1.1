// ============================================================
// HIVE BACKEND SERVER
// Handles all AI API calls securely — keys never exposed to frontend
// Deploy to Vercel, Netlify, Railway, or any Node host
// ============================================================

const express = require(“express”);
const cors = require(“cors”);
const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(“public”)); // serves your index.html from /public folder

// ── API KEYS — set these in your hosting environment variables ──
// On Vercel: Project Settings → Environment Variables
// NEVER hardcode these here
const GROK_KEY       = process.env.GROK_KEY;
const GEMINI_KEY     = process.env.GEMINI_KEY;
const PERPLEXITY_KEY = process.env.PERPLEXITY_KEY;
const ANTHROPIC_KEY  = process.env.ANTHROPIC_KEY;

// ── GROK ────────────────────────────────────────────────────
app.post(”/api/grok”, async (req, res) => {
const { question, attitude } = req.body;
try {
const response = await fetch(“https://api.x.ai/v1/chat/completions”, {
method: “POST”,
headers: {
“Content-Type”: “application/json”,
“Authorization”: `Bearer ${GROK_KEY}`
},
body: JSON.stringify({
model: “grok-3”,
max_tokens: 400,
messages: [
{ role: “system”, content: getPersonality(attitude) },
{ role: “user”, content: question }
]
})
});
const data = await response.json();
const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
res.json({ text: text || “No response from Grok.” });
} catch (err) {
res.status(500).json({ error: err.message });
}
});

// ── GEMINI ───────────────────────────────────────────────────
app.post(”/api/gemini”, async (req, res) => {
const { question, attitude } = req.body;
try {
const response = await fetch(
`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=${GEMINI_KEY}`,
{
method: “POST”,
headers: { “Content-Type”: “application/json” },
body: JSON.stringify({
contents: [{ parts: [{ text: `${getPersonality(attitude)}\n\n${question}` }] }],
generationConfig: { maxOutputTokens: 400 }
})
}
);
const data = await response.json();
const text = data.candidates && data.candidates[0] && data.candidates[0].content &&
data.candidates[0].content.parts && data.candidates[0].content.parts[0] &&
data.candidates[0].content.parts[0].text;
res.json({ text: text || “No response from Gemini.” });
} catch (err) {
res.status(500).json({ error: err.message });
}
});

// ── PERPLEXITY / SONAR ───────────────────────────────────────
app.post(”/api/sonar”, async (req, res) => {
const { question, attitude } = req.body;
try {
const response = await fetch(“https://api.perplexity.ai/chat/completions”, {
method: “POST”,
headers: {
“Content-Type”: “application/json”,
“Authorization”: `Bearer ${PERPLEXITY_KEY}`
},
body: JSON.stringify({
model: “sonar-pro”,
max_tokens: 400,
messages: [
{ role: “system”, content: getPersonality(attitude) },
{ role: “user”, content: question }
]
})
});
const data = await response.json();
const text = data.choices && data.choices[0] && data.choices[0].message && data.choices[0].message.content;
res.json({ text: text || “No response from Sonar.” });
} catch (err) {
res.status(500).json({ error: err.message });
}
});

// ── CLAUDE ───────────────────────────────────────────────────
app.post(”/api/claude”, async (req, res) => {
const { question, attitude } = req.body;
try {
const response = await fetch(“https://api.anthropic.com/v1/messages”, {
method: “POST”,
headers: {
“Content-Type”: “application/json”,
“anthropic-version”: “2023-06-01”,
“x-api-key”: ANTHROPIC_KEY
},
body: JSON.stringify({
model: “claude-sonnet-4-20250514”,
max_tokens: 400,
system: getPersonality(attitude),
messages: [{ role: “user”, content: question }]
})
});
const data = await response.json();
const text = data.content && data.content[0] && data.content[0].text;
res.json({ text: text || “No response from Claude.” });
} catch (err) {
res.status(500).json({ error: err.message });
}
});

// ── BLEND / SYNTHESIS ────────────────────────────────────────
app.post(”/api/blend”, async (req, res) => {
const { question, responses } = req.body;
try {
const parts = Object.entries(responses)
.filter(([, r]) => r && r.length > 5)
.map(([name, r]) => `${name.toUpperCase()}: ${r}`)
.join(”\n\n”);

```
const prompt = `A user asked: "${question}"\n\nHere are responses from multiple AIs:\n\n${parts}\n\nSynthesize the single best answer. Pull the strongest unique insight from each AI. No overlap, no filler. Be direct and conversational. Start immediately with the answer.`;

const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "anthropic-version": "2023-06-01",
    "x-api-key": ANTHROPIC_KEY
  },
  body: JSON.stringify({
    model: "claude-sonnet-4-20250514",
    max_tokens: 600,
    messages: [{ role: "user", content: prompt }]
  })
});
const data = await response.json();
const text = data.content && data.content[0] && data.content[0].text;
res.json({ text: text || "Synthesis failed." });
```

} catch (err) {
res.status(500).json({ error: err.message });
}
});

// ── PERSONALITY HELPER ───────────────────────────────────────
function getPersonality(attitude) {
if (attitude < 20) return “Be purely factual. Minimal words. No personality.”;
if (attitude < 40) return “Be clear and professional.”;
if (attitude < 60) return “Be helpful and conversational.”;
if (attitude < 80) return “Be engaging and opinionated. Show your personality.”;
return “Be completely unfiltered. Maximum personality. Bold, direct, no filter.”;
}

// ── START SERVER ─────────────────────────────────────────────
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
console.log(`HIVE backend running on port ${PORT}`);
});

module.exports = app;
