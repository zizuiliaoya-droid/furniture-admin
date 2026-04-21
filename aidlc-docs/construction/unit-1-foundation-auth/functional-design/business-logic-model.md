# Unit 1: 项目基础+认证 — 业务逻辑模型

## 登录流程

```
用户输入 username + password
        |
        v
  验证用户名是否存在 ──否──> 返回 401 "用户名或密码错误"
        |是
        v
  验证密码是否正确 ──否──> 返回 401 "用户名或密码错误"
        |是
        v
  检查 is_active ──否──> 返回 401 "账号已被禁用"
        |是
        v
  Token.objects.get_or_create(user)
        |
        v
  返回 {token: "xxx", user: {id, username, role, display_name}}
```

## 前端认证状态管理

```
authStore (Zustand)
+------------------+
| token: string    |  <-- localStorage 持久化
| user: User       |
| isLoading: bool  |
+------------------+
| login(u, p)      |  --> POST /api/auth/login/ --> 存储 token + user
| logout()         |  --> POST /api/auth/logout/ --> 清除 token + user
| checkAuth()      |  --> GET /api/auth/me/ --> 验证 token 有效性
+------------------+
```

## Axios 拦截器逻辑

```
请求拦截器:
  if (token 存在)
    headers.Authorization = "Token " + token

响应拦截器:
  if (response.status === 401)
    清除 authStore
    跳转 /login
```

## 主布局结构

```
MainLayout
+-------+---------------------------+
|       |  TopBar                   |
|       |  [Logo] [搜索] [用户菜单] |
|  S    +---------------------------+
|  i    |                           |
|  d    |  Content Area             |
|  e    |  (React Router Outlet)    |
|  b    |                           |
|  a    |                           |
|  r    |                           |
+-------+---------------------------+

Sidebar 菜单项:
- 产品管理 (/products)
- 分类管理 (/categories)     [ADMIN]
- 产品图册 (/catalog)
- 客户案例 (/cases)
- 设计资源 (/documents/design)
- 培训资料 (/documents/training)
- 资质文件 (/documents/certificates)
- 报价方案 (/quotes)
- 分享管理 (/shares)
- 用户管理 (/users)          [ADMIN]
```

## 包豪斯主题配置

```
Ant Design ConfigProvider theme:
  token:
    colorPrimary: "#000000"
    colorBgBase: "#FAFAF8"
    borderRadius: 4
    fontFamily: "DM Sans, Inter, Noto Sans SC, sans-serif"
    colorLink: "#1D3557"
    boxShadow: "0 2px 20px rgba(0,0,0,0.04)"

  components:
    Button:
      primaryColor: "#000000"
    Card:
      borderRadius: 4
    Menu:
      itemBorderRadius: 4
```

## 公共工具

### StandardPagination
- 默认每页 20 条
- 返回格式: {count, next, previous, results}
- 支持 page 和 page_size 参数

### 全局异常处理
- 400: 参数验证错误，返回字段级错误信息
- 401: 未认证
- 403: 权限不足
- 404: 资源不存在
- 500: 服务器内部错误
- 统一响应格式: {detail: "错误信息"} 或 {field: ["错误信息"]}
