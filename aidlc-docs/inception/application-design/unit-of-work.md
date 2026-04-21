# 工作单元定义

## 项目架构
- **部署模型**: 单体应用（Monolith）— Django 后端 + React 前端
- **代码组织**: 按功能模块划分 Django apps 和前端 pages
- **单元含义**: 每个单元是一个逻辑开发阶段，包含后端 app + 前端页面 + 相关配置

---

## Unit 1: 项目基础 + 用户认证

### 范围
- Django 项目骨架（config/settings, urls, wsgi）
- React 项目骨架（Vite, TypeScript, Ant Design 包豪斯主题配置）
- Docker Compose 配置（db + backend + frontend）
- Railway/Vercel 部署配置
- auth_app 后端（User 模型、登录/登出、用户 CRUD、权限）
- 前端认证（LoginPage、UserManagementPage、authStore、ProtectedRoute）
- 主布局（MainLayout、Sidebar）
- 公共工具（common/pagination, exceptions, file_storage 骨架）

### 交付物
- 可运行的前后端项目骨架
- Docker Compose 一键启动
- 完整的认证流程（登录→Token→权限控制）
- 包豪斯风格主题配置（色彩、字体、阴影、动效基础）

### 预估复杂度: 中等

---

## Unit 2: 产品管理

### 范围
- products 后端（Product, Category, ProductImage, ProductConfig, ProductCategory 模型）
- 产品 CRUD API + 分类 CRUD API + 配置 CRUD API
- 图片上传/删除/排序/封面设置
- 分类树查询（三维度）+ 拖拽排序
- Excel 批量导入
- FileStorageService 完整实现（上传、缩略图生成、删除）
- 前端：ProductListPage, ProductDetailPage, ProductFormPage, CategoryManagementPage
- 前端：productService, productStore

### 交付物
- 完整的产品管理功能
- 三维度分类体系
- 图片上传+缩略图
- Excel 导入

### 预估复杂度: 高（模块最大，功能最多）

---

## Unit 3: 产品图册

### 范围
- catalog 后端（CatalogBrowseView, CatalogSearchView）
- 前端：CatalogPage（卡片式浏览、分类导航、搜索、分页）

### 交付物
- 产品图册浏览页面
- 分类筛选 + 搜索

### 预估复杂度: 低（基于 products 数据的只读视图）

---

## Unit 4: 客户案例

### 范围
- cases 后端（Case, CaseImage, CaseProduct 模型）
- 案例 CRUD API + 图片上传
- 前端：CaseListPage, CaseDetailPage, CaseFormPage
- 前端：caseService

### 交付物
- 完整的案例管理功能
- 行业分类筛选
- 关联产品展示

### 预估复杂度: 中等

---

## Unit 5: 内部文档

### 范围
- documents 后端（DocumentFolder, Document 模型）
- 文档上传/下载/删除 API + 文件夹 CRUD API
- 在线预览（图片、PDF、音频、视频）
- 标签系统
- 前端：DocumentListPage（三种文档类型共用，通过路由区分）
- 前端：documentService

### 交付物
- 完整的文档管理功能
- 树形文件夹
- 在线预览/播放
- 标签筛选

### 预估复杂度: 中等

---

## Unit 6: 报价方案

### 范围
- quotes 后端（Quote, QuoteItem 模型）
- 报价单 CRUD API + 明细 CRUD API
- 金额自动计算（subtotal, total）
- 状态管理（DRAFT/SENT/CONFIRMED/CANCELLED）
- 复制报价单
- PDF 导出（WeasyPrint）
- 前端：QuoteListPage, QuoteDetailPage, QuoteFormPage
- 前端：quoteService

### 交付物
- 完整的报价管理功能
- PDF 导出
- 报价单复制

### 预估复杂度: 高（金额计算、PDF 生成、状态流转）

---

## Unit 7: 分享功能

### 范围
- sharing 后端（ShareLink, ShareAccessLog 模型）
- 分享链接 CRUD API + 公开访问验证 API
- 密码保护、过期控制、访问次数限制
- 访问日志记录
- 前端：ShareManagementPage, ShareViewPage
- 前端：shareService

### 交付物
- 完整的分享功能
- 公开访问页面（无需登录）
- 访问控制和日志

### 预估复杂度: 中等

---

## Unit 8: 全局搜索 + 收尾

### 范围
- search 后端（global_search_view）
- 前端：GlobalSearch 组件（顶栏实时搜索下拉）
- 前端：searchService
- UI 微交互打磨（动效、过渡、骨架屏）
- 整体联调和 bug 修复
- .env.example 完善
- .gitignore 完善

### 交付物
- 跨模块全局搜索
- UI 动效完善
- 项目整体可用

### 预估复杂度: 中等

---

## 代码组织策略（Greenfield）

```
项目根目录/
├── backend/                    # Django 后端（所有 Unit 的后端代码）
│   ├── config/                 # Unit 1: 项目配置
│   ├── auth_app/               # Unit 1: 认证
│   ├── products/               # Unit 2: 产品管理
│   ├── catalog/                # Unit 3: 产品图册
│   ├── cases/                  # Unit 4: 客户案例
│   ├── documents/              # Unit 5: 内部文档
│   ├── quotes/                 # Unit 6: 报价方案
│   ├── sharing/                # Unit 7: 分享功能
│   ├── search/                 # Unit 8: 全局搜索
│   └── common/                 # Unit 1: 公共工具（后续 Unit 扩展）
├── frontend/                   # React 前端（所有 Unit 的前端代码）
│   └── src/
│       ├── pages/              # 各 Unit 对应的页面
│       ├── services/           # 各 Unit 对应的 API 服务
│       ├── store/              # Unit 1-2: 状态管理
│       ├── components/         # Unit 1, 8: 公共组件
│       ├── layouts/            # Unit 1: 布局
│       └── styles/             # Unit 1: 包豪斯主题
├── docker-compose.yml          # Unit 1: Docker 编排
└── .env.example                # Unit 1: 环境变量模板
```
