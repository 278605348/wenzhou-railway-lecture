# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

A **Quarto book** (static website) for the lecture 《AI智能体在办公中的全流程自动化应用》, author 周祥军, delivered 2026-06-25 to the 温州市铁路与轨道交通投资集团 (Wenzhou Railway & Rail Transit Investment Group) as session 3 of the 温州市总工会「职工成长型班组」建设系列培训. Audience: 班组长 / 中层干部.

This project is a **railway-targeted re-skin of a sibling project** (`../ai-superoffice-lecture`): same 5-chapter structure and the same content series (智能体 vs 大模型 / Workbuddy / IMA Copilot / Skills / 记忆系统), but with a new title/author, a custom landing page, a railway visual theme, and chapter 01 reframed for rail/班组 scenarios. Chapters 02–05 are kept close to the original (generic agent-tool demos). Each chapter is case-driven: concrete 提示词 (prompt) + 执行效果 — keep that format when editing.

The source-of-truth Feishu outline (doc `Q48v...`) is login-gated and was NOT readable; content is adapted from the sibling project per the user's instruction, not from that doc.

## Commands

Quarto is **not on PATH**. Use the full path (Windows):

```powershell
$q = "C:\Users\zhoux\AppData\Local\Programs\Quarto\Quarto\bin\quarto.cmd"
& $q render      # build -> _book/
& $q preview     # live local preview
```

No tests, linters, or package manager — this is a content site. "Build" = `quarto render`.

## Architecture

- **`_quarto.yml`** is the single control file: book title/author, the ordered `chapters:` list, HTML theme, and `include-after-body: assets/ask-ai.html`. Chapters are not auto-discovered — edit this list to add/reorder. `lang: zh` (NOT `zh-CN`, which warns).
- **`index.qmd` is a custom landing page, not a plain preface.** Its front matter sets `title: "首页"` (sidebar label); the body is a raw-HTML hero (`.rail-hero` with the session-info `.session-chips`) followed by a `.chapter-grid` of `.chapter-card` links that point at the rendered `chapters/NN-*.html` paths (hardcoded `.html`, since Quarto does not rewrite links inside raw HTML).
- **`chapters/01-05*.qmd`** = the five lecture sections; **`references.qmd` + `references.bib`** = bibliography.
- Chapter image banners live in `images/` (hand-drawn warm-orange mind-maps, generated with OpenAI `gpt-image-1`), referenced via `../images/...` from inside `chapters/`. They predate the new blue theme — a known visual mismatch.

### Styling / the "更美观" theme

- **`theme.scss`** defines the rail palette (`--rail-deep/blue/sky/teal/amber`) and overrides Bootstrap `$primary`, sidebar active state, and `h2` accent rules.
- **`styles.css`** holds the visual components: the gradient `.rail-hero` (with a metro-line texture via `::after`), `.session-chips`, the `.chapter-grid`/`.chapter-card` (hover-lift, gradient number badge), plus restyled callouts/code/blockquote/table/banner shadows.
- **Important CSS trick:** `body:has(.rail-hero) #title-block-header { display:none }` hides Quarto's default title block ONLY on the landing page (so the hero is the sole title). Relies on `:has()` (fine in current browsers). If you add a hero elsewhere, that page's title block will hide too.

### "问问 AI" floating widget (`assets/ask-ai.html`)

Injected into every page via `include-after-body`. Self-contained CSS+JS, no build step. Driven by the `AI_CONFIG` object at the top of the `<script>`: `mode:"openai"` sends `{model,messages,stream:true}`; the SSE reader tolerates `choices[0].delta.content`/`content`/`text`/`delta`/`token`/raw and handles `data:[DONE]`.

It points at a **shared** Cloudflare Worker `https://ai-ask.zhoudafu-ai.workers.dev/api/chat` with `apiKey:""` — the same backend as the sibling project; the DeepSeek key lives only as that Worker's `DEEPSEEK_API_KEY` secret. **Never put a live key in `AI_CONFIG.apiKey`** on this public static site; always go through the Worker. To change model/system prompt, edit `server/cloudflare-worker.js` and redeploy the Worker; the frontend `endpoint` does not change.

## Deployment (Cloudflare Pages)

Hosted on **Cloudflare Pages**, project `wenzhou-railway-lecture`, live at <https://wenzhou-railway-lecture.pages.dev/>. Source is on GitHub at **`278605348/wenzhou-railway-lecture` (public)**; `main` holds source only (`_book/` gitignored).

**The site is behind HTTP Basic Auth.** `pages/_worker.js` is the Pages advanced-mode entry that gates every request, but credentials are read from **Cloudflare Pages env vars `SITE_USER` / `SITE_PASS`** (currently `dafu` / `xiaofu`) — so the public repo contains NO password. To change credentials, edit those env vars on the Pages project (CF dashboard or API), no code change needed. `_worker.js` must sit at the deploy-dir root at upload time, so re-copy it after each render (render wipes `_book/`):

```powershell
$env:CLOUDFLARE_API_TOKEN="<token>"; $env:CLOUDFLARE_ACCOUNT_ID="52a1d78988e814ecf8c63e1fe9b792be"
& $q render
Copy-Item pages/_worker.js _book/_worker.js   # re-add the Basic Auth gate
npx --yes wrangler pages deploy _book --project-name=wenzhou-railway-lecture --branch=main --commit-dirty=true
```

Cloudflare-API gotcha: bundled Windows `curl` can't read MSYS `/c/...` paths nor reliably do `-F` multipart — for any CF multipart upload (e.g. Worker scripts) use **Node** (`fetch` + `FormData`/`Blob`).
