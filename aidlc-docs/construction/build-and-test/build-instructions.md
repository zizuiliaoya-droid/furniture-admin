# 构建指南

## 前置条件
- Docker & Docker Compose（NAS 部署）
- Python 3.12+（本地开发）
- Node.js 20+（本地开发）
- PostgreSQL 16（本地开发，或使用 Docker）

## 方式一：Docker Compose 一键启动（推荐）

```bash
# 1. 复制环境变量
cp .env.example .env
# 编辑 .env 修改密码等配置

# 2. 构建并启动
docker-compose up -d --build

# 3. 验证
# 前端: http://localhost
# 后端 API: http://localhost/api/auth/login/
# 默认管理员: admin / admin123456
```

## 方式二：本地开发

### 后端

```bash
# 1. 创建虚拟环境
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate

# 2. 安装依赖
pip install -r requirements.txt

# 3. 配置环境变量
export DJANGO_DEBUG=True
export DB_NAME=furniture_app
export DB_USER=postgres
export DB_PASSWORD=postgres
export DB_HOST=localhost
export DB_PORT=5432

# 4. 数据库迁移
python manage.py makemigrations
python manage.py migrate

# 5. 创建管理员
python manage.py shell -c "from scripts.create_admin import create_admin; create_admin()"

# 6. 启动开发服务器
python manage.py runserver 8000
```

### 前端

```bash
# 1. 安装依赖
cd frontend
npm install

# 2. 启动开发服务器（自动代理 /api 到 localhost:8000）
npm run dev
# 访问 http://localhost:5173
```

## 方式三：Railway + Vercel 测试部署

### Railway（后端）
1. 在 Railway 创建项目，连接 GitHub 仓库
2. 添加 PostgreSQL 插件（自动注入 DATABASE_URL）
3. 设置根目录为 `backend`
4. 设置启动命令: `gunicorn config.wsgi --bind 0.0.0.0:$PORT`
5. 添加环境变量:
   - `DJANGO_SECRET_KEY`: 生成一个安全密钥
   - `DJANGO_DEBUG`: False
   - `DJANGO_ALLOWED_HOSTS`: *.railway.app
   - `CORS_ALLOWED_ORIGINS`: https://你的vercel域名.vercel.app
   - `ADMIN_USERNAME`: admin
   - `ADMIN_PASSWORD`: 你的密码
6. 部署后执行一次: `python manage.py migrate && python manage.py shell -c "from scripts.create_admin import create_admin; create_admin()"`

### Vercel（前端）
1. 在 Vercel 导入 GitHub 仓库
2. 设置根目录为 `frontend`
3. 框架预设: Vite
4. 添加环境变量:
   - `VITE_API_BASE_URL`: https://你的railway域名.railway.app
5. 推送到 main 分支自动部署

## 验证清单
- [ ] 访问登录页，使用 admin 账号登录
- [ ] 侧边栏菜单正常显示
- [ ] 产品管理：创建/编辑/删除产品
- [ ] 图片上传：上传图片并查看缩略图
- [ ] 分类管理：创建分类树
- [ ] 产品图册：卡片式浏览
- [ ] 客户案例：创建案例并关联产品
- [ ] 内部文档：上传/下载/预览文件
- [ ] 报价方案：创建报价单、添加明细、导出 PDF
- [ ] 分享功能：创建分享链接、公开访问
- [ ] 全局搜索：顶栏搜索下拉
- [ ] 用户管理：创建/禁用用户
