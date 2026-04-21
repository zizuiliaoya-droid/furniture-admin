# 服务层设计

## 服务总览

后端采用 View → Service → Model 三层架构，Service 层负责业务逻辑编排。

```
View (接收请求、参数校验、权限检查)
  |
  v
Service (业务逻辑、跨模型操作、事务管理)
  |
  v
Model (数据访问、字段验证、数据库操作)
```

---

## 服务定义

### 1. AuthService
- **位置**: `auth_app/services.py`
- **职责**: 登录验证、Token 生命周期管理、用户状态切换
- **编排**:
  - login: 验证用户名密码 → 检查用户状态 → 创建/获取 Token → 返回
  - logout: 删除 Token
  - toggle_status: 切换 is_active → 如果禁用则删除该用户所有 Token

### 2. CategoryService
- **位置**: `products/services.py`
- **职责**: 分类树构建、排序管理
- **编排**:
  - get_tree: 按维度查询顶级分类 → 递归加载子分类 → 返回树结构
  - reorder: 批量更新 sort_order 字段
  - get_descendants: 获取某分类的所有子孙分类 ID（用于产品筛选）

### 3. ProductImageService
- **位置**: `products/services.py`
- **职责**: 图片上传、缩略图生成、封面管理
- **编排**:
  - upload: 调用 FileStorageService.save_image → 创建 ProductImage 记录 → 首张图自动设为封面
  - set_cover: 取消当前封面 → 设置新封面
  - delete: 调用 FileStorageService.delete_file → 删除记录

### 4. ProductImportService
- **位置**: `products/services.py`
- **职责**: Excel 批量导入产品
- **编排**:
  - import_from_excel: 解析 Excel (openpyxl) → 校验数据 → 批量创建 Product → 返回导入结果（成功/失败数量）

### 5. QuoteCalculationService
- **位置**: `quotes/services.py`（或在 Model 层实现）
- **职责**: 报价金额计算
- **编排**:
  - calculate_subtotal: unit_price * quantity * (1 - discount/100)
  - recalculate_total: 汇总所有明细 subtotal → 更新 Quote.total_amount

### 6. QuotePDFService
- **位置**: `quotes/services.py`
- **职责**: 报价单 PDF 生成
- **编排**:
  - generate_pdf: 加载报价单+明细 → 渲染 HTML 模板 → WeasyPrint 转 PDF → 返回 FileResponse

### 7. ShareService
- **位置**: `sharing/services.py`
- **职责**: 分享链接验证、内容获取、访问日志
- **编排**:
  - validate_access: 检查链接有效性（is_active、过期时间、访问次数）
  - verify_password: 验证密码哈希
  - get_shared_content: 根据 content_type 加载对应内容（Product/Case/Quote/Catalog）
  - log_access: 记录 IP、User-Agent、时间

### 8. FileStorageService
- **位置**: `common/file_storage.py`
- **职责**: 统一文件存储管理
- **编排**:
  - save_file: 生成路径 ({subdir}/{YYYYMMDD}/{uuid}_{filename}) → 写入磁盘
  - save_image: save_file → generate_thumbnail(small) → generate_thumbnail(medium)
  - generate_thumbnail: Pillow 打开图片 → 缩放 → 保存
  - delete_file: 删除原文件 + 关联缩略图

### 9. GlobalSearchService
- **位置**: `search/views.py`（或独立 service）
- **职责**: 跨模块搜索聚合
- **编排**:
  - search: 并行查询 Product/Case/Document/Quote → 各取前5条 → 聚合返回

---

## 前端服务层

### API 客户端 (api.ts)
- 创建 Axios 实例，baseURL 从环境变量读取
- 请求拦截器：自动附加 `Authorization: Token {token}`
- 响应拦截器：401 时清除 token 并跳转登录页

### 各模块 Service
每个 service 文件封装对应后端 API 的调用，统一处理请求/响应格式：
- 列表接口返回 `{ results: T[], count: number }`
- 详情接口返回 `T`
- 创建/更新接口返回 `T`
- 删除接口返回 `void`
- 文件上传使用 `FormData` + `multipart/form-data`

### 状态管理 (Zustand Store)
- **authStore**: 持久化 token 到 localStorage，提供 login/logout action
- **productStore**: 管理产品列表的分页、筛选、搜索状态，避免重复请求
