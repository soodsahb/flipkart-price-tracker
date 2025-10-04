import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import User from '@/models/User';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';

export async function POST(request) {
  try {
    const { name, email, password } = await request.json();

    if (!name || !email || !password) {
      return NextResponse.json(
        { error: 'All fields are required' },
        { status: 400 }
      );
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: 'Password must be at least 6 characters' },
        { status: 400 }
      );
    }

    await connectDB();

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    // Generate unique notification topic
    const notificationTopic = `flipkart-price-${crypto.randomBytes(8).toString('hex')}`;

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      notificationTopic,
    });

    return NextResponse.json({
      success: true,
      message: 'User registered successfully!',
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
        notificationTopic: user.notificationTopic,
      },
    });
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: error.message },
      { status: 500 }
    );
  }
}
