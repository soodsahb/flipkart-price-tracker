'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import ProductCard from '@/components/ProductCard';
import PriceChart from '@/components/PriceChart';

export default function DashboardPage() {
  const { data: session } = useSession();
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [newProductUrl, setNewProductUrl] = useState('');
  const [adding, setAdding] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [priceHistory, setPriceHistory] = useState([]);
  const [notificationTopic, setNotificationTopic] = useState('');

  useEffect(() => {
    fetchProducts();
    fetchNotificationTopic();
  }, []);

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products');
      const data = await response.json();
      if (data.success) {
        setProducts(data.products);
      }
    } catch (error) {
      console.error('Error fetching products:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchNotificationTopic = async () => {
    try {
      const response = await fetch('/api/user/notification-topic');
      const data = await response.json();
      if (data.success) {
        setNotificationTopic(data.notificationTopic);
      }
    } catch (error) {
      console.error('Error fetching notification topic:', error);
    }
  };

  const handleAddProduct = async (e) => {
    e.preventDefault();
    setAdding(true);

    try {
      const response = await fetch('/api/products/add', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ flipkartUrl: newProductUrl }),
      });

      const data = await response.json();

      if (response.ok) {
        alert('Product added successfully!');
        setNewProductUrl('');
        setShowAddModal(false);
        fetchProducts();
      } else {
        alert(data.error || 'Failed to add product');
      }
    } catch (error) {
      alert('Error adding product');
    } finally {
      setAdding(false);
    }
  };

  const handleViewHistory = async (product) => {
    setSelectedProduct(product);
    try {
      const response = await fetch(`/api/products/${product._id}/history`);
      const data = await response.json();
      setPriceHistory(data.history);
    } catch (error) {
      console.error('Error fetching history:', error);
    }
  };

  const handleDelete = async (productId) => {
    if (!confirm('Remove this product from tracking?')) return;

    try {
      const response = await fetch(`/api/products/${productId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        alert('Product removed');
        fetchProducts();
      }
    } catch (error) {
      console.error('Error deleting product:', error);
    }
  };

  if (loading) {
    return <div className="text-center py-12">Loading products...</div>;
  }

  return (
    <>
      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-2">Total Products</h3>
          <p className="text-3xl font-bold text-blue-600">{products.length}</p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-2">Price Drops</h3>
          <p className="text-3xl font-bold text-green-600">
            {products.filter((p) => p.currentPrice < p.initialPrice).length}
          </p>
        </div>
        <div className="bg-white p-6 rounded-lg shadow">
          <h3 className="text-sm text-gray-500 mb-2">Total Savings</h3>
          <p className="text-3xl font-bold text-green-600">
            ₹
            {products
              .reduce((sum, p) => sum + (p.initialPrice - p.currentPrice), 0)
              .toLocaleString()}
          </p>
        </div>
      </div>

      {/* Notification Setup Banner */}
      {session?.user && notificationTopic && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
          <h3 className="font-bold text-blue-900 mb-2">
            🔔 Setup Notifications
          </h3>
          <p className="text-sm text-blue-800 mb-3">
            Get instant alerts when prices drop! Subscribe to your notification topic:
          </p>
          <div className="bg-white p-3 rounded border border-blue-300 mb-3">
            <p className="text-xs text-gray-600 mb-1">Your ntfy.sh topic:</p>
            <code className="text-sm font-mono text-blue-600 select-all bg-blue-50 px-2 py-1 rounded">
              {notificationTopic}
            </code>
            <button
              onClick={() => {
                navigator.clipboard.writeText(notificationTopic);
                alert('Topic copied to clipboard!');
              }}
              className="ml-2 text-xs bg-blue-500 text-white px-3 py-1 rounded hover:bg-blue-600"
            >
              Copy
            </button>
          </div>
          <ol className="text-sm text-blue-800 space-y-2 mb-3 ml-4">
            <li>
              1. Install ntfy app:{' '}
              <a
                href="https://play.google.com/store/apps/details?id=io.heckel.ntfy"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                Android
              </a>
              {' | '}
              <a
                href="https://apps.apple.com/app/ntfy/id1625396347"
                target="_blank"
                rel="noopener noreferrer"
                className="underline font-medium"
              >
                iOS
              </a>
            </li>
            <li>2. Open the app and tap &quot;Subscribe to topic&quot;</li>
            <li>3. Paste your topic name from above</li>
            <li>4. Done! You&apos;ll get notifications on price drops 🎉</li>
          </ol>
          <a
            href="https://ntfy.sh"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-blue-600 hover:underline inline-block"
          >
            Learn more about ntfy.sh →
          </a>
        </div>
      )}

      {/* Add Product Button */}
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold">Your Products</h2>
        <button
          onClick={() => setShowAddModal(true)}
          className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          + Add Product
        </button>
      </div>

      {/* Products Grid */}
      {products.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-lg">
          <p className="text-gray-500 mb-4">No products added yet</p>
          <button
            onClick={() => setShowAddModal(true)}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            Add Your First Product
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {products.map((product) => (
            <ProductCard
              key={product._id}
              product={product}
              onViewHistory={handleViewHistory}
              onDelete={handleDelete}
            />
          ))}
        </div>
      )}

      {/* Add Product Modal */}
      {showAddModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-8 max-w-md w-full">
            <h3 className="text-2xl font-bold mb-4">Add Product to Track</h3>
            <form onSubmit={handleAddProduct}>
              <label className="block text-sm font-medium mb-2">
                Flipkart Product URL
              </label>
              <input
                type="url"
                value={newProductUrl}
                onChange={(e) => setNewProductUrl(e.target.value)}
                placeholder="https://www.flipkart.com/..."
                className="w-full px-4 py-2 border rounded-lg mb-4 focus:ring-2 focus:ring-blue-500"
                required
              />
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setShowAddModal(false)}
                  className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={adding}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                >
                  {adding ? 'Adding...' : 'Add Product'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Price History Modal */}
      {selectedProduct && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-2xl font-bold">Price History</h3>
              <button
                onClick={() => setSelectedProduct(null)}
                className="text-gray-500 hover:text-gray-700 text-2xl"
              >
                ×
              </button>
            </div>
            {priceHistory.length > 0 ? (
              <PriceChart
                data={priceHistory}
                productName={selectedProduct.productName}
              />
            ) : (
              <p className="text-center text-gray-500">No price history yet</p>
            )}
          </div>
        </div>
      )}
    </>
  );
}
