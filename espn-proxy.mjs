// espn-proxy.mjs
import express from 'express';
import fetch from 'node-fetch';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 8080;

app.get('/', async (req, res) => {
  const { leagueId, seasonId } = req.query;

  if (!leagueId || !seasonId) {
    return res.status(400).json({ error: 'Missing leagueId or seasonId' });
  }

  const espn_s2 = process.env.ESPN_s2;
  const swid = process.env.SWID;

  const url = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${seasonId}/segments/0/leagues/${leagueId}`;

  try {
    const response = await fetch(url, {
      headers: {
        'X-Fantasy-Source': 'kona',
        'X-Fantasy-Platform': 'kona-PROD-a7898f83',
        'X-Fantasy-Filter': '{}',
        'Referer': 'https://fantasy.espn.com/',
        'Cookie': `espn_s2=${espn_s2}; SWID=${swid}`
      }
    });

    const contentType = response.headers.get('content-type');
    const raw = await response.text();

    if (!contentType.includes('application/json')) {
      return res.status(401).json({
        error: 'Not authorized or wrong response',
        contentType,
        raw
      });
    }

    const data = JSON.parse(raw);
    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({
      error: 'Failed to fetch data from ESPN',
      details: error.message
    });
  }
});

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
