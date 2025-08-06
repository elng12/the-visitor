<?php
/**
 * 简单的CORS代理服务器
 * 用于解决iframe跨域问题
 */

// 允许所有来源的请求
header('Access-Control-Allow-Origin: *');
header('Access-Control-Allow-Methods: GET, POST, OPTIONS');
header('Access-Control-Allow-Headers: Content-Type');
header('Access-Control-Allow-Credentials: true');

// 设置超时时间
ini_set('max_execution_time', 60);
set_time_limit(60);

// 检查请求是否合法
function isValidRequest() {
    return isset($_GET['url']) && filter_var($_GET['url'], FILTER_VALIDATE_URL);
}

// 如果是OPTIONS请求，直接返回200
if ($_SERVER['REQUEST_METHOD'] === 'OPTIONS') {
    header('HTTP/1.1 200 OK');
    exit();
}

// 处理请求
if (isValidRequest()) {
    $url = $_GET['url'];
    
    // 创建一个新的cURL资源
    $ch = curl_init();
    
    // 设置URL和相应的选项
    curl_setopt($ch, CURLOPT_URL, $url);
    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);
    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);
    curl_setopt($ch, CURLOPT_SSL_VERIFYPEER, false);
    curl_setopt($ch, CURLOPT_SSL_VERIFYHOST, false);
    curl_setopt($ch, CURLOPT_TIMEOUT, 30);
    
    // 获取响应内容
    $response = curl_exec($ch);
    
    // 获取响应头信息
    $contentType = curl_getinfo($ch, CURLINFO_CONTENT_TYPE);
    
    // 关闭cURL资源
    curl_close($ch);
    
    // 设置相同的内容类型
    if ($contentType) {
        header("Content-Type: $contentType");
    }
    
    // 输出响应内容
    echo $response;
} else {
    // 请求无效
    header('HTTP/1.1 400 Bad Request');
    echo json_encode(['error' => 'Invalid URL parameter']);
}
?>