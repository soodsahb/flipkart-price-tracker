import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import PriceHistory from '@/models/PriceHistory';
import { scrapeFlipkartPrice } from '@/lib/flipkartScraper';

export async function POST(request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { error: 'You must be logged in to add products' },
        { status: 401 }
      );
    }

    const { flipkartUrl } = await request.json();

    // Validate URL
    if (!flipkartUrl || !flipkartUrl.includes('flipkart.com')) {
      return NextResponse.json(
        { error: 'Please provide a valid Flipkart product URL' },
        { status: 400 }
      );
    }

    await connectDB();

    // Check if product already exists for this user
    const existingProduct = await Product.findOne({
      userId: session.user.id,
      flipkartUrl,
      isActive: true,
    });

    if (existingProduct) {
      return NextResponse.json(
        { error: 'This product is already in your wishlist' },
        { status: 400 }
      );
    }

    // Scrape product data from Flipkart
    console.log('Scraping product from:', flipkartUrl);
    const scrapedData = await scrapeFlipkartPrice(flipkartUrl);

    // Create product
    const product = await Product.create({
      userId: session.user.id,
      flipkartUrl,
      productName: scrapedData.productName,
      productImage: scrapedData.productImage,
      currentPrice: scrapedData.price,
      initialPrice: scrapedData.price,
      lastChecked: new Date(),
    });

    // Save initial price history
    await PriceHistory.create({
      productId: product._id,
      price: scrapedData.price,
    });

    return NextResponse.json({
      success: true,
      message: 'Product added to wishlist successfully!',
      product: {
        id: product._id,
        name: product.productName,
        price: product.currentPrice,
        image: product.productImage,
      },
    });
  } catch (error) {
    console.error('Add product error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
