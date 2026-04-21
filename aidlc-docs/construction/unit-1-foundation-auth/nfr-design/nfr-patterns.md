# NFR 设计模式

## 性能模式

### 数据库查询优化
- 使用 `select_related` 和 `prefetch_related` 减少 N+1 查询
- 分页查询使用 `StandardPagination`（默认 20 条/页）
- 列表接口使用精简序列化器（不加载关联详情）

### 前端性能
- Vite 代码分割（React.lazy + Suspense 按路由懒加载）
- 图片使用缩略图（列表用 small 150x150，详情用 medium 400x400）
- 骨架屏（Skeleton）替代 loading spinner
- Ant Design 按需导入

### 文件上传
- 前端限制文件大小（图片 10MB，文档 50MB）
- 后端 Django settings: DATA_UPLOAD_MAX_MEMORY_SIZE, FILE_UPLOAD_MAX_MEMORY_SIZE
- 缩略图异步生成（在 save 时同步生成，文件较小可接受）

## 安全模式

### 认证链路
```
前端 → Axios 拦截器添加 Token → Django DRF TokenAuthentication → View
```

### 权限检查链路
```
View → DRF permission_classes → IsAuthenticated / IsAdminRole → 业务逻辑
```

### CORS 配置
```python
CORS_ALLOWED_ORIGINS = env_list("CORS_ALLOWED_ORIGINS")
# 测试环境: https://<app>.vercel.app
# 生产环境: http://<nas-ip>
```

### 文件安全
- 上传文件重命名（UUID 前缀），防止路径遍历
- 文件类型不做严格限制（内部系统，信任用户）
- 媒体文件通过 Nginx 直接服务（生产）或 Django 服务（测试）

## 可靠性模式

### 数据库事务
- 报价单明细操作使用 `transaction.atomic()`
- 批量导入使用事务，失败时整体回滚

### 错误处理
- 全局异常处理器（DRF custom_exception_handler）
- 统一错误响应格式
- 前端 Axios 响应拦截器统一处理错误提示

## 静态文件服务模式

### 测试环境（Railway + Vercel）
- 前端: Vercel 自动托管构建产物
- 后端静态文件: WhiteNoise 中间件
- 媒体文件: Django 直接服务（MEDIA_URL + FileResponse）

### 生产环境（NAS Docker）
- 前端: Nginx 容器托管构建产物
- 后端静态文件: Nginx 代理 /static/
- 媒体文件: Nginx 代理 /media/
