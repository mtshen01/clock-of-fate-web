# 停摆之钟 · 万象档案

《停摆之钟》的线上资料库：筛选与查阅全部**卡牌 / 遗物 / 生物 / 状态 / 附魔 / 道具 / 每日挑战**。

- 线上地址：<http://121.43.110.17/>
- 技术栈：Vite + React + TypeScript，纯静态站点
- 数据来源：`sljt-demo` 游戏仓库的 `data/content/*.json`
- 美术来源：游戏仓库的本地美术资源；少量缺失条目使用社区资料站的参考图，并在详情中标明「参考图」

## 当前收录

| 分类 | 数量 |
|---|---:|
| 卡牌 | 598 |
| 遗物 | 298 |
| 生物 | 116 |
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
2. 把数据归一化为 `public/data/*.json`；
3. 把卡面、遗物、药水、附魔、状态图标、生物立绘压缩为 WebP 输出到 `public/art/`；
4. 少量本地缺失的生物/状态使用 `docs/assets/asset-manifest.json` 中的参考图补齐，并缓存到 `.cache/remote/`。

强制重新生成全部图片：

```bash
npm run sync -- --force
```

> 生成物（`public/data/`、`public/art/`）随仓库提交，部署时不需要游戏仓库。

## 构建

```bash
npm run typecheck
npm run build
```

产物在 `dist/`。

## 部署（80 端口）

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

部署步骤：

```bash
npm run build
tar -czf dist.tar.gz -C dist .
scp dist.tar.gz sljt:/tmp/clock-of-fate-web.tar.gz
ssh sljt "mkdir -p /opt/sljt/web-codex && tar -xzf /tmp/clock-of-fate-web.tar.gz -C /opt/sljt/web-codex && chown -R www-data:www-data /opt/sljt/web-codex && nginx -t && systemctl reload nginx"
```

旧的 Web 版游戏目录（`/opt/sljt/web`、`/opt/sljt/web-slim`）已移除；nginx 的 `root` 指向本站。

## 目录

```text
clock-of-fate-web/
├── public/
│   ├── art/           # 压缩后的 WebP 美术资源（已提交）
│   ├── data/          # 归一化后的静态 JSON（已提交）
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
