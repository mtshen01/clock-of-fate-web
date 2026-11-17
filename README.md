# 停摆之钟 · 万象档案

《停摆之钟》的线上资料库：筛选与查阅全部**卡牌 / 遗物 / 生物 / 状态 / 附魔 / 道具 / 每日挑战**。卡牌支持按英雄筛选，移动端提供全宽检索与筛选条；详情页可左右滑动逐张翻阅卡牌。生物详情支持逐招预览待机、攻击、防御、受击、施法、死亡动作。

- 线上地址：<https://www.tbzz1.online/>（域名 HTTP 自动跳转 HTTPS；IP 访问 <http://121.43.110.17/> 保留）
- 备案号：晋ICP备2026017220号
- 技术栈：Vite + React + TypeScript
- 数据来源：运行时优先读取游戏服务端 `GET /api/content/bundle`；接口不可用时回退到 `public/data/*.json` 静态快照（由 `sljt-demo` 游戏仓库生成）
- 美术来源：游戏仓库的本地美术资源；少量缺失条目使用社区资料站的参考图，并在详情中标明「参考图」

## 当前收录

| 分类 | 数量 |
|---|---:|
| 卡牌 | 598 |
| 遗物 | 298 |
| 生物 | 116 |
| 生物动作 | 659 段（116 个生物） |
| 状态 | 265 |
| 附魔 | 22 |
| 道具（药水） | 64 |
| 每日挑战 | 16 |

## 本地开发

```bash
npm install
npm run dev
```

默认开发地址：<http://127.0.0.1:5173/>

## 同步游戏数据与美术

站点数据与图片已经提交到仓库，可直接构建。游戏内容更新后，在本地执行：

```bash
# 默认从 ../sljt-demo 读取
npm run sync

# 或指定游戏仓库位置
$env:GAME_ROOT="D:\path\to\sljt-demo"; npm run sync
```

脚本会：

1. 读取 `data/content/*.json`、`data/heroes/heroes.json`、`server/content/manifest.json`；
2. 把数据归一化为 `public/data/*.json`（作为接口不可用时的回退快照）；
3. 生成 `public/data/art.json`，记录每件美术的路径与来源（本地 / 参考图）；
4. 把卡面、英雄头像、遗物、药水、附魔、状态图标、生物立绘压缩为 WebP 输出到 `public/art/`；
5. 读取 `monster-frames-v3` / `expanded-actions-v1` / `boss-frames-v1` / `elite-frames-v1` 的动作清单，把帧序列拼成精灵图输出到 `public/art/motion/`，并生成 `public/data/motions.json`；
6. 少量本地缺失的生物/状态使用 `docs/assets/asset-manifest.json` 中的参考图补齐，并缓存到 `.cache/remote/`。

强制重新生成全部图片：

```bash
npm run sync -- --force
```

> 生成物（`public/data/`、`public/art/`）随仓库提交，部署时不需要游戏仓库。
> 文字数据以服务端接口为准，改卡名/文案后只需重新构建并部署服务端内容包，不必重新同步本站；新增或替换美术、动作帧时仍需执行 `npm run sync`。静态美术会优先使用较新的本地源并自动重建，动作精灵图仍按缺省跳过已有文件，替换动作帧时请加 `--force`。

## 运行时数据

页面启动后请求 `/api/content/bundle`，在浏览器内完成与 `sync-content.mjs` 相同的展示层归一化（标签、职业、升级文案、怪物招式等）。请求失败时自动回退到 `/data/*.json`，保证服务端不可用时仍可浏览。

本地开发时如需连接指定服务端，可在启动前设置：

```bash
$env:VITE_CONTENT_API="http://127.0.0.1:3000/api/content"; npm run dev
```

生产环境保持默认值 `/api/content`，由 nginx 将 `/api/` 反向代理到游戏服务端。

## 构建

```bash
npm run typecheck
npm run build
```

产物在 `dist/`。

## 部署（80 / 443 端口）

服务器使用 nginx 托管静态文件，并保留游戏 API 反向代理：

```nginx
server {
    listen 80 default_server;
    listen [::]:80 default_server;
    server_name _;

    root /opt/sljt/web-codex;
    index index.html;

    location /api/ws/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection "upgrade";
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_read_timeout 3600s;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }

    # 带 hash 的构建资源可以长期缓存
    location /assets/ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=31536000, immutable";
    }

    # 美术与数据文件较大，浏览器缓存一天
    location /art/ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=86400";
    }

    location /data/ {
        try_files $uri =404;
        add_header Cache-Control "public, max-age=3600";
    }

    location / {
        try_files $uri $uri/ /index.html;
        add_header Cache-Control "no-cache";
    }
}
```

> 上面的片段只展示 HTTP 入口与反向代理。生产环境另有 `sljt-server-http-redirect`（域名 80 → 443）和 `sljt-server-ssl`（443 证书站点），应用 location 统一放在 `/etc/nginx/snippets/sljt-app.conf`。

部署步骤：

```bash
npm run build
tar -czf dist.tar.gz -C dist .
scp dist.tar.gz sljt:/tmp/clock-of-fate-web.tar.gz
ssh sljt "mkdir -p /opt/sljt/web-codex && tar -xzf /tmp/clock-of-fate-web.tar.gz -C /opt/sljt/web-codex && chown -R www-data:www-data /opt/sljt/web-codex && nginx -t && systemctl reload nginx"
```

旧的 Web 版游戏目录（`/opt/sljt/web`、`/opt/sljt/web-slim`）已移除；nginx 的 `root` 指向本站。

## HTTPS

- 证书由 Let's Encrypt 签发，覆盖 `www.tbzz1.online` 与 `tbzz1.online`，有效期 90 天。
- 自动续期：`certbot.timer` 每日检查；续期成功后通过 deploy hook 执行 `systemctl reload nginx`。
- 域名 HTTP 请求 301 跳转到 HTTPS；`/.well-known/acme-challenge/` 保留用于续期校验。
- 直接访问 IP `http://121.43.110.17/` 仍可用（IP 不在证书覆盖范围内，因此不强制跳转）。
- 服务器配置：`/etc/nginx/sites-available/sljt-server-ssl`、`sljt-server-http-redirect`、`/etc/nginx/snippets/sljt-app.conf`。
- 排查日志：`/var/log/letsencrypt/letsencrypt.log`、`/var/log/nginx/error.log`。

## 目录

```text
clock-of-fate-web/
├── public/
│   ├── art/           # 压缩后的 WebP 美术资源（已提交）
│   ├── data/          # 接口回退快照 + art.json 美术索引（已提交）
│   └── fonts/         # 本地字体，避免依赖外部 CDN
├── scripts/
│   └── sync-content.mjs
├── src/
│   ├── components/    # 侧栏 / 工具栏 / 资料网格 / 详情抽屉 / 全局检索
│   ├── App.tsx
│   ├── data.ts
│   ├── filters.ts
│   └── styles.css
└── index.html
```

## 说明

- 内容数据整理自社区资料库与游戏仓库，仅供研究与展示。
- 所有美术与文字内容的权利归原权利人所有。
