# 组件依赖关系

## 依赖矩阵

| 组件 | 依赖 | 被依赖 |
|------|------|--------|
| common | 无 | products, cases, documents |
| auth_app | 无 | 所有需要认证的组件 |
| products | auth_app, common | catalog, cases, quotes, sharing, search |
| catalog | products, auth_app | sharing |
| cases | auth_app, products, common | sharing, search |
| documents | auth_app, common | search |
| quotes | auth_app, products | sharing, search |
| sharing | auth_app, products, cases, quotes, catalog | 无 |
| search | products, cases, documents, quotes | 无 |

## 依赖层级图

```
Layer 0 (基础):    common          auth_app
                     |                |
Layer 1 (核心):    products        documents
                   /  |  \            |
Layer 2 (扩展):  catalog cases  quotes  |
                   \   |    /         |
Layer 3 (聚合):    sharing        search
```

## 通信模式

### 前后端通信
- **协议**: HTTP/HTTPS REST API
- **格式**: JSON（数据）、multipart/form-data（文件上传）
- **认证**: Token Authentication（Header: `Authorization: Token {token}`）
- **分页**: `?page=1&page_size=20` → `{count, next, previous, results}`

### 后端组件间通信
- **模式**: 直接 Python 导入（同一 Django 项目内）
- **数据共享**: 通过 Django ORM 外键和多对多关系
- **服务调用**: Service 层直接调用其他 Service（如 ShareService 调用各模块获取内容）

### 数据流

#### 产品创建流程
```
前端 ProductFormPage
  -> productService.create(data)
  -> POST /api/products/
  -> ProductViewSet.create()
  -> Product.objects.create()
  -> 返回 Product JSON
```

#### 图片上传流程
```
前端 ProductFormPage (图片上传)
  -> productService.uploadImages(productId, files)
  -> POST /api/products/{id}/upload_images/
  -> ProductViewSet.upload_images()
  -> ProductImageService.upload()
  -> FileStorageService.save_image()
  -> Pillow 生成缩略图
  -> 返回 ProductImage[] JSON
```

#### 分享访问流程
```
外部用户访问 /s/{token}
  -> shareService.getShareInfo(token)
  -> GET /api/share/{token}/
  -> SharePublicView.retrieve()
  -> ShareService.validate_access()
  -> 返回分享信息（是否需要密码等）
  -> [如需密码] POST /api/share/{token}/verify/
  -> ShareService.verify_password()
  -> ShareService.get_shared_content()
  -> ShareService.log_access()
  -> 返回分享内容
```

#### PDF 导出流程
```
前端 QuoteDetailPage
  -> quoteService.exportPDF(quoteId)
  -> GET /api/quotes/{id}/pdf/
  -> QuoteViewSet.export_pdf()
  -> QuotePDFService.generate_pdf()
  -> 加载 Quote + QuoteItems
  -> 渲染 HTML 模板
  -> WeasyPrint 转 PDF
  -> 返回 FileResponse (application/pdf)
```
