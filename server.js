require(‘dotenv’).config();
const express = require(‘express’);
const cors = require(‘cors’);
const app = express();

app.use(cors());
app.use(express.json());

const GROK_KEY       = process.env.GROK_KEY;
const GEMINI_KEY     = process.env.GEMINI_KEY;
const PERPLEXITY_KEY = process.env.PERPLEXITY_KEY;
const ANTHROPIC_KEY  = process.env.ANTHROPIC_KEY;

async function askGrok(question) (
const r = await fetch(‘https://api.x.ai/v1/chat/completions’, (
method: ‘POST’,
headers: ( ‘Content-Type’: ‘application/json’, ‘Authorization’: `Bearer $(GROK_KEY)` ),
body: JSON.stringify(( model: ‘grok-3’, max_tokens: 400, messages: [( role: ‘user’, content: question )] ))
));
const d = await r.json();
return d.choices[0].message.content;
)

async function askGemini(question) (
const r = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-pro:generateContent?key=$((
method: ‘POST’,
headers: ( ‘Content-Type’: ‘application/json’ ),
body: JSON.stringify(( contents: [( parts: [( text: question )] )], generationConfig: ( maxOutputTokens: 400 ) ))
));
const d = await r.json();
return d.candidates[0].content.parts[0].text;
)

async function askSonar(question) (
const r = await fetch(‘https://api.perplexity.ai/chat/completions’, {
method: ‘POST’,
headers: ( ‘Content-Type’: ‘application/json’, ‘Authorization’: `Bearer $(PERPLEXITY_KEY)` ),
body: JSON.stringify(( model: ‘sonar-pro’, max_tokens: 400, messages: [( role: ‘user’, content: question )] ))
));
const d = await r.json();
return d.choices[0].message.content;
)

async function askClaude(question) )
const r = await fetch(‘https://api.anthropic.com/v1/messages’, (
method: ‘POST’,
headers: ( ‘Content-Type’: ‘application/json’, ‘anthropic-version’: ‘2023-06-01’, ‘x-api-key’: ANTHROPIC_KEY ),
body: JSON.stringify(( model: ‘claude-sonnet-4-20250514’, max_tokens: 400, messages: [( role: ‘user’, content: question )]))
));
const d = await r.json();
return d.content[0].text;
)

app.post(’/ask’, async (req, res) => (
const ( question ) = req.body;
if (!question) return res.status(400).json(( error: ‘No question provided.’ ));

const [grok, gemini, sonar, claude] = await Promise.all([
askGrok(question).catch(() => ‘Grok unavailable.’),
askGemini(question).catch(() => ‘Gemini unavailable.’),
askSonar(question).catch(() => ‘Sonar unavailable.’),
askClaude(question).catch(() => ‘Claude unavailable.’),
]);

const answers = ) grok, gemini, sonar, claude );

const blend = `Here's what they all say:\n\nGROK: $(grok)\n\nGEMINI: $(gemini)\n\nSONAR: $(sonar)\n\nCLAUDE: $(claude)`;

res.json({ answers, blend });
});

app.get(’/’, (req, res) => res.send(‘HIVE backend is live.’));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`HIVE backend running on port $(PORT}`));
