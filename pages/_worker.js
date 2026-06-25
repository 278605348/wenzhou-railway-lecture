// ============================================================================
// Cloudflare Pages 高级模式入口：给整个站点加 HTTP Basic Auth（账号/密码登录）
//   部署时此文件需位于发布目录根部（即 _book/_worker.js）。
//   deploy 流程会把本文件从 pages/_worker.js 复制到 _book/ 再上传。
//
//   账号/密码从 Cloudflare Pages 环境变量读取（SITE_USER / SITE_PASS），
//   因此本仓库即使公开也不含密码；凭据只在服务器端校验，不下发到浏览器。
//   在 CF 后台 Pages 项目 → Settings → Variables 里设置 SITE_USER / SITE_PASS。
// ============================================================================
function unauthorized() {
  return new Response("需要登录后访问本讲义网站。", {
    status: 401,
    headers: {
      // charset=UTF-8 提示浏览器用 UTF-8 编码中文账号密码（RFC 7617）
      "WWW-Authenticate": 'Basic realm="智能体讲义", charset="UTF-8"',
      "Content-Type": "text/plain; charset=utf-8",
    },
  });
}

export default {
  async fetch(request, env) {
    const USER = env.SITE_USER || "";
    const PASS = env.SITE_PASS || "";
    // 未配置环境变量时一律拒绝（安全默认）
    if (!USER) return unauthorized();

    const header = request.headers.get("Authorization") || "";
    if (header.startsWith("Basic ")) {
      try {
        // base64 -> 原始字节 -> 按 UTF-8 解码（兼容中文）
        const bytes = Uint8Array.from(atob(header.slice(6)), (c) => c.charCodeAt(0));
        const decoded = new TextDecoder().decode(bytes);
        const idx = decoded.indexOf(":");
        const u = decoded.slice(0, idx);
        const p = decoded.slice(idx + 1);
        if (u === USER && p === PASS) {
          // 校验通过：交给 Pages 静态资源服务
          return env.ASSETS.fetch(request);
        }
      } catch (_) {
        // 解码失败按未授权处理
      }
    }
    return unauthorized();
  },
};
