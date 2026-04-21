# 基础设施设计

## 双环境架构

### 测试环境: Vercel + Railway

```
GitHub Repository (main branch)
        |
        +---> Vercel (自动部署)
        |     - 构建: npm run build
        |     - 输出: dist/
        |     - 环境变量: VITE_API_BASE_URL
        |
        +---> Railway (自动部署)
              - 检测: Python (requirements.txt)
              - 构建: pip install -r requirements.txt
              - 启动: gunicorn config.wsgi --bind 0.0.0.0:$PORT
              - 插件: PostgreSQL (自动注入 DATABASE_URL)
              - 环境变量: DJANGO_SECRET_KEY, DJANGO_ALLOWED_HOSTS,
                         CORS_ALLOWED_ORIGINS, ADMIN_USERNAME, ADMIN_PASSWORD
```

#### Railway 配置要点
- `Procfile` 或 Railway 启动命令: `gunicorn config.wsgi --bind 0.0.0.0:$PORT`
- `runtime.txt`: 指定 Python 版本
- settings.py 优先读取 `DATABASE_URL`（使用 dj-database-url 解析）
- 静态文件: WhiteNoise 中间件
- 媒体文件: Railway 持久化卷挂载到 /app/media
- 启动时自动执行 migrate + create_admin

#### Vercel 配置要点
- `vercel.json` 或自动检测 Vite 项目
- 环境变量 `VITE_API_BASE_URL` 指向 Railway 后端 URL
- SPA 路由: 所有路径 rewrite 到 index.html

### 生产环境: Synology NAS Docker Compose

```yaml
# docker-compose.yml
services:
  db:
    image: postgres:16-alpine
    volumes: [postgres_data:/var/lib/postgresql/data]
    environment: [POSTGRES_DB, POSTGRES_USER, POSTGRES_PASSWORD]
    restart: always

  backend:
    build: ./backend
    volumes: [media_data:/app/media, static_data:/app/static]
    environment: [DATABASE_URL, DJANGO_SECRET_KEY, ...]
    depends_on: [db]
    restart: always

  frontend:
    build: ./frontend
    ports: ["80:80"]
    volumes: [media_data:/usr/share/nginx/media, static_data:/usr/share/nginx/static]
    depends_on: [backend]
    restart: always

volumes:
  postgres_data:
  media_data:
  static_data:
```

## Django Settings 策略

```python
# config/settings.py 关键配置

import dj_database_url

# 数据库: 优先 DATABASE_URL，否则用 DB_* 变量
DATABASE_URL = os.environ.get("DATABASE_URL")
if DATABASE_URL:
    DATABASES = {"default": dj_database_url.parse(DATABASE_URL)}
else:
    DATABASES = {
        "default": {
            "ENGINE": "django.db.backends.postgresql",
            "NAME": os.environ.get("DB_NAME", "furniture_app"),
            "USER": os.environ.get("DB_USER", "postgres"),
            "PASSWORD": os.environ.get("DB_PASSWORD", "postgres"),
            "HOST": os.environ.get("DB_HOST", "localhost"),
            "PORT": os.environ.get("DB_PORT", "5432"),
        }
    }

# 静态文件
STATIC_URL = "/static/"
STATIC_ROOT = os.path.join(BASE_DIR, "static")
STATICFILES_STORAGE = "whitenoise.storage.CompressedManifestStaticFilesStorage"

# 媒体文件
MEDIA_URL = "/media/"
MEDIA_ROOT = os.environ.get("MEDIA_ROOT", os.path.join(BASE_DIR, "media"))

# CORS
CORS_ALLOWED_ORIGINS = [
    origin.strip()
    for origin in os.environ.get("CORS_ALLOWED_ORIGINS", "http://localhost").split(",")
]
```

## 前端 API 配置策略

```typescript
// services/api.ts
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || "";
// 测试环境: VITE_API_BASE_URL = "https://xxx.railway.app"
// 生产环境: 空字符串（Nginx 同域代理 /api/）
```

## .env.example

```env
# Django
DJANGO_SECRET_KEY=change-me-in-production
DJANGO_DEBUG=True
DJANGO_ALLOWED_HOSTS=localhost,127.0.0.1

# Database (Docker/NAS)
DB_NAME=furniture_app
DB_USER=postgres
DB_PASSWORD=postgres
DB_HOST=db
DB_PORT=5432

# Database (Railway - 自动注入，无需手动设置)
# DATABASE_URL=postgresql://...

# CORS
CORS_ALLOWED_ORIGINS=http://localhost,http://localhost:5173

# Admin
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123456

# Media
MEDIA_ROOT=/app/media
```
