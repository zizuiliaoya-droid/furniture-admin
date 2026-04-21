# Unit 1: 项目基础+认证 — 领域实体

## User 实体

```
User (继承 Django AbstractUser)
+-------------------+---------------+----------------------------------+
| 字段              | 类型          | 约束                             |
+-------------------+---------------+----------------------------------+
| id                | BigAutoField  | PK, 自增                        |
| username          | VARCHAR(150)  | 唯一, 必填                      |
| password          | VARCHAR(128)  | 必填, Django 哈希存储            |
| role              | VARCHAR(10)   | 必填, choices: ADMIN/STAFF      |
| display_name      | VARCHAR(100)  | 必填                            |
| is_active         | BOOLEAN       | 默认 True                       |
| date_joined       | DATETIME      | 自动设置                        |
| email             | VARCHAR(254)  | 可选（继承自 AbstractUser）      |
+-------------------+---------------+----------------------------------+
```

### 角色定义
| 角色 | 值 | 权限范围 |
|------|-----|----------|
| 管理员 | ADMIN | 所有模块的增删改查 + 用户管理 |
| 普通员工 | STAFF | 所有模块的查看 + 报价单/分享链接的创建 |

### Token 实体
- 使用 DRF 内置 `rest_framework.authtoken.Token`
- 一个用户对应一个 Token（OneToOne 关系）
- Token 在登录时创建/获取，登出时删除
