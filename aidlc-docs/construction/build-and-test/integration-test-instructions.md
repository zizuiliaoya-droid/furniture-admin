# 集成测试指南

## 测试环境
使用 Docker Compose 启动完整环境后进行集成测试。

```bash
docker-compose up -d --build
```

## 测试场景

### 场景 1: 认证 → 产品管理
1. POST `/api/auth/login/` 获取 token
2. 使用 token 创建产品 POST `/api/products/`
3. 上传产品图片 POST `/api/products/{id}/upload_images/`
4. 验证产品详情包含图片和缩略图

### 场景 2: 产品 → 报价单
1. 创建产品并获取 ID
2. 创建报价单 POST `/api/quotes/`
3. 添加明细（关联产品）POST `/api/quotes/{id}/items/`
4. 验证 total_amount 自动计算正确
5. 导出 PDF GET `/api/quotes/{id}/pdf/`

### 场景 3: 产品 → 案例 → 分享
1. 创建产品
2. 创建案例并关联产品
3. 创建分享链接（类型=CASE）
4. 无密码访问 GET `/api/share/{token}/`
5. 验证 POST `/api/share/{token}/verify/` 返回案例内容

### 场景 4: 文档上传 → 下载 → 预览
1. 创建文件夹 POST `/api/document-folders/`
2. 上传文档到文件夹 POST `/api/documents/upload/`
3. 下载文档 GET `/api/documents/{id}/download/`
4. 验证文件内容一致

### 场景 5: 全局搜索
1. 创建产品（名称含"测试"）
2. 创建案例（标题含"测试"）
3. 搜索 GET `/api/search/?q=测试`
4. 验证返回结果包含产品和案例

### 场景 6: 权限控制
1. 使用 STAFF 角色登录
2. 尝试创建产品 → 应返回 403
3. 尝试查看产品列表 → 应返回 200
4. 尝试创建报价单 → 应返回 201（员工可创建报价单）
5. 尝试删除报价单 → 应返回 403

## 使用 curl 手动测试示例

```bash
# 登录
TOKEN=$(curl -s -X POST http://localhost/api/auth/login/ \
  -H "Content-Type: application/json" \
  -d '{"username":"admin","password":"admin123456"}' | python -c "import sys,json; print(json.load(sys.stdin)['token'])")

# 创建产品
curl -X POST http://localhost/api/products/ \
  -H "Authorization: Token $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"name":"测试沙发","origin":"DOMESTIC","min_price":5999}'

# 全局搜索
curl http://localhost/api/search/?q=沙发 \
  -H "Authorization: Token $TOKEN"
```
