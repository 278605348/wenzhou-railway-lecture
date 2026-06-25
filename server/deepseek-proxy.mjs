// ============================================================================
// DeepSeek SSE 转发代理（零依赖，Node 18+）
//   前端「问问 AI」浮窗 POST 到本服务的 /api/chat，
//   本服务注入 DeepSeek 密钥后转发到 DeepSeek，并把流式(SSE)结果原样回传。
//   密钥只存在服务器端环境变量里，不会暴露给浏览器。
//
// 运行：
//   set  DEEPSEEK_API_KEY=sk-xxxx   (Windows)  /  export DEEPSEEK_API_KEY=sk-xxxx (Linux)
//   node server/deepseek-proxy.mjs
// 可选环境变量：PORT(默认8787)、CORS_ORIGIN(默认*，同域部署可设为你的域名)
// ============================================================================
import http from 'node:http';
import https from 'node:https';

const PORT   = process.env.PORT || 8787;
const KEY    = process.env.DEEPSEEK_API_KEY;
const ORIGIN = process.env.CORS_ORIGIN || '*';
const UPSTREAM_HOST = 'api.deepseek.com';
const UPSTREAM_PATH = '/chat/completions';

if (!KEY) { console.error('✗ 缺少环境变量 DEEPSEEK_API_KEY'); process.exit(1); }

const server = http.createServer((req, res) => {
  res.setHeader('Access-Control-Allow-Origin', ORIGIN);
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');

  if (req.method === 'OPTIONS') { res.writeHead(204); res.end(); return; }
  if (req.method === 'GET' && req.url === '/') {
    res.writeHead(200, { 'Content-Type': 'text/plain' }); res.end('deepseek proxy ok'); return;
  }
  if (req.method !== 'POST' || !req.url.startsWith('/api/chat')) {
    res.writeHead(404); res.end('not found'); return;
  }

  const chunks = [];
  req.on('data', c => chunks.push(c));
  req.on('end', () => {
    let body;
    try { body = JSON.parse(Buffer.concat(chunks).toString('utf8') || '{}'); }
    catch { res.writeHead(400); res.end('bad json'); return; }

    // 兼容两种前端写法：完整 {model,messages,stream} 或简写 {message}
    if (body.message && !body.messages) {
      body = { messages: [{ role: 'user', content: body.message }] };
    }
    body.stream = true;
    if (!body.model) body.model = 'deepseek-chat';

    const payload = Buffer.from(JSON.stringify(body), 'utf8');
    const up = https.request({
      host: UPSTREAM_HOST, path: UPSTREAM_PATH, method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + KEY,
        'Accept': 'text/event-stream',
        'Content-Length': payload.length,
      },
    }, upRes => {
      res.writeHead(upRes.statusCode || 200, {
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
        'Connection': 'keep-alive',
        'X-Accel-Buffering': 'no',   // 关闭 nginx 缓冲，保证流式
      });
      upRes.pipe(res);
    });
    up.on('error', e => { res.writeHead(502); res.end('upstream error: ' + e.message); });
    up.write(payload); up.end();
  });
});

server.listen(PORT, () => console.log(`✓ DeepSeek SSE 代理已启动: http://127.0.0.1:${PORT}/api/chat`));
