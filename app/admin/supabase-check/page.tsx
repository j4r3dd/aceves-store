'use client';

import { useState, useEffect } from 'react';
import { supabase } from '../../../lib/supabase';

export default function SupabaseDiagnosticsPage() {
  const [status, setStatus] = useState('Checking connection...');
  const [error, setError] = useState(null);
  const [tables, setTables] = useState([]);
  const [productCount, setProductCount] = useState(null);
  const [connectionDetails, setConnectionDetails] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function checkSupabaseConnection() {
      try {
        // Simple ping to check connection
        const { data, error: pingError } = await supabase
          .from('products')
          .select('count(*)', { count: 'exact', head: true })
          .limit(1);
        
        if (pingError) {
          console.error("Ping error:", pingError);
          throw pingError;
        }
        
        setStatus('Connected to Supabase');

        // Get Supabase URL (hide most of it for security)
        const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'Not configured';
        const maskedUrl = supabaseUrl.startsWith('http') 
          ? `${supabaseUrl.substring(0, 10)}...${supabaseUrl.substring(supabaseUrl.lastIndexOf('.'))}` 
          : supabaseUrl;

        setConnectionDetails({
          url: maskedUrl,
          hasAnonKey: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
        });

        // List tables - more safely
        try {
          const { data: tableData, error: tableError } = await supabase
            .rpc('get_tables');
          
          if (tableError) {
            console.warn("Could not fetch table list:", tableError);
            setTables(['Unable to list tables due to permissions']);
          } else if (tableData) {
            setTables(tableData);
          } else {
            setTables(['No tables found or insufficient permissions']);
          }
        } catch (tableListErr) {
          console.warn("Table listing failed:", tableListErr);
          setTables(['Unable to list tables due to permissions']);
        }

        // Count products more safely
        try {
          const { data: products, error: countError } = await supabase
            .from('products')
            .select('*');

          if (countError) {
            console.error("Product count error:", countError);
            setProductCount("Error counting products");
          } else {
            setProductCount(products ? products.length : 0);
          }
        } catch (countErr) {
          console.error("Product counting failed:", countErr);
          setProductCount("Error counting products");
        }
        
      } catch (err) {
        console.error('Supabase connection check failed:', err);
        setStatus('Connection failed');
        setError(err.message || 'Unknown error');
      } finally {
        setIsLoading(false);
      }
    }

    checkSupabaseConnection();
  }, []);

  const syncJSONToSupabase = async () => {
    try {
      setIsLoading(true);
      
      // Fetch local JSON data
      const response = await fetch('/data/products.json');
      const products = await response.json();
      
      if (!products || !Array.isArray(products)) {
        throw new Error('Invalid products data in local JSON');
      }
      
      // Try to delete all records with a safer approach
      try {
        // First check if the products table exists and has records
        const { data: existingProducts, error: checkError } = await supabase
          .from('products')
          .select('id')
          .limit(1);

        if (!checkError && existingProducts && existingProducts.length > 0) {
          // There are records, try to delete them
          const { error: deleteError } = await supabase
            .from('products')
            .delete()
            .gte('id', ''); // This should match all records regardless of ID type
          
          if (deleteError) {
            console.warn("Could not delete existing products:", deleteError);
            // Continue anyway, we'll try to insert/upsert
          }
        }
      } catch (deleteErr) {
        console.warn("Error during delete operation:", deleteErr);
        // Continue anyway, we'll try to insert/upsert
      }
      
      // Insert products one by one to better handle errors
      let successCount = 0;
      let errorCount = 0;
      
      for (const product of products) {
        const { error: insertError } = await supabase
          .from('products')
          .upsert(product, { onConflict: 'id' });
          
        if (insertError) {
          console.error(`Error inserting product ${product.id}:`, insertError);
          errorCount++;
        } else {
          successCount++;
        }
      }
      
      setStatus(`Synced ${successCount} products, ${errorCount} failed`);
      
      if (errorCount > 0) {
        setError(`${errorCount} products failed to sync. Check console for details.`);
      } else {
        setError(null);
      }
      
      // Refresh product count
      const { data: updatedProducts } = await supabase
        .from('products')
        .select('count(*)', { count: 'exact' });
        
      setProductCount(updatedProducts ? updatedProducts.length : 0);
      
    } catch (err) {
      console.error('Sync failed:', err);
      setError(`Sync failed: ${err.message || 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen p-8 bg-white text-black">
      <h1 className="text-3xl font-bold mb-6">🔌 Supabase Diagnostics</h1>
      
      <div className="bg-gray-100 p-6 rounded-lg max-w-3xl mb-8">
        <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
        
        {isLoading ? (
          <div className="animate-pulse">Checking connection...</div>
        ) : (
          <>
            <div className={`mb-2 font-medium ${status === 'Connected to Supabase' ? 'text-green-600' : 'text-red-600'}`}>
              {status}
            </div>
            
            {error && (
              <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                <p className="font-bold">Error:</p>
                <p>{error}</p>
              </div>
            )}
            
            {connectionDetails && (
              <div className="mb-4">
                <p><strong>Supabase URL:</strong> {connectionDetails.url}</p>
                <p><strong>Anon Key configured:</strong> {connectionDetails.hasAnonKey ? '✅' : '❌'}</p>
              </div>
            )}
            
            <div className="mb-4">
              <h3 className="font-medium mb-2">Database Tables:</h3>
              {tables.length > 0 ? (
                <ul className="list-disc list-inside">
                  {tables.map((table, index) => (
                    <li key={index} className={table === 'products' ? 'text-green-600 font-semibold' : ''}>
                      {table} {table === 'products' ? '✅' : ''}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-yellow-600">No tables found or unable to list tables</p>
              )}
            </div>
            
            {productCount !== null && (
              <div className="mb-4">
                <h3 className="font-medium mb-2">Products in Supabase:</h3>
                <p className={typeof productCount === 'number' && productCount > 0 ? 'text-green-600' : 'text-yellow-600'}>
                  {productCount} {typeof productCount === 'number' && productCount > 0 ? '✅' : '⚠️'}
                </p>
              </div>
            )}
          </>
        )}
      </div>
      
      <div className="bg-gray-100 p-6 rounded-lg max-w-3xl">
        <h2 className="text-xl font-semibold mb-4">Tools</h2>
        
        <div className="space-y-4">
          <div>
            <button
              onClick={syncJSONToSupabase}
              disabled={isLoading}
              className={`bg-blue-600 text-white py-2 px-6 rounded ${isLoading ? 'opacity-50 cursor-not-allowed' : 'hover:bg-blue-700'}`}
            >
              {isLoading ? 'Syncing...' : 'Sync Local JSON to Supabase'}
            </button>
            <p className="text-sm text-gray-600 mt-1">
              This will attempt to add products from your local JSON file to Supabase.
            </p>
          </div>
          
          <div className="pt-4 border-t border-gray-300">
            <h3 className="font-medium mb-2">Manual Setup Instructions:</h3>
            <ol className="list-decimal list-inside space-y-2">
              <li>Go to your <a href="https://app.supabase.io" target="_blank" rel="noopener noreferrer" className="text-blue-600 underline">Supabase project dashboard</a></li>
              <li>Navigate to the "Table Editor" section</li>
              <li>Create a new table named "products" with the following columns:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>id (text, primary key)</li>
                  <li>name (text)</li>
                  <li>category (text)</li>
                  <li>price (integer or float)</li>
                  <li>description (text)</li>
                  <li>images (json array)</li>
                </ul>
              </li>
              <li>After creating the table, add a Row Level Security (RLS) policy:
                <ul className="list-disc list-inside ml-6 mt-1">
                  <li>Go to Authentication &gt; Policies</li>
                  <li>Find your "products" table</li>
                  <li>Click "New Policy"</li>
                  <li>Choose "Enable read access to everyone"</li>
                  <li>For now, you may want to also "Enable insert/update/delete for everyone" (for testing)</li>
                </ul>
              </li>
              <li>After setting up RLS, come back here and use the "Sync Local JSON to Supabase" button</li>
            </ol>
          </div>
          
          <div className="pt-4 border-t border-gray-300">
            <h3 className="font-medium mb-2">Troubleshooting:</h3>
            <ul className="list-disc list-inside space-y-2">
              <li>Restart your Next.js development server after updating environment variables</li>
              <li>Make sure your Supabase project is active and not paused</li>
              <li>Check that your RLS policies allow the operations you're trying to perform</li>
              <li>Verify that your table structure matches the JSON data format</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}