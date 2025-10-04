import Link from 'next/link';

export default function Home() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-gray-800 mb-4">
          📊 Flipkart Price Tracker
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Track prices, save money, shop smart!
        </p>
        
        <div className="flex gap-4 justify-center">
          <Link
            href="/login"
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-900 transition"
          >
            Register
          </Link>
        </div>
      </div>
    </div>
  );
}
