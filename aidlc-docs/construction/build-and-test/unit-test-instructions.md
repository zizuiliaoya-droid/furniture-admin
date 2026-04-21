# 单元测试指南

## 后端测试

### 运行全部测试
```bash
cd backend
python manage.py test --verbosity=2
```

### 按模块运行
```bash
python manage.py test auth_app --verbosity=2
python manage.py test products --verbosity=2
python manage.py test cases --verbosity=2
python manage.py test documents --verbosity=2
python manage.py test quotes --verbosity=2
python manage.py test sharing --verbosity=2
python manage.py test search --verbosity=2
```

### 关键测试场景

#### auth_app
- 登录成功返回 token
- 登录失败（错误密码）返回 401
- 禁用用户登录返回 401
- 管理员可创建/编辑/禁用用户
- 员工无法访问用户管理接口
- 禁用用户时 token 被删除

#### products
- 产品 CRUD 正常工作
- 分类树查询按维度返回
- 图片上传生成缩略图
- 设置封面取消旧封面
- 搜索覆盖 name/code/description/config
- 分类筛选包含子分类产品
- Excel 导入成功/失败统计

#### quotes
- 报价明细 subtotal 自动计算
- 增删改明细后 total_amount 更新
- 复制报价单包含所有明细
- PDF 导出返回 application/pdf

#### sharing
- 创建分享链接生成 UUID token
- 密码验证正确/错误
- 过期链接返回 403
- 超过最大访问次数返回 403
- 访问日志记录 IP 和 User-Agent

## 前端测试

当前阶段前端未配置测试框架。如需添加，推荐：
- 测试框架: Vitest
- 组件测试: @testing-library/react
- 安装: `npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom`
