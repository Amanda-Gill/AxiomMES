# Axiom MES 智能生产系统 · 项目规范

| 版本 | 日期       | 说明             | 作者     |
| ---- | ---------- | ---------------- | -------- |
| v1.0 | 2026-02-23 | 依据技术栈文档生成 | MES 架构组 |

## 目录
1. [项目概述](#1-项目概述)
2. [技术栈版本锁定](#2-技术栈版本锁定)
3. [代码规范](#3-代码规范)
   - 3.1 [后端（Python / FastAPI）](#31-后端python--fastapi)
   - 3.2 [前端（Vue 3 / TypeScript）](#32-前端vue-3--typescript)
   - 3.3 [通用规范](#33-通用规范)
4. [目录结构规范](#4-目录结构规范)
   - 4.1 [后端项目结构](#41-后端项目结构)
   - 4.2 [前端项目结构](#42-前端项目结构)
   - 4.3 [监控与部署配置](#43-监控与部署配置)
5. [命名规范](#5-命名规范)
   - 5.1 [后端命名](#51-后端命名)
   - 5.2 [前端命名](#52-前端命名)
   - 5.3 [数据库命名](#53-数据库命名)
   - 5.4 [API 路由命名](#54-api-路由命名)
6. [数据库设计规范](#6-数据库设计规范)
   - 6.1 [通用原则](#61-通用原则)
   - 6.2 [表结构设计](#62-表结构设计)
   - 6.3 [索引规范](#63-索引规范)
   - 6.4 [分库分表与读写分离](#64-分库分表与读写分离)
   - 6.5 [时序数据（TimescaleDB）规范](#65-时序数据timescaledb规范)
7. [API 设计规范](#7-api-设计规范)
   - 7.1 [RESTful 原则](#71-restful-原则)
   - 7.2 [请求与响应格式](#72-请求与响应格式)
   - 7.3 [版本控制](#73-版本控制)
   - 7.4 [错误处理](#74-错误处理)
8. [日志规范](#8-日志规范)
   - 8.1 [日志级别](#81-日志级别)
   - 8.2 [日志格式](#82-日志格式)
   - 8.3 [日志采集与存储](#83-日志采集与存储)
9. [异常处理规范](#9-异常处理规范)
   - 9.1 [异常分类](#91-异常分类)
   - 9.2 [全局异常处理](#92-全局异常处理)
   - 9.3 [业务异常](#93-业务异常)
10. [安全规范](#10-安全规范)
    - 10.1 [认证与授权](#101-认证与授权)
    - 10.2 [数据加密](#102-数据加密)
    - 10.3 [输入校验与防注入](#103-输入校验与防注入)
    - 10.4 [网络与传输安全](#104-网络与传输安全)
    - 10.5 [审计与合规](#105-审计与合规)
11. [测试规范](#11-测试规范)
    - 11.1 [单元测试](#111-单元测试)
    - 11.2 [集成测试](#112-集成测试)
    - 11.3 [端到端测试](#113-端到端测试)
    - 11.4 [性能测试](#114-性能测试)
12. [CI/CD 规范](#12-cicd-规范)
    - 12.1 [版本控制与分支管理](#121-版本控制与分支管理)
    - 12.2 [持续集成](#122-持续集成)
    - 12.3 [持续部署](#123-持续部署)
13. [部署规范](#13-部署规范)
    - 13.1 [容器化规范](#131-容器化规范)
    - 13.2 [编排与调度](#132-编排与调度)
    - 13.3 [环境配置管理](#133-环境配置管理)
    - 13.4 [健康检查与就绪探针](#134-健康检查与就绪探针)
14. [配置管理规范](#14-配置管理规范)
    - 14.1 [配置分层](#141-配置分层)
    - 14.2 [敏感信息管理](#142-敏感信息管理)
    - 14.3 [动态配置](#143-动态配置)
15. [依赖管理规范](#15-依赖管理规范)
    - 15.1 [后端依赖](#151-后端依赖)
    - 15.2 [前端依赖](#152-前端依赖)
16. [监控与告警规范](#16-监控与告警规范)
    - 16.1 [指标采集](#161-指标采集)
    - 16.2 [告警规则](#162-告警规则)
    - 16.3 [日志与追踪](#163-日志与追踪)
17. [备份与恢复规范](#17-备份与恢复规范)
18. [文档规范](#18-文档规范)
19. [AI 辅助开发规范（可选）](#19-ai-辅助开发规范可选)

---

## 1. 项目概述

Axiom MES 智能生产系统是一套面向制造企业的全流程生产执行管理平台。本项目采用微服务架构，以容器化方式部署，强调可观测性、高可用与可扩展性。本规范旨在统一团队开发行为，保证代码质量、系统稳定性与可维护性。

## 2. 技术栈版本锁定

所有核心组件必须使用以下锁定版本，避免因版本升级引入不兼容变更。

| 组件             | 版本                            | 说明                         |
| ---------------- | ------------------------------- | ---------------------------- |
| Python           | 3.14-slim                       | 基础镜像                     |
| FastAPI          | 0.115.x                         | Web 框架                     |
| SQLAlchemy       | 2.0.x                           | ORM                          |
| Celery           | 5.5.x                           | 分布式任务队列               |
| Prefect          | 2.19.x                          | 工作流编排                   |
| Pydantic         | 2.x                             | 数据验证                     |
| Prometheus-Client| 0.21.x                          | 指标暴露                     |
| Vue              | 3.4.x                           | 前端框架                     |
| Vite             | 5.x                             | 构建工具                     |
| Element Plus     | 2.x                             | UI 组件库                    |
| Pinia            | 2.x                             | 状态管理                     |
| TypeScript       | 5.x                             | 前端语言                     |
| Node.js          | 24.13.1-alpine                  | 前端构建环境                 |
| PostgreSQL       | 18-alpine                       | 关系数据库                   |
| TimescaleDB      | 2.25.1-pg18                     | 时序数据库                   |
| Redis            | 8.6.0-alpine                    | 缓存与分布式锁               |
| RabbitMQ         | 3.13-management                 | 消息队列                     |
| MinIO            | RELEASE.2025-09-07T16-13-09Z    | 对象存储                     |
| Traefik          | v3.6.8                          | 网关/反向代理                |
| Prometheus       | v3.9.1                          | 指标采集                     |
| Grafana          | 12.4.0                          | 可视化                       |
| Loki             | 3.6.6                           | 日志聚合                     |
| Tempo            | 2.9.1                           | 链路追踪                     |
| Alertmanager     | v0.31.1                         | 告警管理                     |
| Docker           | 29.2.1+                         | 容器引擎                     |
| Docker Compose   | 5.0.2+                          | 容器编排（开发/测试环境）    |
| Kubernetes       | 1.30+（推荐）                   | 生产环境编排（可选）          |

## 3. 代码规范

### 3.1 后端（Python / FastAPI）

- **代码风格**：遵循 [PEP 8](https://www.python.org/dev/peps/pep-0008/)，使用 `black` 格式化，行长度 120 字符。
- **类型注解**：所有函数必须使用类型注解，启用 `mypy` 严格模式检查。
- **文档字符串**：使用 Google 风格或 Sphinx 风格，包含参数、返回值、异常说明。
- **导入顺序**：标准库 → 第三方库 → 本地模块，每组之间空一行。
- **异步优先**：I/O 密集型操作使用 `async/await`，CPU 密集型使用 Celery 任务。
- **错误处理**：使用自定义异常类，避免裸抛 `Exception`。
- **配置文件**：使用 Pydantic `BaseSettings` 管理配置，敏感信息从环境变量读取。
- **依赖注入**：FastAPI 依赖项应集中管理，避免在路由函数中直接创建资源。

### 3.2 前端（Vue 3 / TypeScript）

- **代码风格**：使用 [Prettier](https://prettier.io/) 统一格式，配置单引号、无分号、缩进 2 空格。
- **TypeScript**：严格模式启用，禁止使用 `any`，必要时应使用 `unknown` 或自定义类型守卫。
- **组件规范**：
  - 使用组合式 API（`<script setup>`）。
  - 组件名使用 PascalCase，文件名使用 kebab-case（例如 `UserProfile.vue` → `user-profile.vue`）。
  - Props 定义需包含类型、默认值、验证。
  - 事件名使用 kebab-case。
- **状态管理**：使用 Pinia，每个 Store 独立文件，模块化划分。
- **样式**：使用 CSS 预处理器（SCSS），BEM 命名规范，避免全局污染（可使用 scoped 或 CSS Modules）。

### 3.3 通用规范

- **注释**：复杂逻辑必须添加注释，注释应解释“为什么”而非“是什么”。
- **TODO/FIXME**：统一标记，并关联 Issue 编号。
- **文件编码**：UTF-8。
- **行尾**：LF（Unix 风格）。

## 4. 目录结构规范

### 4.1 后端项目结构

采用域驱动设计（DDD）风格，每个业务域独立模块。

```
backend/
├── alembic/                 # 数据库迁移脚本
├── src/
│   ├── auth/                # 认证域
│   │   ├── router.py        # 路由
│   │   ├── schemas.py       # Pydantic 模型
│   │   ├── models.py        # SQLAlchemy 模型
│   │   ├── service.py       # 业务逻辑
│   │   ├── dependencies.py  # 依赖项
│   │   ├── exceptions.py    # 域异常
│   │   ├── constants.py     # 常量
│   │   ├── utils.py         # 工具函数
│   │   └── tasks.py         # Celery 任务
│   ├── strategy/            # 策略管理域（类似结构）
│   ├── schedule/            # 生产排程域
│   ├── quality/             # 质量管理域
│   ├── employee/            # 员工技能域
│   ├── ...
│   ├── core/                # 核心通用层
│   │   ├── config.py        # 全局配置（Pydantic Settings）
│   │   ├── database.py      # 数据库会话
│   │   ├── security.py      # 安全工具（JWT、加密）
│   │   ├── logging.py       # 日志配置
│   │   ├── exceptions.py    # 全局异常基类
│   │   └── response.py      # 统一响应格式
│   ├── tasks/               # Celery 应用配置
│   │   ├── celery_app.py
│   │   └── base.py
│   ├── workflows/           # Prefect 工作流配置
│   │   ├── prefect_app.py
│   │   └── base.py
│   ├── rules/               # 规则引擎核心
│   │   ├── engine.py
│   │   └── base_rules.py
│   ├── utils/               # 全局工具
│   │   ├── pagination.py
│   │   ├── metrics.py       # Prometheus 指标
│   │   └── ...
│   └── main.py              # FastAPI 应用入口
├── tests/                   # 测试
│   ├── conftest.py
│   ├── auth/
│   ├── strategy/
│   └── ...
├── requirements/            # 依赖拆分
│   ├── base.txt
│   ├── dev.txt
│   └── prod.txt
├── .env.example             # 环境变量示例
├── .gitignore
├── logging.ini              # 日志配置
├── alembic.ini
├── celery_config.py         # Celery 全局配置（可选）
└── prefect_config.py        # Prefect 全局配置（可选）
```

### 4.2 前端项目结构

```
frontend/
├── public/                  # 静态资源（不打包）
├── src/
│   ├── assets/              # 资源（图片、字体等，会打包）
│   ├── components/          # 公共组件
│   │   ├── common/          # 基础组件（按钮、输入框等）
│   │   └── business/        # 业务组件
│   ├── views/               # 页面级组件
│   │   ├── dashboard/
│   │   ├── strategy/
│   │   └── ...
│   ├── stores/              # Pinia stores
│   │   ├── auth.ts
│   │   ├── strategy.ts
│   │   └── ...
│   ├── router/              # 路由配置
│   │   └── index.ts
│   ├── api/                 # API 接口封装
│   │   ├── client.ts        # Axios 实例
│   │   ├── auth.ts
│   │   └── ...
│   ├── utils/               # 工具函数
│   │   ├── request.ts
│   │   ├── format.ts
│   │   └── ...
│   ├── styles/              # 全局样式
│   │   ├── variables.scss
│   │   ├── mixins.scss
│   │   └── global.scss
│   ├── types/               # TypeScript 类型定义
│   │   ├── api.ts
│   │   └── ...
│   ├── App.vue
│   └── main.ts
├── index.html
├── package.json
├── vite.config.ts
├── tsconfig.json
├── .eslintrc.js
├── .prettierrc
└── ...
```

### 4.3 监控与部署配置

```
monitoring/
├── prometheus/
│   └── prometheus.yml
├── grafana/
│   ├── dashboards/
│   └── datasources/
├── loki/
│   └── loki.yml
├── tempo/
│   └── tempo.yml
└── alertmanager/
    └── alertmanager.yml

deploy/
├── docker-compose/          # 开发/测试环境 compose 文件
│   ├── docker-compose.yml
│   └── .env
├── k8s/                     # 生产环境 Kubernetes 清单（可选）
│   ├── namespace.yaml
│   ├── configmap.yaml
│   ├── secrets.yaml
│   ├── deployments/
│   └── services/
└── scripts/                 # 部署辅助脚本
```

## 5. 命名规范

### 5.1 后端命名

| 类型         | 规范                                       | 示例                     |
| ------------ | ------------------------------------------ | ------------------------ |
| 模块/包      | 小写字母，下划线分隔                       | `auth`, `strategy_exec`  |
| 类           | PascalCase                                 | `UserService`            |
| 函数/方法    | snake_case                                  | `get_user_by_id`         |
| 变量         | snake_case                                  | `user_name`              |
| 常量         | 大写字母，下划线分隔                       | `MAX_RETRY_COUNT`        |
| 异常类       | 以 `Error` 结尾，PascalCase                | `UserNotFoundError`      |
| Pydantic 模型| 使用 PascalCase，响应模型加 `Response` 后缀 | `UserCreate`, `UserResponse` |
| SQLAlchemy 模型| PascalCase，单数形式                     | `User`, `Strategy`       |

### 5.2 前端命名

| 类型           | 规范                                       | 示例                     |
| -------------- | ------------------------------------------ | ------------------------ |
| 组件名（文件） | kebab-case                                 | `user-profile.vue`       |
| 组件名（代码） | PascalCase（与文件名对应）                 | `UserProfile`            |
| 变量/函数      | camelCase                                  | `userName`, `fetchData`  |
| 常量           | 大写字母，下划线分隔                       | `API_BASE_URL`           |
| Pinia Store    | camelCase，以 `use` 开头，`Store` 结尾     | `useAuthStore`           |
| 路由路径       | kebab-case                                 | `/user-profile`          |
| CSS 类名       | BEM 规范，如 `block__element--modifier`    | `user-card__title--large`|

### 5.3 数据库命名

| 类型         | 规范                                       | 示例                     |
| ------------ | ------------------------------------------ | ------------------------ |
| 数据库名     | 小写字母，下划线分隔                       | `mes_db`                 |
| 表名         | 小写字母，下划线分隔，复数形式              | `users`, `strategies`    |
| 字段名       | 小写字母，下划线分隔                       | `created_at`, `user_id`  |
| 主键         | `id`                                       | `id`                     |
| 外键         | 引用表名单数 + `_id`                       | `user_id`                |
| 索引名       | `idx_` + 表名 + 字段名                     | `idx_users_email`        |
| 唯一约束名   | `uniq_` + 表名 + 字段名                    | `uniq_users_email`       |

### 5.4 API 路由命名

- 使用名词复数形式，RESTful 风格。
- 路径中变量使用 `{变量名}` 形式。
- 版本号放在路径前缀，如 `/api/v1/strategies`。

| 方法   | 路径                    | 说明                 |
| ------ | ----------------------- | -------------------- |
| GET    | /strategies             | 列表                 |
| POST   | /strategies             | 创建                 |
| GET    | /strategies/{id}        | 详情                 |
| PUT    | /strategies/{id}        | 全量更新             |
| PATCH  | /strategies/{id}        | 部分更新             |
| DELETE | /strategies/{id}        | 删除                 |
| GET    | /strategies/{id}/history| 子资源               |

## 6. 数据库设计规范

### 6.1 通用原则

- 所有表必须包含 `id`（主键，自增或 UUID）、`created_at`、`updated_at` 字段。
- 使用时间戳带时区（`timestamptz`）。
- 避免使用外键约束（业务层保证一致性，减少锁开销），但可在设计文档中注明关系。
- 字符集使用 `UTF8`。

### 6.2 表结构设计

- 字段类型选择合适的最小类型（如 `smallint` 代替 `int`）。
- 所有字段禁止 `NULL`，可使用默认值或空字符串。
- 布尔字段使用 `boolean` 类型。
- 金额字段使用 `numeric(19,4)`。
- JSON 字段使用 `jsonb`（PostgreSQL）。

### 6.3 索引规范

- 为所有外键、频繁查询字段、排序字段创建索引。
- 复合索引遵循最左前缀原则。
- 避免过多索引，索引总数不超过表字段数的 1/3。
- 定期使用 `pg_stat_user_indexes` 分析索引使用情况，清理无用索引。

### 6.4 分库分表与读写分离

- 对于单表数据量超过 1000 万或增长迅速的表，提前规划分表策略（按时间或 ID 取模）。
- 读写分离：主库处理写操作，从库处理读操作，应用层通过配置决定数据源。
- 在 Kubernetes 环境中可使用 `pgpool` 或 `patroni` 管理主从。

### 6.5 时序数据（TimescaleDB）规范

- 每个时序表必须指定时间列作为分区键，按时间范围分区。
- 使用 `CREATE hypertable` 创建超表。
- 启用数据压缩（`ALTER TABLE ... SET (timescaledb.compress)`）。
- 创建连续聚合视图以加速常用统计查询。

## 7. API 设计规范

### 7.1 RESTful 原则

- 使用名词复数表示资源。
- 使用 HTTP 方法表示操作类型。
- 对于复杂查询，使用 Query 参数进行过滤、排序、分页。
- 对于非资源型操作（如登录、发送邮件），使用动词，如 `/auth/login`。

### 7.2 请求与响应格式

- **请求体**：统一使用 JSON（`application/json`）。
- **响应体**：统一包裹在 `data` 字段中，错误时使用 `error` 字段。
  ```json
  {
    "code": 200,
    "message": "success",
    "data": { ... }
  }
  ```
  或错误时：
  ```json
  {
    "code": 400,
    "message": "Invalid parameter",
    "error": { ... }
  }
  ```
- **分页响应**：
  ```json
  {
    "data": [...],
    "pagination": {
      "page": 1,
      "page_size": 20,
      "total": 100
    }
  }
  ```

### 7.3 版本控制

- API 版本号放在 URL 路径中，如 `/api/v1/strategies`。
- 向后兼容的修改可在同一版本内进行，不兼容变更需升级版本号。

### 7.4 错误处理

- 使用标准的 HTTP 状态码（200, 400, 401, 403, 404, 500 等）。
- 业务错误码：自定义 5 位数字，前两位表示模块，后三位表示具体错误，如 `10001` 表示认证模块的用户不存在。
- 错误信息应简洁明了，便于前端展示。

## 8. 日志规范

### 8.1 日志级别

| 级别   | 使用场景                               |
| ------ | -------------------------------------- |
| DEBUG  | 开发调试信息，生产环境关闭             |
| INFO   | 关键业务流程开始/结束、状态变更        |
| WARNING| 潜在问题但不影响主流程，如重试、降级   |
| ERROR  | 异常错误，需人工介入                   |
| CRITICAL| 系统级故障，可能导致服务不可用         |

### 8.2 日志格式

- 结构化日志，JSON 格式，包含以下字段：
  - `timestamp`：ISO8601 时间
  - `level`：日志级别
  - `service`：服务名称（如 `api`, `worker`）
  - `trace_id`：链路追踪 ID
  - `module`：模块名
  - `message`：日志内容
  - `context`：额外结构化数据（如用户ID、请求路径）

示例：
```json
{
  "timestamp": "2026-02-23T10:15:30Z",
  "level": "INFO",
  "service": "api",
  "trace_id": "abc123",
  "module": "auth.login",
  "message": "User logged in successfully",
  "context": {"user_id": 123, "ip": "192.168.1.1"}
}
```

### 8.3 日志采集与存储

- 所有容器日志重定向到 stdout/stderr，由 Docker 收集。
- 使用 Promtail 采集容器日志并发送到 Loki。
- Loki 中日志保留 30 天，过期自动清理。
- 审计日志（如敏感操作）需额外存储到 Elasticsearch 或对象存储，保留 1 年以上。

## 9. 异常处理规范

### 9.1 异常分类

- **系统异常**：数据库连接失败、资源不足等，应记录 ERROR 日志，返回 500。
- **业务异常**：参数校验失败、资源不存在等，应返回 4xx 状态码，携带业务错误码。
- **未捕获异常**：全局异常处理器捕获，记录 ERROR 日志，返回 500。

### 9.2 全局异常处理

- FastAPI 中使用 `@app.exception_handler` 统一处理异常。
- 对于 HTTPException，直接返回对应状态码。
- 对于自定义业务异常，返回 400 并包含错误码。

### 9.3 业务异常

- 每个业务域定义自己的异常类，继承自 `DomainError`。
- 异常类应包含错误码、默认消息，并可携带额外数据。

```python
class UserNotFoundError(DomainError):
    code = 10001
    message = "User does not exist"
```

## 10. 安全规范

### 10.1 认证与授权

- **认证**：使用 OAuth2.0 + JWT（Bearer Token），Token 有效期短（如 30 分钟），刷新 Token 有效期长（7 天）。
- **授权**：基于 RBAC，每个请求验证用户角色与权限，使用依赖项注入。
- 密码存储：使用 bcrypt（`passlib`）加盐哈希。

### 10.2 数据加密

- 敏感数据（如身份证、手机号）在数据库中加密存储（AES-256），密钥由 KMS 管理。
- 传输加密：全站 HTTPS，Traefik 自动管理 Let's Encrypt 证书。
- 内部服务间通信可启用 mTLS（生产环境推荐）。

### 10.3 输入校验与防注入

- 所有输入使用 Pydantic 模型校验，类型、长度、格式严格限制。
- SQL 注入防御：使用 ORM 参数化查询，禁止拼接 SQL。
- 防止 XSS：前端框架自动转义，后端返回 JSON 不渲染 HTML。
- 防止 CSRF：使用 SameSite Cookie 和 CSRF Token（对于非 API 的浏览器请求）。

### 10.4 网络与传输安全

- 网关层（Traefik）启用速率限制（FastAPI-Limiter 可配合 Redis）。
- 内部服务不暴露公网，仅通过网关访问。
- 使用 CORS 策略限制可信域名。

### 10.5 审计与合规

- 所有敏感操作（登录、权限变更、数据删除）记录审计日志，包含时间、操作用户、操作内容、结果。
- 审计日志独立存储，不可篡改。
- 定期进行安全漏洞扫描和渗透测试。

## 11. 测试规范

### 11.1 单元测试

- 框架：pytest。
- 覆盖率目标：核心业务逻辑 > 85%，整体 > 70%。
- 测试文件位置：`tests/` 下对应模块，命名 `test_*.py`。
- 使用 pytest fixtures 管理测试数据。
- 对外部依赖（数据库、Redis）使用 mock 或 Testcontainers。

### 11.2 集成测试

- 测试 API 接口与数据库、消息队列的集成。
- 使用 Testcontainers 启动真实容器（PostgreSQL、Redis 等）进行测试。
- 测试数据在每次测试后自动清理（事务回滚或 truncate）。

### 11.3 端到端测试

- 前端使用 Cypress 或 Playwright 模拟用户操作。
- 测试关键业务流程（如创建策略、执行生产排程）。
- 在 CI 中运行，需部署完整环境（可用 docker-compose 拉起）。

### 11.4 性能测试

- 使用 Locust 或 JMeter 模拟高并发场景。
- 测试 API 吞吐量、响应时间、资源使用。
- 定期执行，与基准版本对比，防止性能退化。

## 12. CI/CD 规范

### 12.1 版本控制与分支管理

- 使用 Git，主干开发模式（Trunk-based）或 GitHub Flow。
- 主分支：`main`（生产就绪）。
- 功能分支：`feature/xxx`，基于 `main` 创建。
- 发布分支：`release/v*`（可选），用于最后测试与修复。
- 标签：`v*.*.*` 对应发布版本。

### 12.2 持续集成

- CI 服务器：GitHub Actions / GitLab CI。
- 每次 Push 到非 `main` 分支自动运行：
  - 代码格式化检查（black, prettier）
  - 类型检查（mypy, tsc）
  - 单元测试
  - 构建 Docker 镜像
- Push 到 `main` 或 `release/*` 额外运行集成测试、端到端测试。

### 12.3 持续部署

- 开发环境：自动部署 `main` 分支最新提交。
- 预发布环境：手动触发部署指定标签。
- 生产环境：手动触发部署，使用蓝绿发布或金丝雀发布。
- 镜像标签：使用 Git commit SHA 或语义版本号，确保可重现。

## 13. 部署规范

### 13.1 容器化规范

- 每个服务有独立的 Dockerfile，基于官方 slim 镜像。
- 多阶段构建：构建阶段使用完整镜像，运行阶段使用精简镜像。
- 容器以非 root 用户运行。
- 镜像标签包含版本号和环境信息（如 `v1.2.3`）。

### 13.2 编排与调度

- 开发/测试环境：Docker Compose。
- 生产环境：Kubernetes（推荐）或 Docker Swarm。
- 所有服务应定义资源请求/限制（CPU、内存）。
- 使用 ConfigMap 和 Secret 管理配置。

### 13.3 环境配置管理

- 环境变量通过 `.env` 文件（开发）或 Kubernetes Secret（生产）注入。
- 敏感信息禁止提交到代码库，使用 Vault 或云 KMS 管理。

### 13.4 健康检查与就绪探针

- 每个服务必须实现 `/health` 端点，返回 200 表示健康。
- 在 Kubernetes 中配置 livenessProbe 和 readinessProbe。
- 依赖的服务（数据库、Redis）应通过 healthcheck 检测。

## 14. 配置管理规范

### 14.1 配置分层

- 默认配置：代码库中的 `config.py` 或 `default.toml`。
- 环境特定配置：通过环境变量覆盖。
- 动态配置：使用配置中心（Apollo、Nacos）实时更新。

### 14.2 敏感信息管理

- 数据库密码、API 密钥等必须存储在环境变量或 Kubernetes Secret 中，禁止硬编码。
- 生产环境使用 Vault 动态生成数据库凭证，实现临时权限。

### 14.3 动态配置

- 考虑引入配置中心（如 Apollo）管理业务开关、阈值等，支持热加载。
- 配置变更应记录审计日志。

## 15. 依赖管理规范

### 15.1 后端依赖

- 使用 `pip` 和 `requirements.txt` 管理，按环境拆分。
- 所有依赖必须固定版本（`pip freeze > requirements.txt`）。
- 定期使用 `pip-audit` 或 `safety` 检查安全漏洞。

### 15.2 前端依赖

- 使用 `package.json` 锁定版本，配合 `package-lock.json`。
- 依赖更新需经过测试，避免引入不兼容变更。
- 使用 `npm audit` 定期检查漏洞。

## 16. 监控与告警规范

### 16.1 指标采集

- 应用层：使用 Prometheus-client 暴露 `/metrics` 端点，包括：
  - HTTP 请求总数、错误数、延迟（分路径、方法、状态码）
  - 数据库连接池状态
  - Celery 任务数量、执行时间
  - 业务指标（策略执行次数、成功率）
- 系统层：cAdvisor 或 node_exporter 采集容器/节点指标。

### 16.2 告警规则

- 告警规则定义在 Prometheus 中，分级：
  - **P0（严重）**：服务宕机、大面积 5xx 错误，立即通知值班人员。
  - **P1（警告）**：响应时间升高、队列积压，邮件或钉钉通知。
  - **P2（信息）**：资源使用接近阈值，仅记录。
- 告警通过 Alertmanager 发送到钉钉、企业微信或邮件。

### 16.3 日志与追踪

- 所有服务日志必须包含 `trace_id`，用于关联请求全链路。
- 使用 Tempo 收集链路追踪数据，采样率 10%（可配置）。
- 在 Grafana 中集成 Loki 和 Tempo 数据源，实现日志与追踪联动。

## 17. 备份与恢复规范

- **数据库备份**：
  - PostgreSQL/TimescaleDB：每日全量备份 + 每小时 WAL 归档。
  - 备份保留 30 天，使用 pgBackRest 管理。
  - 备份文件加密后存储到 MinIO 或云对象存储。
- **对象存储备份**：
  - MinIO 启用版本控制，并配置跨区域复制到另一存储桶。
- **配置文件备份**：
  - 所有配置（包括 Kubernetes 清单）应存储在 Git 仓库中。
- **恢复演练**：每季度至少进行一次完整恢复演练，验证 RPO/RTO。

## 18. 文档规范

- **架构文档**：`docs/architecture.md`，包含系统设计、技术选型、数据流。
- **API 文档**：自动生成（FastAPI 内置 Swagger UI 和 ReDoc），补充业务说明。
- **部署文档**：`docs/deployment.md`，包含环境要求、部署步骤、配置说明。
- **开发指南**：`docs/development.md`，包含环境搭建、编码规范、测试运行。
- **用户手册**：提供给最终用户的系统使用说明。
- **代码注释**：复杂逻辑必须添加注释，关键类和函数需有文档字符串。

## 19. AI 辅助开发规范（可选）

若项目使用 AI 辅助编程（如项目文档中提到的 `ai-agents/` 结构），应遵循：

- 角色定义文件（`.md`）存放于 `ai-agents/agents/` 下，按职能分类。
- 技能定义文件（`.md`）存放于 `ai-agents/skills/`，描述 AI 可执行的具体任务。
- 角色与技能的映射关系通过 JSON 文件定义（`mappings/`）。
- AI 生成代码需人工 review 并遵循本规范所有要求。
- 定期评估 AI 辅助效率，更新技能库。

---

**文档维护**：MES 系统架构组  
**联系方式**：[363679401@qq.com](mailto:363679401@qq.com)  
**最后更新**：2026-02-23