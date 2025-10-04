const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const cron = require('node-cron');

const dev = process.env.NODE_ENV !== 'production';
const hostname = 'localhost';
const port = process.env.PORT || 3000;

const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);
      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  }).listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    
    // Start cron job after server is ready
    startCronJobs();
  });
});

function startCronJobs() {
  // Run price check every hour
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running scheduled price check...');
    
    try {
      const baseUrl = process.env.NEXTAUTH_URL || `http://localhost:${port}`;
      const response = await fetch(`${baseUrl}/api/cron/check-prices`, {
        headers: {
          'Authorization': `Bearer ${process.env.CRON_SECRET}`,
        },
      });

      const data = await response.json();
      console.log('✅ Price check completed:', data);
    } catch (error) {
      console.error('❌ Cron job failed:', error);
    }
  });

  console.log('✅ Cron jobs initialized');
}
