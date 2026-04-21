# Unit 1: 项目基础+认证 — 代码生成计划

## 单元上下文
- **单元**: Unit 1 - 项目基础 + 用户认证
- **依赖**: 无（基础单元）
- **功能点**: 1.1 ~ 1.12（共12个）

## 代码生成步骤

### 后端

- [x] Step 1: Django 项目骨架
  - backend/config/__init__.py, settings.py, urls.py, wsgi.py, asgi.py
  - backend/manage.py
  - backend/requirements.txt
  - backend/Dockerfile
  - backend/entrypoint.sh
  - backend/.env.example

- [x] Step 2: 公共工具模块
  - backend/common/__init__.py
  - backend/common/pagination.py (StandardPagination)
  - backend/common/exceptions.py (全局异常处理)
  - backend/common/file_storage.py (FileStorageService 骨架)

- [x] Step 3: 认证模块 — 模型与序列化器
  - backend/auth_app/__init__.py
  - backend/auth_app/models.py (User 模型)
  - backend/auth_app/serializers.py (用户序列化器)
  - backend/auth_app/permissions.py (IsAdminRole)

- [x] Step 4: 认证模块 — 服务与视图
  - backend/auth_app/services.py (AuthService)
  - backend/auth_app/views.py (登录/登出/用户CRUD)
  - backend/auth_app/urls.py

- [x] Step 5: 初始管理员脚本
  - backend/scripts/__init__.py
  - backend/scripts/create_admin.py

### 前端

- [x] Step 6: React 项目骨架
  - frontend/package.json
  - frontend/tsconfig.json
  - frontend/vite.config.ts
  - frontend/index.html
  - frontend/src/main.tsx
  - frontend/src/vite-env.d.ts

- [x] Step 7: 包豪斯主题与全局样式
  - frontend/src/styles/theme.ts (Ant Design 主题配置)
  - frontend/src/styles/global.css (全局样式、字体引入、微交互动效)

- [x] Step 8: API 客户端与认证服务
  - frontend/src/services/api.ts (Axios 实例+拦截器)
  - frontend/src/services/authService.ts (认证 API)

- [x] Step 9: 状态管理
  - frontend/src/store/authStore.ts (Zustand 认证状态)

- [x] Step 10: 布局组件
  - frontend/src/layouts/MainLayout.tsx
  - frontend/src/layouts/Sidebar.tsx

- [x] Step 11: 认证页面与路由守卫
  - frontend/src/components/ProtectedRoute.tsx
  - frontend/src/pages/auth/LoginPage.tsx
  - frontend/src/pages/auth/UserManagementPage.tsx

- [x] Step 12: 路由配置
  - frontend/src/App.tsx

### 部署配置

- [x] Step 13: Docker 与部署配置
  - frontend/Dockerfile
  - frontend/nginx.conf
  - docker-compose.yml
  - .env.example
  - .gitignore

## 总计: 13 步，约 30+ 文件
