import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import PriceHistory from '@/models/PriceHistory';
import User from '@/models/User';
import { scrapeFlipkartPrice } from '@/lib/flipkartScraper';

export async function POST(request) {
  try {
    const { flipkartUrl, userEmail } = await request.json();

    if (!flipkartUrl || !userEmail) {
      return NextResponse.json(
        { error: 'flipkartUrl and userEmail are required' },
        { status: 400 }
      );
    }

    await connectDB();

    // Find user
    const user = await User.findOne({ email: userEmail });
    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      );
    }

    // Scrape product
    console.log('Scraping:', flipkartUrl);
    const scrapedData = await scrapeFlipkartPrice(flipkartUrl);
    console.log('Scraped data:', scrapedData);

    // Create product
    const product = await Product.create({
      userId: user._id,
      flipkartUrl,
      productName: scrapedData.productName,
      productImage: scrapedData.productImage,
      currentPrice: scrapedData.price,
      initialPrice: scrapedData.price,
      lastChecked: new Date(),
    });

    // Save price history
    await PriceHistory.create({
      productId: product._id,
      price: scrapedData.price,
    });

    return NextResponse.json({
      success: true,
      message: 'Product added successfully!',
      product: {
        id: product._id,
        name: product.productName,
        price: product.currentPrice,
        image: product.productImage,
        url: product.flipkartUrl,
      },
    });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
