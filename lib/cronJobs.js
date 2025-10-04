import cron from 'node-cron';

export function startPriceCheckCron() {
  // Run every hour (at minute 0)
  cron.schedule('0 * * * *', async () => {
    console.log('⏰ Running scheduled price check...');
    
    try {
      const response = await fetch(
        `${process.env.NEXTAUTH_URL}/api/cron/check-prices`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
        }
      );

      const data = await response.json();
      console.log('✅ Price check completed:', data);
    } catch (error) {
      console.error('❌ Cron job failed:', error);
    }
  });

  console.log('✅ Cron job scheduled: Price check every hour');
}

// For testing - runs every minute
export function startPriceCheckCronTest() {
  cron.schedule('* * * * *', async () => {
    console.log('⏰ [TEST] Running price check...');
    
    try {
      const response = await fetch(
        `${process.env.NEXTAUTH_URL}/api/cron/check-prices`,
        {
          headers: {
            Authorization: `Bearer ${process.env.CRON_SECRET}`,
          },
        }
      );

      const data = await response.json();
      console.log('✅ Price check completed:', data);
    } catch (error) {
      console.error('❌ Cron job failed:', error);
    }
  });

  console.log('✅ [TEST] Cron job scheduled: Every minute');
}
