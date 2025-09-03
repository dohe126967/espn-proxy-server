// espn-proxy.mjs
import http from 'http';
import url from 'url';
import fetch from 'node-fetch';

const espn_s2 = process.env.ESPN_s2;
const swid = process.env.SWID;

const server = http.createServer(async (req, res) => {
  const parsedUrl = url.parse(req.url, true);
  const { pathname, query } = parsedUrl;

  if (pathname === '/' && query.leagueId && query.seasonId) {
    const { leagueId, seasonId } = query;
    const apiUrl = `https://fantasy.espn.com/apis/v3/games/ffl/seasons/${seasonId}/segments/0/leagues/${leagueId}`;

    try {
      const response = await fetch(apiUrl, {
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
        res.writeHead(401, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({
          error: 'Not authorized or wrong response',
          contentType,
          raw
        }));
        return;
      }

      const data = JSON.parse(raw);
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify(data));

    } catch (err) {
      res.writeHead(500, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ error: 'Failed to fetch data from ESPN', details: err.message }));
    }
  } else {
    res.writeHead(404, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({ error: 'Invalid path or missing query params' }));
  }
});

const PORT = process.env.PORT || 8080;
server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
