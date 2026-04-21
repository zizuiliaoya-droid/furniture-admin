# 组件方法签名

> 注：此处定义方法签名和高层用途，详细业务规则在 CONSTRUCTION 阶段的功能设计中定义。

## 后端组件方法

### auth_app

#### AuthService
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| login(username, password) | str, str | {token, user} | 验证凭据，创建/返回 Token |
| logout(token) | str | void | 删除 Token |
| get_current_user(request) | Request | User | 返回当前认证用户信息 |

#### UserViewSet
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| list(request) | query_params | User[] | 用户列表（管理员） |
| create(request) | UserData | User | 创建用户（管理员） |
| retrieve(request, pk) | int | User | 用户详情（管理员） |
| update(request, pk) | int, UserData | User | 更新用户（管理员） |
| toggle_status(request, pk) | int | User | 启用/禁用用户（管理员） |

---

### products

#### ProductViewSet
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| list(request) | search, origin, category, is_active | Product[] | 产品列表（分页+筛选） |
| create(request) | ProductData | Product | 创建产品 |
| retrieve(request, pk) | int | Product (含图片、配置) | 产品详情 |
| partial_update(request, pk) | int, ProductData | Product | 更新产品 |
| destroy(request, pk) | int | void | 删除产品 |
| upload_images(request, pk) | int, File[] | ProductImage[] | 上传产品图片 |
| import_products(request) | ExcelFile | ImportResult | Excel 批量导入 |

#### CategoryViewSet
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| list(request) | dimension, parent | Category[] | 分类列表 |
| create(request) | CategoryData | Category | 创建分类 |
| tree(request) | dimension | CategoryTree[] | 分类树 |
| reorder(request) | [{id, sort_order}] | void | 批量更新排序 |
| partial_update(request, pk) | int, CategoryData | Category | 更新分类 |
| destroy(request, pk) | int | void | 删除分类 |

#### ProductImageService
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| upload(product, files) | Product, File[] | ProductImage[] | 上传并生成缩略图 |
| delete(image_id) | int | void | 删除图片及缩略图 |
| set_cover(image_id) | int | void | 设为封面 |
| update_order(product, order_data) | Product, [{id, sort_order}] | void | 更新排序 |

#### ProductConfigViewSet
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| list(request, product_pk) | int | ProductConfig[] | 配置列表 |
| create(request, product_pk) | int, ConfigData | ProductConfig | 创建配置 |
| update(request, pk) | int, ConfigData | ProductConfig | 更新配置 |
| destroy(request, pk) | int | void | 删除配置 |

---

### catalog

#### CatalogBrowseView
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| list(request) | category, page | Product[] | 图册浏览（仅上架产品） |

#### CatalogSearchView
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| list(request) | q | Product[] | 图册搜索 |

---

### cases

#### CaseViewSet
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| list(request) | industry, product_id | Case[] | 案例列表 |
| create(request) | CaseData | Case | 创建案例 |
| retrieve(request, pk) | int | Case (含图片、关联产品) | 案例详情 |
| partial_update(request, pk) | int, CaseData | Case | 更新案例 |
| destroy(request, pk) | int | void | 删除案例 |
| upload_images(request, pk) | int, File[] | CaseImage[] | 上传案例图片 |

---

### documents

#### DocumentViewSet
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| list(request) | doc_type, folder, tag, search | Document[] | 文档列表 |
| upload(request) | File, metadata | Document | 上传文档 |
| download(request, pk) | int | FileResponse | 下载文档 |
| partial_update(request, pk) | int, {tags} | Document | 更新标签 |
| destroy(request, pk) | int | void | 删除文档 |

#### DocumentFolderViewSet
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| list(request) | doc_type | DocumentFolder[] | 文件夹列表 |
| create(request) | FolderData | DocumentFolder | 创建文件夹 |
| tree(request) | doc_type | FolderTree[] | 文件夹树 |
| destroy(request, pk) | int | void | 删除空文件夹 |

---

### quotes

#### QuoteViewSet
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| list(request) | status, search | Quote[] | 报价单列表 |
| create(request) | QuoteData | Quote | 创建报价单 |
| retrieve(request, pk) | int | Quote (含明细) | 报价单详情 |
| partial_update(request, pk) | int, QuoteData | Quote | 更新报价单 |
| destroy(request, pk) | int | void | 删除报价单（管理员） |
| duplicate(request, pk) | int | Quote | 复制报价单 |
| export_pdf(request, pk) | int | FileResponse | 导出 PDF |

#### QuoteItemViewSet
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| list(request, quote_pk) | int | QuoteItem[] | 明细列表 |
| create(request, quote_pk) | int, ItemData | QuoteItem | 添加明细 |
| update(request, pk) | int, ItemData | QuoteItem | 更新明细 |
| destroy(request, pk) | int | void | 删除明细 |

---

### sharing

#### ShareLinkViewSet
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| list(request) | - | ShareLink[] | 分享链接列表 |
| create(request) | ShareData | ShareLink | 创建分享链接 |
| destroy(request, pk) | int | void | 删除分享链接 |

#### SharePublicView
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| retrieve(request, token) | str | ShareInfo | 获取分享信息（公开） |
| verify(request, token) | str, password | ShareContent | 验证密码并返回内容（公开） |

---

### search

#### global_search_view
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| get(request) | q | {products, cases, documents, quotes} | 跨模块搜索 |

---

### common

#### FileStorageService
| 方法 | 输入 | 输出 | 说明 |
|------|------|------|------|
| save_file(file, subdirectory) | File, str | str (path) | 保存文件，返回相对路径 |
| save_image(file, subdirectory) | File, str | {path, thumbnail_path} | 保存图片+生成缩略图 |
| delete_file(path) | str | void | 删除文件 |
| generate_thumbnail(path, size) | str, tuple | str (thumb_path) | 生成指定尺寸缩略图 |
