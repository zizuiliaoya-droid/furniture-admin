# Unit 2: 产品管理 — 业务规则

## 分类规则
- BR-CAT-01: 分类按三个维度独立管理（TYPE/SPACE/ORIGIN）
- BR-CAT-02: 同一父分类下同维度不能有重名分类
- BR-CAT-03: 分类树查询按 dimension 筛选顶级分类，递归加载子分类
- BR-CAT-04: 拖拽排序通过批量更新 sort_order 实现
- BR-CAT-05: 删除分类时检查是否有子分类或关联产品

## 产品规则
- BR-PROD-01: 产品编号 code 全局唯一（可空）
- BR-PROD-02: 产品可关联多个分类（跨维度）
- BR-PROD-03: is_active=False 的产品对 STAFF 不可见（图册中不显示）
- BR-PROD-04: 搜索覆盖 name, code, description, configs__config_name, configs__attributes
- BR-PROD-05: 列表支持 search/origin/category/is_active 筛选

## 图片规则
- BR-IMG-01: 上传图片自动生成 small(150x150) 和 medium(400x400) 缩略图
- BR-IMG-02: 每个产品只能有一张封面图，设置新封面时取消旧封面
- BR-IMG-03: 首张上传的图片自动设为封面
- BR-IMG-04: 删除图片时同时删除原图和缩略图文件

## 配置规则
- BR-CFG-01: attributes 为 JSON 格式，存储自定义键值对
- BR-CFG-02: guide_price 为指导价格，可空

## Excel 导入规则
- BR-IMP-01: 使用 openpyxl 解析上传的 Excel 文件
- BR-IMP-02: 导入在事务中执行，失败整体回滚
- BR-IMP-03: 返回导入结果（成功数、失败数、错误详情）
