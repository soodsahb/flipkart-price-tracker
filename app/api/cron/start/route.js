import { NextResponse } from 'next/server';
import { startPriceCheckCronTest } from '@/lib/cronJobs';

let cronStarted = false;

export async function GET() {
  if (cronStarted) {
    return NextResponse.json({
      message: 'Cron job already running',
    });
  }

  startPriceCheckCronTest(); // Use test version (every minute)
  cronStarted = true;

  return NextResponse.json({
    success: true,
    message: 'Cron job started! Will run every minute',
  });
}
