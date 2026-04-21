# Unit 2: 产品管理 — 领域实体

## Category（产品分类，树形结构）
| 字段 | 类型 | 约束 |
|------|------|------|
| id | BigAutoField | PK |
| name | VARCHAR(100) | 必填 |
| parent | FK → Category | 可空（NULL=顶级） |
| dimension | VARCHAR(10) | TYPE/SPACE/ORIGIN |
| sort_order | INT | 默认 0 |
| unique_together | | (parent, name, dimension) |

## Product（产品）
| 字段 | 类型 | 约束 |
|------|------|------|
| id | BigAutoField | PK |
| name | VARCHAR(200) | 必填 |
| code | VARCHAR(50) | 唯一，可空 |
| description | TEXT | 可空 |
| category | FK → Category | 可空，主分类 |
| origin | VARCHAR(10) | IMPORT/DOMESTIC/CUSTOM |
| min_price | DECIMAL(10,2) | 可空 |
| is_active | BOOLEAN | 默认 True |
| created_by | FK → User | 必填 |
| categories | M2M → Category | 通过 ProductCategory |
| created_at | DATETIME | 自动 |
| updated_at | DATETIME | 自动 |

## ProductImage（产品图片）
| 字段 | 类型 | 约束 |
|------|------|------|
| id | BigAutoField | PK |
| product | FK → Product | CASCADE |
| image_path | VARCHAR(500) | 必填 |
| thumbnail_path | VARCHAR(500) | 可空 |
| sort_order | INT | 默认 0 |
| is_cover | BOOLEAN | 默认 False |
| created_at | DATETIME | 自动 |

## ProductConfig（产品配置）
| 字段 | 类型 | 约束 |
|------|------|------|
| id | BigAutoField | PK |
| product | FK → Product | CASCADE |
| config_name | VARCHAR(200) | 必填 |
| attributes | JSONField | 默认 {} |
| guide_price | DECIMAL(10,2) | 可空 |
| created_at | DATETIME | 自动 |

## ProductCategory（多对多中间表）
| 字段 | 类型 | 约束 |
|------|------|------|
| id | BigAutoField | PK |
| product | FK → Product | CASCADE |
| category | FK → Category | CASCADE |
| unique_together | | (product, category) |
