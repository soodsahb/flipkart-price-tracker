import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import PriceHistory from '@/models/PriceHistory';
import User from '@/models/User';
import { scrapeFlipkartPrice } from '@/lib/flipkartScraper';
import { sendPriceDropNotification } from '@/lib/notifications';

export async function GET(request) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization');
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    const products = await Product.find({ isActive: true });
    console.log(`⏰ Checking ${products.length} products...`);

    let checkedCount = 0;
    let priceDropsFound = 0;
    let notificationsSent = 0;

    for (const product of products) {
      try {
        console.log(`📦 Checking: ${product.productName}`);

        // Scrape current price
        const scrapedData = await scrapeFlipkartPrice(product.flipkartUrl);
        const newPrice = scrapedData.price;
        const oldPrice = product.currentPrice;

        console.log(`   Old: ₹${oldPrice}, New: ₹${newPrice}`);

        // Check if price changed
        if (newPrice !== oldPrice) {
          // Save price to history
          await PriceHistory.create({
            productId: product._id,
            price: newPrice,
          });

          // If price dropped, send notification
          if (newPrice < oldPrice) {
            priceDropsFound++;
            console.log(`   ✅ Price drop detected! Sending notification...`);

            // Get user details
            const user = await User.findById(product.userId);
            
            if (user && user.notificationTopic) {
              const result = await sendPriceDropNotification(
                user,
                product,
                oldPrice,
                newPrice
              );

              if (result.success) {
                notificationsSent++;
              }
            }
          } else {
            console.log(`   📈 Price increased`);
          }

          // Update product
          product.currentPrice = newPrice;
        } else {
          console.log(`   ⏺️  No change`);
        }

        product.lastChecked = new Date();
        await product.save();
        checkedCount++;

        // Delay to avoid rate limiting
        await new Promise((resolve) => setTimeout(resolve, 2000));
      } catch (error) {
        console.error(`❌ Error checking product ${product._id}:`, error.message);
      }
    }

    const summary = {
      success: true,
      message: 'Price check completed',
      stats: {
        totalProducts: products.length,
        checkedProducts: checkedCount,
        priceDropsFound,
        notificationsSent,
      },
      timestamp: new Date().toISOString(),
    };

    console.log('📊 Summary:', summary);
    return NextResponse.json(summary);
  } catch (error) {
    console.error('❌ Cron error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
