// app/test-tiktok/page.jsx
'use client';

import { useEffect, useState } from 'react';
import { tiktokPixel } from '../../lib/tiktokPixel';

export default function TestTikTokPage() {
  const [testResults, setTestResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  const runTests = async () => {
    setIsLoading(true);
    setTestResults([]);
    
    try {
      // Test ViewContent
      const testProduct = {
        id: 'test-product-123',
        name: 'Test Product',
        category: 'anillos',
        price: 999
      };
      
      await tiktokPixel.trackViewContentEnhanced(testProduct);
      setTestResults(prev => [...prev, '✅ ViewContent test passed']);
      
      // Test AddToCart
      await tiktokPixel.trackAddToCartEnhanced(testProduct, 1);
      setTestResults(prev => [...prev, '✅ AddToCart test passed']);
      
      setTestResults(prev => [...prev, '🎉 All TikTok Events API tests passed!']);
    } catch (error) {
      console.error('Test error:', error);
      setTestResults(prev => [...prev, `❌ Test failed: ${error.message}`]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-8">
      <h1 className="text-2xl font-bold mb-6">TikTok Events API Test</h1>
      
      <button
        onClick={runTests}
        disabled={isLoading}
        className="bg-blue-500 text-white px-4 py-2 rounded hover:bg-blue-600 disabled:opacity-50"
      >
        {isLoading ? 'Running Tests...' : 'Run TikTok Events API Tests'}
      </button>
      
      {testResults.length > 0 && (
        <div className="mt-6 p-4 bg-gray-100 rounded">
          <h2 className="font-semibold mb-2">Test Results:</h2>
          {testResults.map((result, index) => (
            <div key={index} className="mb-1">{result}</div>
          ))}
        </div>
      )}
    </div>
  );
}