import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectDB from '@/lib/mongodb';
import Product from '@/models/Product';
import PriceHistory from '@/models/PriceHistory';

export async function GET(request, { params }) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    await connectDB();

    // Verify product belongs to user
    const product = await Product.findOne({
      _id: params.id,
      userId: session.user.id,
    });

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      );
    }

    // Get price history sorted by oldest first (for chart)
    const history = await PriceHistory.find({
      productId: params.id,
    }).sort({ timestamp: 1 });

    return NextResponse.json({
      success: true,
      history,
    });
  } catch (error) {
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
