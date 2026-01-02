// app/test-enrollment/page.tsx
'use client';

import { useState } from 'react';

export default function TestPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [rawResponse, setRawResponse] = useState('');

  const testAPI = async () => {
    setLoading(true);
    setError('');
    setRawResponse('');
    
    try {
      const url = '/api/grades?student_id=2025-00003';
      console.log('Fetching from:', url);
      
      const response = await fetch(url);
      
      // Get response as text first
      const text = await response.text();
      console.log('Raw response:', text.substring(0, 200) + '...');
      setRawResponse(text);
      
      // Check if it's HTML
      if (text.trim().startsWith('<!DOCTYPE') || text.trim().startsWith('<html')) {
        throw new Error('Server returned HTML instead of JSON. Check API endpoint.');
      }
      
      // Try to parse as JSON
      const result = JSON.parse(text);
      setData(result);
      
    } catch (err: any) {
      console.error('Error details:', err);
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const testDirectAPI = async () => {
    setLoading(true);
    setError('');
    
    try {
      const url = 'http://zdspgc-mahayag.rf.gd/admin/api/get_student_grades.php?student_id=2025-00003';
      console.log('Testing direct API:', url);
      
      const response = await fetch(url);
      const text = await response.text();
      
      console.log('Direct response preview:', text.substring(0, 500));
      setRawResponse(text);
      
      // Check what's returned
      if (text.includes('404') || text.includes('Not Found')) {
        setError('API endpoint not found (404)');
      } else if (text.includes('Error') || text.includes('exception')) {
        setError('PHP error returned: ' + text.substring(0, 200));
      } else {
        setError('Unknown response format. See raw response below.');
      }
      
    } catch (err: any) {
      setError('Network error: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: 20, maxWidth: 1200, margin: '0 auto' }}>
      <h1>API Debug Page</h1>
      
      <div style={{ display: 'flex', gap: 10, marginBottom: 20 }}>
        <button 
          onClick={testAPI}
          disabled={loading}
          style={{ padding: '10px 20px', background: '#0070f3', color: 'white', border: 'none', borderRadius: 5 }}
        >
          Test Local API Route
        </button>
        
        <button 
          onClick={testDirectAPI}
          disabled={loading}
          style={{ padding: '10px 20px', background: '#666', color: 'white', border: 'none', borderRadius: 5 }}
        >
          Test Direct InfinityFree API
        </button>
      </div>
      
      {loading && <p>Loading...</p>}
      
      {error && (
        <div style={{ background: '#ffebee', color: '#c62828', padding: 15, borderRadius: 5, marginBottom: 20 }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {data && (
        <div style={{ marginTop: 30 }}>
          <h2>Success! Data Received:</h2>
          <pre style={{ background: '#f5f5f5', padding: 20, borderRadius: 5, overflow: 'auto' }}>
            {JSON.stringify(data, null, 2)}
          </pre>
        </div>
      )}
      
      {rawResponse && (
        <div style={{ marginTop: 30 }}>
          <h3>Raw Response:</h3>
          <textarea 
            readOnly 
            value={rawResponse}
            style={{ 
              width: '100%', 
              height: '300px', 
              padding: 10, 
              fontFamily: 'monospace',
              background: '#f5f5f5',
              border: '1px solid #ccc',
              borderRadius: 5
            }}
          />
        </div>
      )}
      
      <div style={{ marginTop: 40, background: '#e3f2fd', padding: 20, borderRadius: 5 }}>
        <h3>Debug Steps:</h3>
        <ol>
          <li>Click "Test Direct InfinityFree API" first</li>
          <li>Check if it returns JSON or HTML</li>
          <li>If HTML: The PHP file doesn't exist or has errors</li>
          <li>If JSON: Your Next.js API route might be wrong</li>
        </ol>
        
        <h4>Common Issues:</h4>
        <ul>
          <li>PHP file path incorrect on InfinityFree</li>
          <li>Missing `?&gt;` closing tag in PHP</li>
          <li>Database connection errors</li>
          <li>Output before headers (check for whitespace)</li>
        </ul>
      </div>
    </div>
  );
}