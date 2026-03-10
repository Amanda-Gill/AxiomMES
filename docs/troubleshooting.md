# Axiom MES 智能生产系统 - 故障排查指南

**文档版本**：1.0  
**最后更新**：2026-03-07  
**适用范围**：Axiom MES 智能生产系统运维和开发人员  
**状态**：正式发布

---

## 目录

1. [快速诊断](#1-快速诊断)
2. [网络连接问题](#2-网络连接问题)
3. [数据库问题](#3-数据库问题)
4. [API服务问题](#4-api服务问题)
5. [缓存和消息队列问题](#5-缓存和消息队列问题)
6. [部署和容器问题](#6-部署和容器问题)
7. [性能问题](#7-性能问题)
8. [监控和日志](#8-监控和日志)
9. [常见错误代码](#9-常见错误代码)
10. [联系支持](#10-联系支持)

---

## 1. 快速诊断

### 1.1 健康检查

首先检查各服务的健康状态：

```bash
# 检查API服务健康状态
curl http://localhost:8000/health

# 检查数据库连接
docker exec -it mes-postgres psql -U mes_user -d mes_db -c "SELECT 1"

# 检查Redis连接
docker exec -it mes-redis redis-cli ping

# 检查RabbitMQ状态
docker exec -it mes-rabbitmq rabbitmqctl status
```

### 1.2 服务状态检查

```bash
# 查看所有容器状态
docker-compose ps

# 查看容器日志
docker-compose logs [service_name]

# 查看资源使用情况
docker stats
```

---

## 2. 网络连接问题

### 2.1 无法访问GitHub

**症状**：git push失败，提示连接被重置或超时

**可能原因**：
- 网络代理配置问题
- 防火墙阻止443端口
- DNS解析问题

**解决方案**：

1. 检查代理设置：
```bash
git config --get http.proxy
git config --get https.proxy
```

2. 如需配置代理：
```bash
git config --global http.proxy http://proxy.example.com:8080
git config --global https.proxy https://proxy.example.com:8080
```

3. 清除代理设置：
```bash
git config --global --unset http.proxy
git config --global --unset https.proxy
```

### 2.2 服务间网络不通

**症状**：服务无法相互通信，API调用失败

**解决方案**：

1. 检查Docker网络：
```bash
docker network ls
docker network inspect [network_name]
```

2. 检查服务是否在同一网络：
```bash
docker-compose config
```

3. 重启网络：
```bash
docker-compose down
docker-compose up -d
```

---

## 3. 数据库问题

### 3.1 PostgreSQL连接失败

**错误信息**：`psycopg2.OperationalError: could not connect to server`

**解决方案**：

1. 检查数据库服务状态：
```bash
docker-compose ps postgres
```

2. 检查数据库日志：
```bash
docker-compose logs postgres
```

3. 验证连接参数：
```bash
# 检查.env文件中的数据库配置
cat .env | grep DB_
```

4. 重启数据库：
```bash
docker-compose restart postgres
```

### 3.2 数据库连接池耗尽

**错误信息**：`connection pool exhausted`

**解决方案**：

1. 检查当前连接数：
```sql
SELECT count(*) FROM pg_stat_activity;
```

2. 查看连接池配置：
```python
# 检查core/database.py中的pool_size和max_overflow设置
```

3. 调整连接池大小：
```python
engine = create_engine(
    DATABASE_URL,
    pool_size=20,  # 增加连接池大小
    max_overflow=10,
    pool_timeout=30
)
```

### 3.3 TimescaleDB查询慢

**症状**：时序数据查询响应时间长

**解决方案**：

1. 检查超表分区：
```sql
SELECT * FROM timescaledb_information.hypertables;
```

2. 创建连续聚合视图：
```sql
CREATE MATERIALIZED VIEW metrics_hourly
WITH (timescaledb.continuous) AS
SELECT time_bucket('1 hour', time) AS bucket,
       avg(value) AS avg_value
FROM metrics
GROUP BY bucket;
```

3. 启用压缩：
```sql
ALTER TABLE metrics SET (
  timescaledb.compress,
  timescaledb.compress_segmentby = 'time'
);
```

---

## 4. API服务问题

### 4.1 FastAPI启动失败

**错误信息**：`ModuleNotFoundError` 或 `ImportError`

**解决方案**：

1. 检查依赖是否安装：
```bash
pip list | grep [module_name]
```

2. 安装缺失的依赖：
```bash
pip install -r requirements/base.txt
```

3. 检查Python版本：
```bash
python --version  # 应该是3.14
```

### 4.2 API响应慢

**症状**：接口响应时间超过预期

**解决方案**：

1. 启用性能分析：
```python
# 在main.py中启用性能日志
from prometheus_client import Summary
request_time = Summary('request_processing_seconds', 'Time spent processing request')
```

2. 检查慢查询：
```bash
# 查看Prometheus指标
curl http://localhost:9090/api/v1/query?query=histogram_quantile(0.95,request_processing_seconds)
```

3. 优化数据库查询：
- 添加适当的索引
- 使用分页避免大量数据加载
- 使用缓存减少数据库访问

### 4.3 CORS错误

**错误信息**：浏览器控制台显示CORS错误

**解决方案**：

1. 检查CORS配置：
```python
# 在main.py中检查CORSMiddleware配置
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # 生产环境应指定具体域名
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)
```

2. 检查Traefik配置：
```yaml
# 在docker-compose.yml中检查Traefik标签
labels:
  - "traefik.http.middlewares.mes-api.headers.accesscontrolallowmethods=GET,POST,PUT,DELETE,OPTIONS"
```

---

## 5. 缓存和消息队列问题

### 5.1 Redis连接失败

**错误信息**：`redis.exceptions.ConnectionError`

**解决方案**：

1. 检查Redis服务：
```bash
docker-compose ps redis
docker-compose logs redis
```

2. 测试Redis连接：
```bash
docker exec -it mes-redis redis-cli ping
# 应该返回 PONG
```

3. 检查Redis配置：
```bash
# 检查.env文件中的Redis URL
cat .env | grep REDIS_URL
```

### 5.2 RabbitMQ消息堆积

**症状**：消息队列中消息数量持续增长

**解决方案**：

1. 查看队列状态：
```bash
docker exec -it mes-rabbitmq rabbitmqctl list_queues
```

2. 查看消费者状态：
```bash
docker exec -it mes-rabbitmq rabbitmqctl list_consumers
```

3. 增加消费者数量：
```python
# 在celery_config.py中增加worker并发数
worker_concurrency = 4
```

4. 检查任务执行时间：
```python
# 查看Celery监控面板
# http://localhost:5555
```

---

## 6. 部署和容器问题

### 6.1 Docker容器启动失败

**错误信息**：`Container exited with code 1`

**解决方案**：

1. 查看容器日志：
```bash
docker-compose logs [service_name]
```

2. 检查环境变量：
```bash
docker-compose config
```

3. 检查端口冲突：
```bash
netstat -ano | findstr :[port_number]
```

4. 重建容器：
```bash
docker-compose down
docker-compose up -d --force-recreate
```

### 6.2 磁盘空间不足

**症状**：容器无法启动，提示磁盘空间不足

**解决方案**：

1. 检查磁盘使用情况：
```bash
docker system df
```

2. 清理未使用的镜像：
```bash
docker image prune -a
```

3. 清理未使用的容器：
```bash
docker container prune
```

4. 清理未使用的卷：
```bash
docker volume prune
```

### 6.3 权限问题

**错误信息**：`Permission denied`

**解决方案**：

1. 检查文件权限：
```bash
ls -la [file_or_directory]
```

2. 修改权限：
```bash
chmod 755 [directory]
chmod 644 [file]
```

3. 检查Docker用户：
```bash
# 确保容器以非root用户运行
# 在Dockerfile中添加
USER appuser
```

---

## 7. 性能问题

### 7.1 CPU使用率高

**症状**：服务CPU使用率持续超过80%

**解决方案**：

1. 查看进程资源使用：
```bash
docker stats
```

2. 分析CPU密集型任务：
```python
# 使用cProfile分析性能
import cProfile
import pstats

pr = cProfile.Profile()
pr.enable()
# 执行代码
pr.disable()
stats = pstats.Stats(pr)
stats.sort_stats('cumulative')
stats.print_stats(10)
```

3. 优化算法和查询：
- 使用缓存减少计算
- 优化数据库查询
- 使用异步处理

### 7.2 内存泄漏

**症状**：内存使用持续增长，最终OOM

**解决方案**：

1. 监控内存使用：
```bash
docker stats --no-stream
```

2. 使用内存分析工具：
```python
# 使用memory_profiler
pip install memory_profiler
python -m memory_profiler script.py
```

3. 检查常见内存泄漏原因：
- 未关闭的数据库连接
- 未释放的文件句柄
- 全局变量累积数据
- 循环引用

---

## 8. 监控和日志

### 8.1 查看日志

```bash
# 查看所有服务日志
docker-compose logs -f

# 查看特定服务日志
docker-compose logs -f [service_name]

# 查看最近100行日志
docker-compose logs --tail=100 [service_name]
```

### 8.2 查看Prometheus指标

访问Grafana仪表板：`http://localhost:3000`

常用查询：
- API请求率：`rate(http_requests_total[5m])`
- API错误率：`rate(http_requests_total{status=~"5.."}[5m])`
- 数据库连接数：`pg_stat_database_numbackends`
- Redis内存使用：`redis_memory_used_bytes`

### 8.3 查看Loki日志

访问Loki查询界面：`http://localhost:3100`

常用查询：
- 错误日志：`{level="ERROR"}`
- 特定服务日志：`{service="api"}`
- 时间范围查询：`{level="ERROR"} | line_format "{{.timestamp}} {{.message}}"`

---

## 9. 常见错误代码

| 错误代码 | 描述 | 解决方案 |
|---------|------|---------|
| `10001` | 用户不存在 | 检查用户ID是否正确，确认用户未被删除 |
| `10002` | 密码错误 | 提示用户重新输入密码，检查是否被锁定 |
| `20001` | 策略不存在 | 检查策略ID，确认策略状态 |
| `20002` | 策略执行失败 | 查看Celery日志，检查规则引擎配置 |
| `30001` | 数据库连接失败 | 检查数据库服务状态和连接参数 |
| `30002` | 数据库查询超时 | 优化查询语句，添加索引 |
| `40001` | Redis连接失败 | 检查Redis服务状态 |
| `40002` | 缓存键不存在 | 检查缓存键格式，确认缓存是否过期 |
| `50001` | RabbitMQ连接失败 | 检查RabbitMQ服务状态 |
| `50002` | 消息发送失败 | 检查队列配置，确认消息格式正确 |

---

## 10. 联系支持

### 10.1 收集诊断信息

在联系支持之前，请收集以下信息：

1. 系统信息：
```bash
docker --version
docker-compose --version
python --version
```

2. 服务状态：
```bash
docker-compose ps
docker-compose logs --tail=50
```

3. 配置信息：
```bash
# 脱敏后的.env文件内容
cat .env | sed 's/PASSWORD=.*/PASSWORD=***/'
```

4. 错误日志：
```bash
# 最近的错误日志
docker-compose logs | grep ERROR
```

### 10.2 联系方式

- **技术支持邮箱**：363679401@qq.com
- **GitHub Issues**：https://github.com/Amanda-Gill/AxiomMES/issues
- **文档地址**：https://github.com/Amanda-Gill/AxiomMES/tree/main/docs

### 10.3 紧急联系

对于生产环境的紧急问题，请：
1. 优先检查本故障排查指南
2. 查看监控仪表板确认影响范围
3. 收集完整的错误日志和诊断信息
4. 通过邮件或GitHub Issues提交问题

---

**文档维护**：Axiom MES 运维团队  
**联系方式**：363679401@qq.com  
**更新记录**：  
- v1.0，2026-03-07，初始版本发布。