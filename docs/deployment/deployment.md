# Axiom MES 智能生产系统 - 部署文档

## 1. 环境要求

### 1.1 硬件要求

| 环境 | CPU | 内存 | 存储 | 网络 |
|------|-----|------|------|------|
| 开发环境 | 2核 | 4GB | 50GB | 100Mbps |
| 测试环境 | 4核 | 8GB | 100GB | 1Gbps |
| 生产环境 | 8核+ | 16GB+ | 200GB+ | 1Gbps+ |

### 1.2 软件要求

| 组件 | 版本 | 用途 |
|------|------|------|
| Docker | 29.2.1+ | 容器化运行时 |
| Docker Compose | 5.0.2+ | 容器编排 |
| Git | 2.40+ | 版本控制 |
| Python | 3.14（仅开发） | 开发环境 |
| Node.js | 24.13.1（仅开发） | 前端开发 |

## 2. 部署步骤

### 2.1 克隆代码仓库

```bash
git clone https://github.com/Amanda-Gill/AxiomMES.git
cd AxiomMES
```

### 2.2 配置环境变量

1. 复制环境变量示例文件

```bash
# 后端环境变量
cp fastapi-project/.env.example fastapi-project/.env

# 前端环境变量（如需）
# cp frontend/.env.example frontend/.env
```

2. 编辑环境变量文件

根据实际情况修改 `.env` 文件中的配置项，主要包括：
- 数据库连接信息
- Redis 连接信息
- RabbitMQ 连接信息
- JWT 密钥
- 其他服务配置

### 2.3 部署方式

#### 2.3.1 Docker Compose 部署（开发/测试环境）

1. 创建 Docker Compose 文件

在项目根目录创建 `docker-compose.yml` 文件：

```yaml
version: '3.8'

services:
  # 数据库服务
  postgres:
    image: postgres:18-alpine
    container_name: axiom-postgres
    environment:
      POSTGRES_DB: mes_db
      POSTGRES_USER: mes_user
      POSTGRES_PASSWORD: mes_password
    volumes:
      - postgres_data:/var/lib/postgresql/data
    ports:
      - "5432:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mes_user -d mes_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 时序数据库扩展
  timescaledb:
    image: timescale/timescaledb:2.25.1-pg18-alpine
    container_name: axiom-timescaledb
    environment:
      POSTGRES_DB: mes_db
      POSTGRES_USER: mes_user
      POSTGRES_PASSWORD: mes_password
    volumes:
      - timescaledb_data:/var/lib/postgresql/data
    ports:
      - "5433:5432"
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U mes_user -d mes_db"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Redis 服务
  redis:
    image: redis:8.6.0-alpine
    container_name: axiom-redis
    volumes:
      - redis_data:/data
    ports:
      - "6379:6379"
    healthcheck:
      test: ["CMD", "redis-cli", "ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  # RabbitMQ 服务
  rabbitmq:
    image: rabbitmq:3.13-management
    container_name: axiom-rabbitmq
    environment:
      RABBITMQ_DEFAULT_USER: mes_user
      RABBITMQ_DEFAULT_PASS: mes_password
    volumes:
      - rabbitmq_data:/var/lib/rabbitmq
    ports:
      - "5672:5672"  # AMQP 端口
      - "15672:15672"  # 管理界面端口
    healthcheck:
      test: ["CMD", "rabbitmqctl", "status"]
      interval: 5s
      timeout: 5s
      retries: 5

  # MinIO 服务（对象存储）
  minio:
    image: minio/minio:RELEASE.2025-09-07T16-13-09Z
    container_name: axiom-minio
    environment:
      MINIO_ROOT_USER: minioadmin
      MINIO_ROOT_PASSWORD: minioadmin
    volumes:
      - minio_data:/data
    ports:
      - "9000:9000"  # API 端口
      - "9001:9001"  # 管理界面端口
    command: server /data --console-address ":9001"
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:9000/minio/health/live"]
      interval: 5s
      timeout: 5s
      retries: 5

  # 后端 API 服务
  backend:
    image: python:3.14-slim
    container_name: axiom-backend
    working_dir: /app/fastapi-project
    volumes:
      - ./fastapi-project:/app/fastapi-project
    ports:
      - "8000:8000"
    depends_on:
      postgres: { condition: service_healthy }
      redis: { condition: service_healthy }
      rabbitmq: { condition: service_healthy }
    command: >
      bash -c "pip install -r requirements/base.txt && \
              alembic upgrade head && \
              uvicorn src.main:app --host 0.0.0.0 --port 8000"
    environment:
      - ENVIRONMENT=development
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:8000/health"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Celery Worker 服务
  celery-worker:
    image: python:3.14-slim
    container_name: axiom-celery-worker
    working_dir: /app/fastapi-project
    volumes:
      - ./fastapi-project:/app/fastapi-project
    depends_on:
      backend: { condition: service_healthy }
      redis: { condition: service_healthy }
      rabbitmq: { condition: service_healthy }
    command: >
      bash -c "pip install -r requirements/base.txt && \
              celery -A src.tasks.celery_app worker --loglevel=info"
    environment:
      - ENVIRONMENT=development

  # Celery Beat 服务
  celery-beat:
    image: python:3.14-slim
    container_name: axiom-celery-beat
    working_dir: /app/fastapi-project
    volumes:
      - ./fastapi-project:/app/fastapi-project
    depends_on:
      backend: { condition: service_healthy }
      redis: { condition: service_healthy }
      rabbitmq: { condition: service_healthy }
    command: >
      bash -c "pip install -r requirements/base.txt && \
              celery -A src.tasks.celery_app beat --loglevel=info"
    environment:
      - ENVIRONMENT=development

  # Traefik 网关
  traefik:
    image: traefik:v3.6.8
    container_name: axiom-traefik
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock:ro
      - ./traefik.yml:/etc/traefik/traefik.yml
      - ./traefik_dynamic.yml:/etc/traefik/dynamic.yml
    ports:
      - "80:80"  # HTTP 端口
      - "443:443"  # HTTPS 端口
      - "8080:8080"  # 管理界面端口
    healthcheck:
      test: ["CMD", "traefik", "healthcheck", "--ping"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Prometheus 监控
  prometheus:
    image: prom/prometheus:v3.9.1
    container_name: axiom-prometheus
    volumes:
      - ./prometheus/prometheus.yml:/etc/prometheus/prometheus.yml
      - prometheus_data:/prometheus
    ports:
      - "9090:9090"
    healthcheck:
      test: ["CMD", "wget", "--no-verbose", "--tries=1", "--spider", "http://localhost:9090/-/healthy"]
      interval: 5s
      timeout: 5s
      retries: 5

  # Grafana 可视化
  grafana:
    image: grafana/grafana:12.4.0
    container_name: axiom-grafana
    volumes:
      - grafana_data:/var/lib/grafana
    ports:
      - "3000:3000"
    depends_on:
      prometheus: { condition: service_healthy }
    healthcheck:
      test: ["CMD", "curl", "-f", "http://localhost:3000/api/health"]
      interval: 5s
      timeout: 5s
      retries: 5

volumes:
  postgres_data:
  timescaledb_data:
  redis_data:
  rabbitmq_data:
  minio_data:
  prometheus_data:
  grafana_data:
```

2. 启动服务

```bash
docker compose up -d
```

3. 验证服务

```bash
docker compose ps
```

#### 2.3.2 Kubernetes 部署（生产环境）

1. 准备 Kubernetes 集群

确保已创建 Kubernetes 集群（1.30+），并配置好 kubectl。

2. 创建命名空间

```bash
kubectl create namespace axiom-mes
```

3. 部署基础服务

```bash
# 部署 PostgreSQL 和 TimescaleDB
kubectl apply -f k8s/postgres-timescaledb.yaml -n axiom-mes

# 部署 Redis
kubectl apply -f k8s/redis.yaml -n axiom-mes

# 部署 RabbitMQ
kubectl apply -f k8s/rabbitmq.yaml -n axiom-mes

# 部署 MinIO
kubectl apply -f k8s/minio.yaml -n axiom-mes
```

4. 部署应用服务

```bash
# 部署后端 API
kubectl apply -f k8s/backend.yaml -n axiom-mes

# 部署 Celery Worker
kubectl apply -f k8s/celery-worker.yaml -n axiom-mes

# 部署 Celery Beat
kubectl apply -f k8s/celery-beat.yaml -n axiom-mes

# 部署 Traefik 网关
kubectl apply -f k8s/traefik.yaml -n axiom-mes
```

5. 部署监控服务

```bash
# 部署 Prometheus
kubectl apply -f k8s/prometheus.yaml -n axiom-mes

# 部署 Grafana
kubectl apply -f k8s/grafana.yaml -n axiom-mes

# 部署 Loki 和 Tempo
kubectl apply -f k8s/loki-tempo.yaml -n axiom-mes
```

## 3. 配置说明

### 3.1 环境变量配置

#### 3.1.1 后端环境变量（fastapi-project/.env）

| 变量名 | 描述 | 默认值 | 示例 |
|--------|------|--------|------|
| `ENVIRONMENT` | 运行环境 | `development` | `production` |
| `DATABASE_URL` | 数据库连接 URL | - | `postgresql://user:password@localhost:5432/mes_db` |
| `REDIS_URL` | Redis 连接 URL | - | `redis://localhost:6379/0` |
| `RABBITMQ_URL` | RabbitMQ 连接 URL | - | `amqp://user:password@localhost:5672/` |
| `MINIO_ENDPOINT` | MinIO 端点 | - | `localhost:9000` |
| `MINIO_ACCESS_KEY` | MinIO 访问密钥 | - | `minioadmin` |
| `MINIO_SECRET_KEY` | MinIO 秘密密钥 | - | `minioadmin` |
| `MINIO_SECURE` | 是否使用 HTTPS | `false` | `true` |
| `SECRET_KEY` | JWT 密钥 | - | `your-secret-key-here` |
| `ALGORITHM` | JWT 算法 | `HS256` | `RS256` |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | 访问令牌过期时间（分钟） | `30` | `60` |
| `REFRESH_TOKEN_EXPIRE_DAYS` | 刷新令牌过期时间（天） | `7` | `30` |
| `CORS_ORIGINS` | CORS 允许的源 | `["*"]` | `["https://example.com"]` |

#### 3.1.2 前端环境变量（如需）

| 变量名 | 描述 | 默认值 | 示例 |
|--------|------|--------|------|
| `VITE_API_BASE_URL` | API 基础 URL | - | `https://api.example.com` |
| `VITE_APP_TITLE` | 应用标题 | `Axiom MES` | - |
| `VITE_APP_VERSION` | 应用版本 | - | `1.0.0` |
| `VITE_ENABLE_MOCK` | 是否启用 Mock 数据 | `false` | `true` |

### 3.2 配置文件说明

#### 3.2.1 后端配置

1. `fastapi-project/src/core/config.py` - 核心配置文件，使用 Pydantic Settings 管理
2. `fastapi-project/alembic.ini` - 数据库迁移配置
3. `fastapi-project/celery_config.py` - Celery 配置
4. `fastapi-project/prefect_config.py` - Prefect 配置
5. `fastapi-project/logging.ini` - 日志配置

#### 3.2.2 监控配置

1. `prometheus/prometheus.yml` - Prometheus 采集配置
2. `grafana/datasources/` - Grafana 数据源配置
3. `grafana/dashboards/` - Grafana 仪表盘配置
4. `loki/loki.yml` - Loki 配置
5. `tempo/tempo.yml` - Tempo 配置

#### 3.2.3 网关配置

1. `traefik.yml` - Traefik 静态配置
2. `traefik_dynamic.yml` - Traefik 动态配置

## 4. 服务访问

### 4.1 开发环境访问地址

| 服务 | 访问地址 | 用户名/密码 |
|------|----------|-------------|
| 后端 API | http://localhost:8000 | - |
| API 文档（Swagger） | http://localhost:8000/docs | - |
| API 文档（ReDoc） | http://localhost:8000/redoc | - |
| Traefik 管理 | http://localhost:8080 | - |
| Prometheus | http://localhost:9090 | - |
| Grafana | http://localhost:3000 | admin/admin |
| RabbitMQ 管理 | http://localhost:15672 | mes_user/mes_password |
| MinIO 管理 | http://localhost:9001 | minioadmin/minioadmin |

### 4.2 生产环境访问

根据实际域名配置访问，建议：
- API: `https://api.axiom-mes.example.com`
- 前端应用: `https://axiom-mes.example.com`
- 监控: `https://monitoring.axiom-mes.example.com`

## 5. 常见问题与故障排查

### 5.1 数据库连接失败

1. 检查数据库服务是否正常运行
2. 检查数据库连接字符串是否正确
3. 检查数据库用户权限是否正确

### 5.2 API 服务启动失败

1. 检查依赖是否安装完整
2. 检查数据库迁移是否成功
3. 检查日志输出，查看具体错误信息

### 5.3 监控服务无法访问

1. 检查 Prometheus 采集配置是否正确
2. 检查 Grafana 数据源配置是否正确
3. 检查网络防火墙设置

### 5.4 任务队列问题

1. 检查 RabbitMQ 服务是否正常
2. 检查 Celery Worker 是否正在运行
3. 检查任务队列是否有积压

## 6. 备份与恢复

### 6.1 数据库备份

```bash
# 备份 PostgreSQL 数据库
docker exec -t axiom-postgres pg_dump -U mes_user mes_db > mes_db_backup_$(date +%Y%m%d_%H%M%S).sql

# 备份 TimescaleDB 时序数据
docker exec -t axiom-timescaledb pg_dump -U mes_user mes_db -t "timescale_*" > timescale_backup_$(date +%Y%m%d_%H%M%S).sql
```

### 6.2 数据库恢复

```bash
# 恢复 PostgreSQL 数据库
docker exec -i axiom-postgres psql -U mes_user mes_db < mes_db_backup.sql

# 恢复 TimescaleDB 时序数据
docker exec -i axiom-timescaledb psql -U mes_user mes_db < timescale_backup.sql
```

### 6.3 配置备份

建议将所有配置文件存入 Git 仓库进行版本控制。

## 7. 升级与更新

### 7.1 版本升级步骤

1. 备份当前数据和配置
2. 拉取最新代码
3. 更新依赖
4. 执行数据库迁移
5. 重启服务
6. 验证服务正常运行

### 7.2 滚动更新（生产环境）

在 Kubernetes 环境中，建议使用滚动更新策略：

```bash
# 更新后端 API 服务
kubectl set image deployment/axiom-backend backend=your-registry/axiom-backend:v1.1.0 -n axiom-mes

# 检查更新状态
kubectl rollout status deployment/axiom-backend -n axiom-mes
```

## 8. 性能优化建议

1. **数据库优化**：
   - 定期清理过期数据
   - 优化查询索引
   - 对大表进行分区

2. **缓存优化**：
   - 合理设置缓存过期时间
   - 对热点数据进行缓存预热
   - 使用 Redis 集群提高缓存性能

3. **应用优化**：
   - 启用 Gzip 压缩
   - 优化 API 响应时间
   - 使用异步处理提高并发能力

4. **监控与调优**：
   - 定期查看监控指标
   - 分析性能瓶颈
   - 调整资源配置

## 9. 安全建议

1. **网络安全**：
   - 启用 HTTPS
   - 配置防火墙规则
   - 限制访问 IP

2. **认证授权**：
   - 使用强密码策略
   - 启用 MFA
   - 定期轮换密钥

3. **数据安全**：
   - 对敏感数据进行加密存储
   - 定期备份数据
   - 实施数据访问审计

4. **容器安全**：
   - 使用官方镜像
   - 定期更新镜像
   - 实施容器安全扫描

## 10. 联系方式

如有部署相关问题，请联系：
- 技术支持邮箱：support@axiom-mes.com
- 技术支持电话：+86-400-123-4567

---

**文档版本**：1.0
**最后更新**：2026-03-10
**适用范围**：Axiom MES 智能生产系统所有环境部署
**状态**：正式发布
