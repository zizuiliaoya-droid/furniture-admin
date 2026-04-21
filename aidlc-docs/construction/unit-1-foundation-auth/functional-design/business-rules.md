# Unit 1: 项目基础+认证 — 业务规则

## 认证规则

### BR-AUTH-01: 登录验证
- 输入: username, password
- 验证: 用户名存在 AND 密码正确 AND is_active=True
- 成功: 创建或获取 Token，返回 {token, user}
- 失败: 返回 401，消息 "用户名或密码错误" 或 "账号已被禁用"

### BR-AUTH-02: Token 认证
- 每次 API 请求检查 Header: `Authorization: Token {token}`
- Token 有效: 继续处理请求
- Token 无效/缺失: 返回 401
- 前端收到 401: 清除 localStorage 中的 token，跳转登录页

### BR-AUTH-03: 登出
- 删除当前用户的 Token
- 前端清除 localStorage

## 权限规则

### BR-PERM-01: 角色权限矩阵
| 操作 | ADMIN | STAFF |
|------|-------|-------|
| 查看所有模块数据 | ✅ | ✅ |
| 创建产品/案例/文档 | ✅ | ❌ |
| 编辑产品/案例/文档 | ✅ | ❌ |
| 删除产品/案例/文档 | ✅ | ❌ |
| 创建报价单 | ✅ | ✅ |
| 编辑报价单 | ✅ | ✅（仅自己创建的） |
| 删除报价单 | ✅ | ❌ |
| 创建分享链接 | ✅ | ✅ |
| 用户管理 | ✅ | ❌ |

### BR-PERM-02: IsAdminRole 权限类
- 检查 `request.user.role == 'ADMIN'`
- 用于管理员专属操作（用户管理、产品增删改等）

## 用户管理规则

### BR-USER-01: 创建用户
- 仅管理员可操作
- username 必须唯一
- password 使用 Django `make_password` 哈希存储
- role 必须是 ADMIN 或 STAFF
- display_name 必填

### BR-USER-02: 启用/禁用用户
- 仅管理员可操作
- 切换 is_active 字段
- 禁用用户时: 删除该用户所有 Token（强制登出）
- 不能禁用自己

### BR-USER-03: 初始管理员
- 系统启动时（entrypoint.sh）检查是否存在管理员
- 如不存在: 使用环境变量 ADMIN_USERNAME/ADMIN_PASSWORD 创建
- 如已存在: 跳过

## 前端路由守卫规则

### BR-ROUTE-01: ProtectedRoute
- 未登录（无 token）: 重定向到 /login
- 已登录但权限不足: 显示 403 页面或重定向
- 管理员路由（/users, /products/new 等）: 检查 role=ADMIN
