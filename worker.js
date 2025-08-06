/**
 * CORSflare - 一个轻量级的CORS代理，用于解决iframe跨域问题
 * 设计用于在Cloudflare Workers上运行
 */

// 配置项
const config = {
  // 上游网站的主机名
  upstream: 'games.crazygames.com',
  
  // 是否使用HTTPS连接上游网站
  https: true,
  
  // 需要添加或修改的HTTP响应头
  http_response_headers_set: {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, HEAD, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    'Access-Control-Allow-Credentials': 'true',
    'Access-Control-Max-Age': '86400',
    'X-Frame-Options': 'ALLOWALL',
    'X-Content-Type-Options': 'nosniff'
  },
  
  // 需要删除的HTTP响应头
  http_response_headers_delete: [
    'Content-Security-Policy',
    'X-Frame-Options',
    'Frame-Options'
  ]
};

// 监听请求
addEventListener('fetch', event => {
  event.respondWith(handleRequest(event.request));
});

/**
 * 处理请求
 * @param {Request} request - 原始请求
 * @returns {Response} - 返回响应
 */
async function handleRequest(request) {
  // 处理OPTIONS预检请求
  if (request.method === 'OPTIONS') {
    return handleOptions(request);
  }
  
  try {
    // 获取请求URL
    const url = new URL(request.url);
    let targetUrl;
    
    // 检查是否有指定的上游URL参数
    if (url.searchParams.has('url')) {
      targetUrl = url.searchParams.get('url');
    } else {
      // 构建上游URL
      const path = url.pathname + url.search;
      targetUrl = `${config.https ? 'https' : 'http'}://${config.upstream}${path}`;
    }
    
    // 创建新的请求
    const modifiedRequest = new Request(targetUrl, {
      method: request.method,
      headers: request.headers,
      body: request.body,
      redirect: 'follow'
    });
    
    // 发送请求到上游服务器
    const response = await fetch(modifiedRequest);
    
    // 修改响应
    return modifyResponse(response);
  } catch (err) {
    return new Response(`代理错误: ${err.message}`, { status: 500 });
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
 * 修改响应
 * @param {Response} response - 原始响应
 * @returns {Response} - 修改后的响应
 */
async function modifyResponse(response) {
  // 创建新的响应头
  const newHeaders = new Headers(response.headers);
  
  // 删除指定的响应头
  for (const header of config.http_response_headers_delete) {
    newHeaders.delete(header);
  }
  
  // 添加或修改响应头
  for (const [key, value] of Object.entries(config.http_response_headers_set)) {
    newHeaders.set(key, value);
  }
  
  // 获取响应体
  const body = await response.arrayBuffer();
  
  // 创建新的响应
  return new Response(body, {
    status: response.status,
    statusText: response.statusText,
    headers: newHeaders
  });
}