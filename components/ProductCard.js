'use client';

export default function ProductCard({ product, onViewHistory, onDelete }) {
  const priceDiff = product.initialPrice - product.currentPrice;
  const priceDropPercent = ((priceDiff / product.initialPrice) * 100).toFixed(1);

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition">
      <div className="relative h-48 bg-gray-100">
        <img
          src={product.productImage || '/placeholder.png'}
          alt={product.productName}
          className="w-full h-full object-contain p-4"
        />
        {priceDiff > 0 && (
          <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded-full text-xs font-bold">
            -{priceDropPercent}%
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-gray-800 mb-2 line-clamp-2 min-h-[3rem]">
          {product.productName}
        </h3>

        <div className="space-y-2 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-500">Initial Price:</span>
            <span className="text-sm text-gray-600">₹{product.initialPrice.toLocaleString()}</span>
          </div>
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-gray-700">Current Price:</span>
            <span className="text-xl font-bold text-blue-600">
              ₹{product.currentPrice.toLocaleString()}
            </span>
          </div>
          {priceDiff > 0 && (
            <div className="text-sm text-green-600 font-medium">
              💰 You save ₹{priceDiff.toLocaleString()}!
            </div>
          )}
        </div>

        <div className="text-xs text-gray-400 mb-3">
          Last checked: {new Date(product.lastChecked).toLocaleString()}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => onViewHistory(product)}
            className="flex-1 bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 text-sm"
          >
            View History
          </button>
          <a
            href={product.flipkartUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="flex-1 bg-gray-800 text-white py-2 rounded-lg hover:bg-gray-900 text-sm text-center"
          >
            View on Flipkart
          </a>
        </div>

        <button
          onClick={() => onDelete(product._id)}
          className="w-full mt-2 bg-red-100 text-red-600 py-2 rounded-lg hover:bg-red-200 text-sm"
        >
          Remove
        </button>
      </div>
    </div>
  );
}
