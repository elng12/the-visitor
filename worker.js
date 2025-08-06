/**
 * High-Performance Game Proxy Worker
 * Optimized for The Visitor game with caching and performance enhancements
 */

// Enhanced configuration
const config = {
  upstream: 'games.crazygames.com',
  https: true,
  
  // Cache settings
  cache: {
    // Cache static assets for 1 day
    staticAssets: 86400,
    // Cache HTML for 1 hour
    html: 3600,
    // Cache API responses for 5 minutes
    api: 300
  },
  
  // Response headers for CORS and performance
  http_response_headers_set: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'X-Frame-Options': 'ALLOWALL',
    'X-Content-Type-Options': 'nosniff',
    // Performance headers
    'X-Proxy-Cache': 'HIT',
    'X-Powered-By': 'Cloudflare-Worker'
  },
  
  // Headers to remove
  http_response_headers_delete: [
    'Content-Security-Policy',
    'X-Frame-Options',
    'Frame-Options',
    'Strict-Transport-Security'
  ]
};

// 监听请求
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * Enhanced request handler with caching
 * @param {Request} request - Original request
 * @returns {Response} - Modified response
 */
async function handleRequest(request) {
  // Handle OPTIONS preflight
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }
  
  try {
    const url = new URL(request.url);
    let targetUrl;
    
    // Build target URL
    if (url.searchParams.has('url')) {
      targetUrl = url.searchParams.get('url');
    } else {
      const path = url.pathname + url.search;
      targetUrl = `${config.https ? 'https' : 'http'}://${config.upstream}${path}`;
    }
    
    // Check cache first
    const cacheKey = new Request(targetUrl, request);
    const cache = caches.default;
    let response = await cache.match(cacheKey);
    
    if (response) {
      // Return cached response with cache headers
      const newHeaders = new Headers(response.headers);
      newHeaders.set('X-Proxy-Cache', 'HIT');
      newHeaders.set('X-Cache-Date', new Date().toISOString());
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers: newHeaders
      });
    }
    
    // Create optimized request
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: enhanceRequestHeaders(request.headers),
      body: request.body,
      redirect: 'follow'
    });
    
    // Fetch from upstream
    response = await fetch(modifiedRequest);
    
    // Modify and cache response
    const modifiedResponse = await modifyResponse(response, targetUrl);
    
    // Cache based on content type
    if (shouldCache(targetUrl, modifiedResponse)) {
      const cacheResponse = modifiedResponse.clone();
      await cache.put(cacheKey, cacheResponse);
    }
    
    return modifiedResponse;
  } catch (err) {
    return new Response(`Proxy Error: ${err.message}`, { 
      status: 500,
      headers: { 'Content-Type': 'text/plain' }
    });
  }
}

/**
 * 处理OPTIONS预检请求
 * @param {Request} request - 原始请求
 * @returns {Response} - 返回响应
 */
function handleOptions(request) {
  const headers = new Headers({
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Max-Age': '86400'
  });
  
  return new Response(null, {
    status: 204,
    headers
  });
}

/**
 * Enhance request headers for better upstream compatibility
 */
function enhanceRequestHeaders(headers) {
  const newHeaders = new Headers(headers);
  
  // Add realistic browser headers
  newHeaders.set('User-Agent', 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36');
  newHeaders.set('Accept', 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8');
  newHeaders.set('Accept-Language', 'en-US,en;q=0.9');
  newHeaders.set('Accept-Encoding', 'gzip, deflate, br');
  newHeaders.set('Referer', 'https://www.crazygames.com/');
  newHeaders.set('Sec-Fetch-Dest', 'iframe');
  newHeaders.set('Sec-Fetch-Mode', 'navigate');
  
  return newHeaders;
}

/**
 * Determine if response should be cached
 */
function shouldCache(url, response) {
  // Don't cache errors
  if (!response.ok) return false;
  
  const urlObj = new URL(url);
  const pathname = urlObj.pathname.toLowerCase();
  
  // Cache static assets
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot|mp3|mp4|webm)$/)) {
    return true;
  }
  
  // Cache HTML files
  if (pathname.match(/\.(html|htm)$/) || pathname.endsWith('/')) {
    return true;
  }
  
  return false;
}

/**
 * Get cache TTL based on content type
 */
function getCacheTTL(url) {
  const urlObj = new URL(url);
  const pathname = urlObj.pathname.toLowerCase();
  
  // Static assets - 1 day
  if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|ico|svg|woff|woff2|ttf|eot)$/)) {
    return config.cache.staticAssets;
  }
  
  // HTML files - 1 hour
  if (pathname.match(/\.(html|htm)$/) || pathname.endsWith('/')) {
    return config.cache.html;
  }
  
  // Default - 5 minutes
  return config.cache.api;
}

/**
 * Enhanced response modifier with caching headers
 */
async function modifyResponse(response, url) {
  const newHeaders = new Headers(response.headers);
  
  // Remove restrictive headers
  for (const header of config.http_response_headers_delete) {
    newHeaders.delete(header);
  }
  
  // Add CORS and performance headers
  for (const [key, value] of Object.entries(config.http_response_headers_set)) {
    newHeaders.set(key, value);
  }
  
  // Add cache headers
  const ttl = getCacheTTL(url);
  newHeaders.set('Cache-Control', `public, max-age=${ttl}`);
  newHeaders.set('X-Cache-TTL', ttl.toString());
  newHeaders.set('X-Proxy-Cache', 'MISS');
  
  // Get response body
  const body = await response.arrayBuffer();
  
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}