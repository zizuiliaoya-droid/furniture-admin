# NFR 需求评估

## 性能需求
| 指标 | 要求 |
|------|------|
| 页面加载 | < 2 秒 |
| API 响应 | < 500ms |
| 图片上传 | 单张 < 10MB，自动生成缩略图 |
| 文档上传 | 单个 < 50MB |
| 分页 | 默认每页 20 条，避免大数据量卡顿 |

## 安全需求
| 项目 | 方案 |
|------|------|
| 密码存储 | Django PBKDF2 哈希 |
| API 认证 | DRF Token Authentication |
| 权限控制 | 角色 RBAC（ADMIN/STAFF） |
| 分享密码 | bcrypt/PBKDF2 哈希存储 |
| CORS | 白名单模式，仅允许配置的源 |
| CSRF | DRF API 豁免（Token 认证），Django admin 保留 |

## 可靠性需求
| 项目 | 方案 |
|------|------|
| 容器重启 | Docker restart: always |
| 数据持久化 | PostgreSQL 数据 + 媒体文件均使用 Docker volume |
| 数据备份 | NAS Hyper Backup |

## 技术栈确认
| 层级 | 选择 | 理由 |
|------|------|------|
| 后端 | Django 5.x + DRF 3.15+ | 成熟稳定，ORM 强大 |
| 数据库 | PostgreSQL 16 | JSON 字段支持好，仅支持 PG |
| 前端 | React 18 + TypeScript 5 + Vite 5 | 现代化，类型安全 |
| UI | Ant Design 5.x（包豪斯定制） | 组件丰富，主题可定制 |
| 状态管理 | Zustand 4.x | 轻量，API 简洁 |
| PDF | WeasyPrint | 支持 CSS 排版 |
| 图片处理 | Pillow | 缩略图生成 |
| Excel | openpyxl | 批量导入 |
