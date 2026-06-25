// ============================================================================
// DeepSeek SSE 代理 · Cloudflare Worker 版（免费、无需服务器）
//
// 部署步骤（约 2 分钟）：
//  1. 登录 https://dash.cloudflare.com → 左侧 "Workers & Pages" → "Create" → "Create Worker"
//  2. 把本文件全部内容粘进编辑器，点 "Deploy"
//  3. 进入该 Worker → Settings → Variables and Secrets → 添加 Secret：
//        名称 DEEPSEEK_API_KEY    值 你的 DeepSeek 密钥(sk-...)   → Save and deploy
//  4. 复制 Worker 地址（形如 https://xxx.your-name.workers.dev）发给我，
//     我把前端 AI_CONFIG.endpoint 指向它（apiKey 留空），重渲染并重推 gh-pages。
//
// 密钥只存在 Cloudflare 后台，永远不会出现在公开网页里。
// ============================================================================
export default {
  async fetch(request, env) {
    const cors = {
      'Access-Control-Allow-Origin': '*',            // 可改成你的 Pages 域名收紧
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      'Access-Control-Allow-Methods': 'POST, OPTIONS',
    };
    if (request.method === 'OPTIONS') return new Response(null, { status: 204, headers: cors });
    if (request.method === 'GET')     return new Response('deepseek worker ok', { headers: cors });
    if (request.method !== 'POST')    return new Response('method not allowed', { status: 405, headers: cors });

    let body = await request.json().catch(() => ({}));
    if (body.message && !body.messages) {            // 兼容 {message:"..."} 简写
      body = { messages: [{ role: 'user', content: body.message }] };
    }
    body.stream = true;
    if (!body.model) body.model = 'deepseek-chat';

    const upstream = await fetch('https://api.deepseek.com/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer ' + env.DEEPSEEK_API_KEY,
        'Accept': 'text/event-stream',
      },
      body: JSON.stringify(body),
    });

    // 直接把上游的流式响应透传回浏览器
    return new Response(upstream.body, {
      status: upstream.status,
      headers: {
        ...cors,
        'Content-Type': 'text/event-stream; charset=utf-8',
        'Cache-Control': 'no-cache, no-transform',
      },
    });
  },
};
