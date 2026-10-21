const express = require('express');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Enable CORS for all incoming requests from web browsers
app.use(cors());

// Serve static frontend files from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Backend Proxy Endpoint for Mini-League Standings
app.get('/api/league/:leagueId', async (req, res) => {
  try {
    const { leagueId } = req.params;
    const fplUrl = `https://fantasy.premierleague.com/api/leagues-classic/${leagueId}/standings/`;
    
    // Fetch directly from FPL from server-side (where CORS does not apply)
    const response = await fetch(fplUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });

    if (!response.ok) {
      return res.status(response.status).json({ error: 'League not found or private' });
    }

    const data = await response.json();
    res.json(data);
  } catch (error) {
    console.error('API Error:', error);
    res.status(500).json({ error: 'Failed to fetch league data from FPL' });
  }
});

// Add this new endpoint to your server.js file
app.get('/api/entry/:entryId/history', async (req, res) => {
  try {
    const { entryId } = req.params;
    const response = await fetch(`https://fantasy.premierleague.com/api/entry/${entryId}/history/`, {
      headers: { 'User-Agent': 'Mozilla/5.0' }
    });
    if (!response.ok) throw new Error('Failed to fetch history');
    const data = await response.json();
    res.json(data);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch manager history' });
  }
});

// Fallback: serve index.html for any other route
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
