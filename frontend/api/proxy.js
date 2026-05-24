// frontend/api/proxy.js
export const config = {
  runtime: 'edge',
};

export default async function handler(request) {
  const url = new URL(request.url);
  const backendUrl = process.env.BACKEND_URL || 'https://smart-book-to-link.onrender.com';
  
  // Construct the target URL with pathname and query params
  const targetUrl = new URL(url.pathname + url.search, backendUrl);
  
  // Copy headers
  const headers = new Headers(request.headers);
  headers.set('host', new URL(backendUrl).host);
  
  // Set fetch options
  const fetchOptions = {
    method: request.method,
    headers: headers,
    redirect: 'manual'
  };
  
  // Only include body for methods that support it
  if (request.method !== 'GET' && request.method !== 'HEAD') {
    fetchOptions.body = request.body;
  }
  
  try {
    const response = await fetch(targetUrl.toString(), fetchOptions);
    return response;
  } catch (error) {
    return new Response(JSON.stringify({ error: 'Proxy failed', details: error.message }), {
      status: 502,
      headers: { 'content-type': 'application/json' }
    });
  }
}
