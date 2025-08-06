# Cloudflare Worker 部署指南

## 简介

为了解决游戏iframe加载问题，我们需要使用Cloudflare Worker作为CORS代理。这个代理将帮助我们绕过CrazyGames网站的跨域限制，使游戏能够正常加载在我们的网站中。

## 部署步骤

### 1. 创建Cloudflare账户

如果你还没有Cloudflare账户，请先在 [Cloudflare官网](https://www.cloudflare.com) 注册一个账户。

### 2. 设置Workers

1. 登录到你的Cloudflare账户
2. 在左侧导航栏中点击"Workers & Pages"
3. 点击"创建应用程序"按钮
4. 选择"Worker"选项

### 3. 部署Worker代码

1. 将项目中的`worker.js`文件内容复制到Cloudflare Worker编辑器中
2. 点击"保存并部署"按钮
3. Cloudflare将为你的Worker分配一个子域名，格式为`你的worker名称.你的账户名.workers.dev`

### 4. 更新网站代码

1. 记下你的Worker子域名
2. 打开`index.html`和`script.js`文件
3. 将所有出现`你的worker子域名.workers.dev`的地方替换为你实际的Worker子域名

例如，如果你的Worker子域名是`visitor-proxy.your-name.workers.dev`，那么你需要将：

```html
<iframe id="game-iframe" src="https://你的worker子域名.workers.dev/?url=https://games.crazygames.com/en_US/the-visitor/index.html" allowfullscreen></iframe>
```

替换为：

```html
<iframe id="game-iframe" src="https://visitor-proxy.your-name.workers.dev/?url=https://games.crazygames.com/en_US/the-visitor/index.html" allowfullscreen></iframe>
```

同样，在`script.js`文件中也需要进行相同的替换。

### 5. 测试

部署更新后的网站代码，然后访问你的网站，检查游戏是否能够正常加载。

## 工作原理

1. 当用户访问你的网站时，浏览器会尝试加载iframe中的游戏
2. 请求会发送到你的Cloudflare Worker而不是直接发送到CrazyGames
3. Worker接收请求后，会代表用户向CrazyGames发送请求
4. 当Worker收到CrazyGames的响应后，会修改响应头，移除跨域限制
5. Worker将修改后的响应发送回用户的浏览器
6. 浏览器接收到响应后，能够正常显示游戏内容，因为响应头已经被修改为允许跨域访问

## 注意事项

1. Cloudflare Workers免费计划每天有100,000次请求的限制，对于大多数小型网站来说已经足够
2. 如果你的网站流量较大，可能需要升级到付费计划
3. 确保你遵守CrazyGames的服务条款，不要滥用此代理
4. 这种方法只应该用于合法目的，如展示你有权嵌入的内容