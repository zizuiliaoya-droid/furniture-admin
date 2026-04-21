# 应用组件设计

## 组件总览

本系统采用前后端分离架构，后端为 Django REST API，前端为 React SPA。

```
+--------------------------------------------------+
|                   Frontend (React)                |
|  +--------+ +--------+ +--------+ +--------+     |
|  | Pages  | | Store  | |Services| |Layouts |     |
|  +--------+ +--------+ +--------+ +--------+     |
+--------------------------------------------------+
                      |  Axios (HTTP)
                      v
+--------------------------------------------------+
|                  Backend (Django DRF)              |
|  +----------+ +----------+ +----------+           |
|  |  Views   | |Serializers| | Services |           |
|  +----------+ +----------+ +----------+           |
|  +----------+ +----------+ +----------+           |
|  |  Models  | |Permissions| |  Common  |           |
|  +----------+ +----------+ +----------+           |
+--------------------------------------------------+
                      |
                      v
+--------------------------------------------------+
|              PostgreSQL + File System              |
+--------------------------------------------------+
```

---

## 后端组件

### 1. auth_app — 认证与用户管理
- **职责**: 用户登录/登出、Token 管理、用户 CRUD、角色权限控制
- **接口**: `/api/auth/*`
- **依赖**: 无（基础组件）

### 2. products — 产品管理
- **职责**: 产品 CRUD、分类管理（三维度树形）、产品图片管理、产品配置管理、Excel 批量导入
- **接口**: `/api/products/*`, `/api/categories/*`
- **依赖**: auth_app（权限）, common（文件存储、分页）

### 3. catalog — 产品图册
- **职责**: 产品图册只读浏览、分类筛选、搜索
- **接口**: `/api/catalog/*`
- **依赖**: products（数据源）, auth_app（权限）

### 4. cases — 客户案例
- **职责**: 案例 CRUD、行业分类、案例图片管理、关联产品
- **接口**: `/api/cases/*`
- **依赖**: auth_app（权限）, products（关联产品）, common（文件存储）

### 5. documents — 内部文档
- **职责**: 文档上传/下载/删除、文件夹树管理、在线预览、标签系统
- **接口**: `/api/documents/*`, `/api/document-folders/*`
- **依赖**: auth_app（权限）, common（文件存储）

### 6. quotes — 报价方案
- **职责**: 报价单 CRUD、明细管理、金额自动计算、状态流转、复制、PDF 导出
- **接口**: `/api/quotes/*`
- **依赖**: auth_app（权限）, products（产品关联）

### 7. sharing — 分享功能
- **职责**: 分享链接生成/管理、密码验证、访问控制、访问日志
- **接口**: `/api/shares/*`, `/api/share/{token}/*`
- **依赖**: auth_app（权限）, products, cases, quotes, catalog（分享内容源）

### 8. search — 全局搜索
- **职责**: 跨模块搜索（产品、案例、文档、报价单）
- **接口**: `/api/search/`
- **依赖**: products, cases, documents, quotes（搜索数据源）

### 9. common — 公共工具
- **职责**: 文件存储服务（上传/删除/缩略图生成）、标准分页、全局异常处理
- **接口**: 无（内部服务）
- **依赖**: 无（基础组件）

---

## 前端组件

### 页面组件 (pages/)
| 目录 | 页面 | 说明 |
|------|------|------|
| auth/ | LoginPage, UserManagementPage | 登录、用户管理 |
| products/ | ProductListPage, ProductDetailPage, ProductFormPage, CategoryManagementPage | 产品管理全套 |
| catalog/ | CatalogPage | 产品图册浏览 |
| cases/ | CaseListPage, CaseDetailPage, CaseFormPage | 案例管理 |
| documents/ | DocumentListPage | 文档管理（三种类型共用） |
| quotes/ | QuoteListPage, QuoteDetailPage, QuoteFormPage | 报价管理 |
| sharing/ | ShareManagementPage, ShareViewPage | 分享管理 + 公开查看 |

### 服务层 (services/)
| 文件 | 职责 |
|------|------|
| api.ts | Axios 实例，baseURL 配置，Token 拦截器，401 自动跳转 |
| authService.ts | 登录/登出/用户管理 API |
| productService.ts | 产品/分类/配置/图片 API |
| caseService.ts | 案例 API |
| documentService.ts | 文档/文件夹 API |
| quoteService.ts | 报价单 API |
| shareService.ts | 分享链接 API |
| searchService.ts | 全局搜索 API |

### 状态管理 (store/)
| 文件 | 职责 |
|------|------|
| authStore.ts | 认证状态（token, user, login, logout） |
| productStore.ts | 产品列表状态（分页、筛选、搜索） |

### 布局与公共组件
| 组件 | 职责 |
|------|------|
| MainLayout.tsx | 主布局（侧边栏 + 顶栏 + 内容区） |
| Sidebar.tsx | 侧边导航菜单 |
| ProtectedRoute.tsx | 路由守卫（认证 + 角色检查） |
| GlobalSearch.tsx | 全局搜索组件（顶栏下拉） |
