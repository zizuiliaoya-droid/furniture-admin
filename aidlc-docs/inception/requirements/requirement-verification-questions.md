# 需求验证问题

请回答以下问题，帮助我更好地理解项目需求。请在每个问题的 [Answer]: 标签后填写字母选项。

## Question 1
关于测试环境部署方案，你提到了 Supabase 和 Netlify+Vercel。考虑到你的技术栈是 Django 后端 + React 前端，你倾向于哪种测试部署方案？

A) Supabase（PostgreSQL数据库）+ Vercel（前端部署）+ Railway/Render（Django后端部署）
B) Netlify（前端部署）+ Railway/Render（Django后端部署）+ 外部 PostgreSQL 服务
C) 全部使用 Vercel（前端）+ Railway（后端+数据库），简化管理
D) 使用 Docker Compose 部署到一台云服务器（如阿里云ECS），与生产环境一致
E) Other (please describe after [Answer]: tag below)

[Answer]: C

## Question 2
关于客户私有云的最终部署环境，具体是什么类型？

A) Synology NAS（如需求文档中提到的 DS920+），通过 Docker 部署
B) 客户自有的 Linux 服务器，通过 Docker Compose 部署
C) 阿里云 SAE + RDS + OSS（如需求文档中提到的云端方案）
D) 客户的 Kubernetes 集群
E) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 3
关于 GitHub 联动的 CI/CD 流程，你期望的自动化程度是？

A) 推送到 GitHub 后自动部署到测试环境（全自动 CI/CD）
B) 推送到 GitHub 后手动触发部署（半自动）
C) 只需要 GitHub 作为代码仓库，部署手动操作
D) Other (please describe after [Answer]: tag below)

[Answer]: A，这个vercel或者railway都能支持跟GitHub联动吧？

## Question 4
需求文档提到同时支持 PostgreSQL 和 MySQL（通过 DB_ENGINE 切换）。在实际开发中，你需要同时支持两种数据库吗？

A) 是的，需要同时支持 PostgreSQL 和 MySQL，因为不同客户环境不同
B) 只需要支持 PostgreSQL，MySQL 支持可以后续再加
C) 只需要支持 MySQL，因为客户私有云用的是 MySQL
D) Other (please describe after [Answer]: tag below)

[Answer]: B

## Question 5
关于阿里云 OSS 媒体文件存储的支持，当前阶段需要实现吗？

A) 是的，需要同时支持本地存储和 OSS 存储，通过环境变量切换
B) 先只实现本地存储，OSS 支持后续再加
C) Other (please describe after [Answer]: tag below)

[Answer]: C，不考虑阿里云部署方案，只需要考虑railway+vercel测试，后期部署客户的私有云

## Question 6
关于前端 UI 的设计风格，你有具体的偏好吗？

A) 使用 Ant Design 默认主题，简洁专业风格
B) 需要自定义主题色（请在 Other 中说明颜色偏好）
C) 有现成的设计稿或 UI 参考
D) Other (please describe after [Answer]: tag below)

[Answer]: A

## Question 7
项目的优先级排序是什么？哪些模块需要优先完成？

A) 按文档顺序：认证 → 产品管理 → 图册 → 案例 → 文档 → 报价 → 分享 → 搜索
B) 核心业务优先：认证 → 产品管理 → 报价 → 案例 → 其他
C) 全部模块同时开发，一次性完成
D) Other (please describe after [Answer]: tag below)

[Answer]: A
