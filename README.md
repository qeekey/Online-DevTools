# 在线开发者工具箱 | Developer Toolbox

[中文](#中文) | [English](#english)

---

<a name="中文"></a>
## 🇨🇳 中文说明

**在线开发者工具箱** 是一款轻量、现代、纯客户端运行的高效日常开发工具合集。致力于为前后端开发者提供快速、纯净、安全的一站式开发辅助体验。所有数据均在浏览器本地运算，无网络上传，保护您的敏感数据与私钥安全。

### ✨ 核心功能

1. **JSON 格式化与解析 (JSON Formatter & Tree View)**
   - 支持格式化（2空格/4空格/Tab缩进）与极限压缩。
   - 包含多层级可折叠交互式语法树视图（Tree View），节点类型高亮、快速展开/折叠。
   - 实时 JSON 语法错误检测与精确行号高亮。
   - 支持快速复制、格式转换与一键清空。

2. **JWT 解密、校验与生成 (JWT Decoder & Signer)**
   - **智能解密**：实时解析 Header 与 Payload，高亮显示过期时间（`exp`）、签发时间（`iat`）、生效时间（`nbf`）及当前状态。
   - **签名校验 (Signature Verification)**：基于原生 Web Crypto API，支持 `HS256`、`HS384`、`HS512` 签名实时验签，支持 UTF-8 纯文本与 Base64 编码密钥。
   - **JWT 加密签名**：可视化编辑 Header 与 Payload，快速配置过期时间与密钥生成新 Token。

3. **MD5 与常用哈希计算 (MD5 & Hash Generator)**
   - 支持普通文本与多行文本哈希计算。
   - 提供 32 位大写、32 位小写、16 位大写、16 位小写等常见格式。
   - 支持本地大文件拖拽/选取哈希计算（SHA-1、SHA-256、SHA-512、MD5）。

4. **URL 编码与解码 (URL Encode & Decode)**
   - 支持标准 RFC3986 编码模式与标准 URI Component 模式。
   - 支持中文、空格、URL 特殊字符及多语言字符集解析。

5. **Base64 编解码 (Base64 Encode & Decode)**
   - 文本 ↔ Base64 双向编码与解码，完美兼容 UTF-8 中文、多语言及 Emoji 字符。
   - 支持本地图片与文件拖拽转 Base64（Data URL），并支持实时预览。

6. **Unix 时间戳与日期互转 (Unix Timestamp & Date Converter)**
   - 实时毫秒级时钟与精准时间跳动。
   - 时间戳（秒/毫秒）↔ 本地时间 / UTC 协调世界时精确互转。
   - 快捷加减时间计算与一键填入当前时间戳。
   - 提供主流编程语言（JavaScript, Python, Go, Java, PHP）获取时间戳代码片段。

### 🎨 界面与体验特性

- **多语言支持**：支持简体中文与 English 实时无缝切换，偏好记忆保存在本地。
- **深色/浅色模式**：自动识别系统主题，支持一键切换并本地持久化。
- **纯本地运算**：100% 运行在客户端（Web Crypto API、原生 DOM 解析），保障隐私无泄露风险。
- **响应式设计**：完美适配桌面端、平板与移动端屏幕。

### 🛠️ 技术栈

- **前端框架**：React 19 + TypeScript
- **构建工具**：Vite 6
- **样式方案**：Tailwind CSS v4
- **图标组件**：Lucide React
- **动画库**：Motion (Framer Motion)
- **安全算法**：浏览器原生 Web Crypto API

### 🚀 本地开发与构建

#### 环境要求
- Node.js 18.0 或更高版本
- npm 9.0 或更高版本

#### 安装依赖
```bash
npm install
```

#### 启动本地开发服务
```bash
npm run dev
```
启动后在浏览器打开 `http://localhost:3000` 即可访问。

#### 生产环境编译构建
```bash
npm run build
```
编译产物将输出在 `dist` 目录下，可直接部署至任何静态托管服务（Vercel, Cloudflare Pages, Nginx, Cloud Run 等）。

#### 代码检查
```bash
npm run lint
```

---

<a name="english"></a>
## 🇬🇧 English Documentation

**Developer Toolbox** is a modern, lightweight, privacy-focused web toolkit designed for developers. It runs 100% client-side in your browser, ensuring zero data leakage and fast performance without sending any payloads or secrets to remote servers.

### ✨ Key Features

1. **JSON Formatter & Tree View**
   - Format with customizable indentation (2 spaces, 4 spaces, tabs) or minify.
   - Interactive multi-level collapsible JSON Tree View with syntax type highlighting.
   - Real-time syntax error validation with helpful error location.
   - Quick copy, clear, and sample data loading.

2. **JWT Debugger, Signer & Verification**
   - **Decode**: Instant inspection of JWT Header and Payload with human-readable timestamps (`exp`, `iat`, `nbf`) and expiration status badges.
   - **Signature Verification**: Validates signatures in real-time using the native browser Web Crypto API (supports `HS256`, `HS384`, `HS512` with UTF-8 or Base64 secret keys).
   - **JWT Generator**: Create, customize, and sign new JWT tokens on the fly.

3. **MD5 & Hashes Generator**
   - Instant hash computation for text strings (32-bit uppercase/lowercase, 16-bit uppercase/lowercase).
   - Multi-algorithm support (MD5, SHA-1, SHA-256, SHA-512).
   - Drag-and-drop local file hashing without uploading to any server.

4. **URL Encoder & Decoder**
   - RFC 3986 and standard URI Component encode/decode modes.
   - Full support for Unicode, special characters, and query strings.

5. **Base64 Converter**
   - Bidirectional text to Base64 encoding/decoding with full UTF-8 & Emoji support.
   - File & Image to Base64 Data URL conversion with instant image preview.

6. **Unix Timestamp & Date Converter**
   - Live real-time clock with millisecond precision.
   - Bidirectional conversion between Unix timestamps (seconds / milliseconds) and formatted Local / UTC times.
   - Quick date-math offsets (+1 hour, +1 day, etc.) and "Use Current Time" shortcuts.
   - Built-in syntax snippets for popular languages (JavaScript, Python, Go, Java, PHP).

### 🎨 UI & User Experience

- **Internationalization (i18n)**: Seamless switching between English and Simplified Chinese with persistent storage.
- **Dark / Light Theme**: Respects OS preferences and provides persistent manual toggling.
- **Privacy First**: 100% client-side execution; tokens, secrets, and files never leave your browser.
- **Fully Responsive**: Optimized for desktop, tablet, and mobile browsers.

### 🛠️ Tech Stack

- **Framework**: React 19 + TypeScript
- **Build Tool**: Vite 6
- **Styling**: Tailwind CSS v4
- **Icons**: Lucide React
- **Animation**: Motion (Framer Motion)
- **Cryptography**: Native Web Crypto API

### 🚀 Getting Started

#### Prerequisites
- Node.js 18.0+
- npm 9.0+

#### Installation
```bash
npm install
```

#### Run Dev Server
```bash
npm run dev
```
Open `http://localhost:3000` in your browser.

#### Build for Production
```bash
npm run build
```
Static production files will be built into the `dist/` directory, ready to be hosted on Vercel, Cloudflare Pages, GitHub Pages, or any static web server.

#### Linting & Type Check
```bash
npm run lint
```

---

### 📄 License

MIT License. Free for personal and commercial developer use.
