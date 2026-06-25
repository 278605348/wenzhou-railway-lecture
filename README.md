# 📚 智能体重塑职业生产力：打造AI超级办公个体

> 作者：**周大福** · 一门面向职场个体的 AI 实战讲义网站

基于 [Quarto Book](https://quarto.org/docs/books/) 模板构建的在线讲义。

## 🗂️ 目录结构

```
ai-superoffice-lecture/
├── _quarto.yml                  # 📋 站点与书籍配置（标题、作者、章节顺序）
├── index.qmd                    # 🏠 前言
├── chapters/                    # 📖 各章讲义内容（对应课程一~五）
│   ├── 01-agent-vs-llm.qmd      #   一、AI 智能体与大模型的区别
│   ├── 02-workbuddy.qmd         #   二、Workbuddy（日常办公 + 深度应用）
│   ├── 03-ima-copilot.qmd       #   三、IMA Copilot（智能体）
│   ├── 04-skills.qmd            #   四、Skills
│   └── 05-memory-system.qmd     #   五、智能体记忆系统
├── images/agent-mindmap.png     # 🖼️ 手绘思维导图配图（第 1 章 banner）
├── references.qmd               # 🔖 参考文献页
├── references.bib               # 📚 BibTeX 文献库
├── theme.scss                   # 🎨 主题配色与字体
└── styles.css                   # ✨ 自定义样式
```

## 🚀 快速开始

### 1️⃣ 安装 Quarto

本机暂未检测到 Quarto。请前往 <https://quarto.org/docs/get-started/> 下载安装，或用包管理器：

```powershell
winget install --id Posit.Quarto
```

### 2️⃣ 本地预览

```powershell
cd C:\Users\zhoux\ai-superoffice-lecture
quarto preview
```

浏览器会自动打开，保存 `.qmd` 文件即实时刷新。

### 3️⃣ 构建静态网站

```powershell
quarto render
```

产物输出到 `_book/` 目录，可直接部署。

## 🌐 部署

- **GitHub Pages**：`quarto publish gh-pages`
- **Netlify**：`quarto publish netlify`
- 或将 `_book/` 目录上传到任意静态托管。

## ✏️ 如何编辑内容

- 改**标题/作者/章节顺序** → 编辑 `_quarto.yml`
- 改**某章内容** → 编辑 `chapters/` 下对应 `.qmd`
- 改**配色/字体** → 编辑 `theme.scss`

## 📝 待办

- [x] 将飞书文档中的真实课程大纲填充到各章节
- [ ] 为每章顶部补充手绘思维导图配图（已完成第 1 章）
- [ ] 补充 `references.bib` 中的真实参考文献
- [ ] （可选）添加课程封面图 `cover.png`
