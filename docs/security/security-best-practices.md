# Axiom MES 智能生产系统 - 安全最佳实践文档

**文档版本**：1.0  
**最后更新**：2026-03-10  
**适用范围**：Axiom MES 智能生产系统安全最佳实践  
**状态**：正式发布  

---

## 目录

1. [安全开发最佳实践](#1-安全开发最佳实践)
2. [安全配置最佳实践](#2-安全配置最佳实践)
3. [安全运维最佳实践](#3-安全运维最佳实践)
4. [安全审计最佳实践](#4-安全审计最佳实践)
5. [应急响应最佳实践](#5-应急响应最佳实践)
6. [安全培训与意识](#6-安全培训与意识)
7. [安全合规检查清单](#7-安全合规检查清单)

---

## 1. 安全开发最佳实践

### 1.1 输入验证

#### 1.1.1 输入验证原则

- **白名单验证**：只接受预期格式的输入
- **类型检查**：严格检查数据类型
- **长度限制**：限制输入字符串长度
- **范围检查**：验证数值范围
- **编码处理**：正确处理字符编码

#### 1.1.2 Pydantic 输入验证示例

```python
from pydantic import BaseModel, Field, validator, EmailStr
from typing import List, Optional
from datetime import datetime
import re

class UserCreate(BaseModel):
    username: str = Field(..., min_length=3, max_length=50, regex="^[a-zA-Z0-9_]+$")
    email: EmailStr
    password: str = Field(..., min_length=8, max_length=128)
    phone: Optional[str] = Field(None, regex="^1[3-9]\\d{9}$")
    
    @validator('password')
    def validate_password(cls, v):
        if not re.search(r'[A-Z]', v):
            raise ValueError('密码必须包含大写字母')
        if not re.search(r'[a-z]', v):
            raise ValueError('密码必须包含小写字母')
        if not re.search(r'\d', v):
            raise ValueError('密码必须包含数字')
        if not re.search(r'[!@#$%^&*(),.?":{}|<>]', v):
            raise ValueError('密码必须包含特殊字符')
        return v

class StrategyCreate(BaseModel):
    name: str = Field(..., min_length=1, max_length=100)
    description: Optional[str] = Field(None, max_length=500)
    priority: int = Field(..., ge=1, le=10)
    tags: List[str] = Field(default_factory=list, max_items=10)
    
    @validator('tags', each_item=True)
    def validate_tag(cls, v):
        if not re.match(r'^[a-zA-Z0-9_-]+$', v):
            raise ValueError('标签只能包含字母、数字、下划线和连字符')
        return v
```

### 1.2 SQL 注入防护

#### 1.2.1 使用 ORM 参数化查询

```python
from sqlalchemy.orm import Session
from sqlalchemy import select
from models import User

def get_user_by_username(db: Session, username: str) -> User:
    stmt = select(User).where(User.username == username)
    result = db.execute(stmt)
    return result.scalar_one_or_none()

def search_users(db: Session, keyword: str) -> list:
    stmt = select(User).where(User.username.ilike(f"%{keyword}%"))
    result = db.execute(stmt)
    return result.scalars().all()
```

#### 1.2.2 禁止拼接 SQL

```python
# 错误示例 - 禁止使用
def unsafe_query(db: Session, username: str):
    query = f"SELECT * FROM users WHERE username = '{username}'"
    return db.execute(query)

# 正确示例 - 使用参数化查询
def safe_query(db: Session, username: str):
    stmt = select(User).where(User.username == username)
    return db.execute(stmt).scalar_one_or_none()
```

### 1.3 XSS 防护

#### 1.3.1 输出编码

```python
from html import escape
from typing import Any

def sanitize_output(data: Any) -> str:
    if isinstance(data, str):
        return escape(data)
    return str(data)

def sanitize_dict(data: dict) -> dict:
    return {k: sanitize_output(v) if isinstance(v, str) else v for k, v in data.items()}
```

#### 1.3.2 Content Security Policy

```python
from fastapi import FastAPI
from starlette.middleware.base import BaseHTTPMiddleware

app = FastAPI()

class SecurityHeadersMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request, call_next):
        response = await call_next(request)
        
        response.headers["Content-Security-Policy"] = (
            "default-src 'self'; "
            "script-src 'self' 'unsafe-inline' 'unsafe-eval'; "
            "style-src 'self' 'unsafe-inline'; "
            "img-src 'self' data: https:; "
            "font-src 'self'; "
            "connect-src 'self'; "
            "frame-ancestors 'none';"
        )
        response.headers["X-Content-Type-Options"] = "nosniff"
        response.headers["X-Frame-Options"] = "DENY"
        response.headers["X-XSS-Protection"] = "1; mode=block"
        
        return response

app.add_middleware(SecurityHeadersMiddleware)
```

### 1.4 CSRF 防护

```python
from fastapi import FastAPI, Request, HTTPException, Depends
from fastapi.security import HTTPBearer
import secrets
import hmac

app = FastAPI()
security = HTTPBearer()

CSRF_SECRET = "your-csrf-secret"

def generate_csrf_token() -> str:
    return secrets.token_urlsafe(32)

def verify_csrf_token(token: str, expected: str) -> bool:
    return hmac.compare_digest(token, expected)

@app.post("/api/protected")
async protected_endpoint(
    request: Request,
    csrf_token: str = Depends(lambda r: r.headers.get("X-CSRF-Token"))
):
    session_csrf = request.session.get("csrf_token")
    
    if not session_csrf or not verify_csrf_token(csrf_token, session_csrf):
        raise HTTPException(status_code=403, detail="Invalid CSRF token")
    
    return {"status": "success"}
```

### 1.5 文件上传安全

```python
from fastapi import FastAPI, UploadFile, HTTPException
from pathlib import Path
import magic
import hashlib

ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.pdf', '.doc', '.docx', '.xls', '.xlsx'}
MAX_FILE_SIZE = 10 * 1024 * 1024  # 10MB

def validate_file(file: UploadFile) -> bool:
    if not file.filename:
        return False
    
    ext = Path(file.filename).suffix.lower()
    if ext not in ALLOWED_EXTENSIONS:
        return False
    
    return True

def get_file_hash(file_content: bytes) -> str:
    return hashlib.sha256(file_content).hexdigest()

@app.post("/upload")
async upload_file(file: UploadFile):
    if not validate_file(file):
        raise HTTPException(status_code=400, detail="Invalid file type")
    
    content = await file.read()
    
    if len(content) > MAX_FILE_SIZE:
        raise HTTPException(status_code=400, detail="File too large")
    
    mime_type = magic.from_buffer(content, mime=True)
    if mime_type not in ['image/jpeg', 'image/png', 'application/pdf']:
        raise HTTPException(status_code=400, detail="Invalid MIME type")
    
    file_hash = get_file_hash(content)
    
    safe_filename = f"{file_hash}{Path(file.filename).suffix}"
    
    return {"filename": safe_filename, "hash": file_hash}
```

---

## 2. 安全配置最佳实践

### 2.1 环境变量管理

```python
from pydantic import BaseSettings
from typing import Optional

class Settings(BaseSettings):
    APP_NAME: str = "Axiom MES"
    DEBUG: bool = False
    
    DATABASE_URL: str
    REDIS_URL: str
    RABBITMQ_URL: str
    
    SECRET_KEY: str
    JWT_SECRET_KEY: str
    ENCRYPTION_KEY: str
    
    CORS_ORIGINS: list = ["http://localhost:3000"]
    
    class Config:
        env_file = ".env"
        case_sensitive = True

settings = Settings()
```

### 2.2 HTTPS 配置

```yaml
# Traefik HTTPS 配置
entryPoints:
  web:
    address: ":80"
    http:
      redirections:
        entryPoint:
          to: websecure
          scheme: https
  websecure:
    address: ":443"
    http:
      tls:
        certResolver: letsencrypt
        options: default

certificatesResolvers:
  letsencrypt:
    acme:
      email: admin@example.com
      storage: /etc/traefik/acme.json
      httpChallenge:
        entryPoint: web
```

### 2.3 数据库安全配置

```python
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker

DATABASE_URL = "postgresql://user:password@localhost:5432/mes_db"

engine = create_engine(
    DATABASE_URL,
    pool_size=10,
    max_overflow=20,
    pool_pre_ping=True,
    pool_recycle=3600,
    echo=False,
    connect_args={
        "sslmode": "require",
        "connect_timeout": 10
    }
)

SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
```

### 2.4 Redis 安全配置

```python
import redis

redis_client = redis.Redis(
    host='localhost',
    port=6379,
    db=0,
    password='your-redis-password',
    ssl=True,
    ssl_cert_reqs='required',
    socket_timeout=5,
    socket_connect_timeout=5,
    retry_on_timeout=True
)
```

### 2.5 日志安全配置

```python
import logging
from logging.handlers import RotatingFileHandler
import json
from datetime import datetime

class SecureFormatter(logging.Formatter):
    SENSITIVE_FIELDS = ['password', 'token', 'secret', 'key', 'credential']
    
    def format(self, record):
        log_data = {
            "timestamp": datetime.utcnow().isoformat(),
            "level": record.levelname,
            "message": self._sanitize(record.getMessage()),
            "module": record.module,
            "function": record.funcName,
            "line": record.lineno
        }
        return json.dumps(log_data)
    
    def _sanitize(self, message: str) -> str:
        for field in self.SENSITIVE_FIELDS:
            message = message.replace(field, "***REDACTED***")
        return message

handler = RotatingFileHandler(
    'app.log',
    maxBytes=10*1024*1024,
    backupCount=5
)
handler.setFormatter(SecureFormatter())

logger = logging.getLogger(__name__)
logger.addHandler(handler)
logger.setLevel(logging.INFO)
```

---

## 3. 安全运维最佳实践

### 3.1 容器安全

```dockerfile
# Dockerfile 安全最佳实践
FROM python:3.14-slim

RUN groupadd -r appgroup && useradd -r -g appgroup appuser

WORKDIR /app

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY --chown=appuser:appgroup . .

USER appuser

EXPOSE 8000

HEALTHCHECK --interval=30s --timeout=10s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
```

### 3.2 网络隔离

```yaml
# Docker Compose 网络隔离
version: '3.8'

networks:
  frontend:
    driver: bridge
  backend:
    driver: bridge
    internal: true
  database:
    driver: bridge
    internal: true

services:
  traefik:
    image: traefik:v3.6.8
    networks:
      - frontend
      - backend
  
  api:
    build: .
    networks:
      - backend
      - database
  
  postgres:
    image: postgres:18-alpine
    networks:
      - database
```

### 3.3 定期备份

```python
import schedule
import time
from datetime import datetime
import subprocess

def backup_database():
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    backup_file = f"/backups/mes_db_{timestamp}.sql"
    
    cmd = [
        "pg_dump",
        "-h", "localhost",
        "-U", "postgres",
        "-d", "mes_db",
        "-f", backup_file
    ]
    
    subprocess.run(cmd, check=True)
    
    encrypt_backup(backup_file)
    
    upload_to_s3(backup_file)

schedule.every().day.at("02:00").do(backup_database)

while True:
    schedule.run_pending()
    time.sleep(60)
```

### 3.4 安全更新

```bash
#!/bin/bash
# 安全更新脚本

echo "Checking for security updates..."

apt-get update
apt-get upgrade -y --only-upgrade

pip list --outdated --format=freeze | grep -v "^\-e" | cut -d = -f 1 | xargs -n1 pip install -U

npm audit fix

docker images --format "{{.Repository}}:{{.Tag}}" | xargs -I {} docker pull {}

echo "Security updates completed."
```

---

## 4. 安全审计最佳实践

### 4.1 审计日志设计

```python
from sqlalchemy import Column, Integer, String, DateTime, JSON
from datetime import datetime
from database import Base

class AuditLog(Base):
    __tablename__ = "audit_logs"
    
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, index=True)
    username = Column(String(50))
    action = Column(String(100), nullable=False)
    resource_type = Column(String(50))
    resource_id = Column(Integer)
    ip_address = Column(String(45))
    user_agent = Column(String(255))
    request_method = Column(String(10))
    request_path = Column(String(255))
    request_params = Column(JSON)
    response_status = Column(Integer)
    response_time = Column(Integer)
    created_at = Column(DateTime, default=datetime.utcnow, index=True)
```

### 4.2 审计日志中间件

```python
from fastapi import Request
from starlette.middleware.base import BaseHTTPMiddleware
import time
import json

class AuditMiddleware(BaseHTTPMiddleware):
    async def dispatch(self, request: Request, call_next):
        start_time = time.time()
        
        response = await call_next(request)
        
        process_time = int((time.time() - start_time) * 1000)
        
        if request.url.path.startswith("/api"):
            audit_data = {
                "user_id": getattr(request.state, "user_id", None),
                "username": getattr(request.state, "username", None),
                "action": f"{request.method} {request.url.path}",
                "resource_type": self._extract_resource_type(request.url.path),
                "ip_address": request.client.host,
                "user_agent": request.headers.get("user-agent"),
                "request_method": request.method,
                "request_path": request.url.path,
                "response_status": response.status_code,
                "response_time": process_time
            }
            
            await self._save_audit_log(audit_data)
        
        return response
    
    def _extract_resource_type(self, path: str) -> str:
        parts = path.split("/")
        if len(parts) >= 3:
            return parts[2]
        return "unknown"
    
    async def _save_audit_log(self, data: dict):
        pass
```

### 4.3 安全事件监控

```python
from prometheus_client import Counter, Histogram
from fastapi import FastAPI

app = FastAPI()

SECURITY_EVENTS = Counter(
    'security_events_total',
    'Total security events',
    ['event_type', 'severity']
)

AUTH_FAILURES = Counter(
    'auth_failures_total',
    'Total authentication failures',
    ['reason']
)

REQUEST_LATENCY = Histogram(
    'request_latency_seconds',
    'Request latency',
    ['method', 'endpoint']
)

@app.middleware("http")
async def security_monitoring(request, call_next):
    response = await call_next(request)
    
    if response.status_code == 401:
        AUTH_FAILURES.labels(reason="invalid_token").inc()
        SECURITY_EVENTS.labels(event_type="auth_failure", severity="warning").inc()
    
    if response.status_code == 403:
        SECURITY_EVENTS.labels(event_type="access_denied", severity="warning").inc()
    
    return response
```

---

## 5. 应急响应最佳实践

### 5.1 应急响应流程

```
┌─────────────────────────────────────────────────────────────┐
│                    应急响应流程                              │
└─────────────────────────────────────────────────────────────┘

1. 发现阶段
   ├── 监控告警
   ├── 用户报告
   └── 安全扫描

2. 确认阶段
   ├── 验证事件
   ├── 评估影响
   └── 确定级别

3. 遏制阶段
   ├── 隔离受影响系统
   ├── 阻止攻击
   └── 保护证据

4. 根除阶段
   ├── 修复漏洞
   ├── 清除威胁
   └── 加固系统

5. 恢复阶段
   ├── 恢复服务
   ├── 验证安全
   └── 监控异常

6. 总结阶段
   ├── 分析原因
   ├── 改进措施
   └── 更新文档
```

### 5.2 应急响应脚本

```python
from enum import Enum
from datetime import datetime
from typing import List, Optional
import subprocess

class IncidentSeverity(str, Enum):
    P0 = "P0"  # 严重
    P1 = "P1"  # 高
    P2 = "P2"  # 中
    P3 = "P3"  # 低

class IncidentHandler:
    def __init__(self):
        self.incidents = []
    
    def create_incident(
        self,
        title: str,
        description: str,
        severity: IncidentSeverity,
        affected_systems: List[str]
    ):
        incident = {
            "id": len(self.incidents) + 1,
            "title": title,
            "description": description,
            "severity": severity,
            "affected_systems": affected_systems,
            "status": "open",
            "created_at": datetime.utcnow(),
            "updated_at": datetime.utcnow()
        }
        self.incidents.append(incident)
        return incident
    
    def block_ip(self, ip: str, reason: str):
        cmd = f"iptables -A INPUT -s {ip} -j DROP"
        subprocess.run(cmd, shell=True, check=True)
        
        self._log_action("block_ip", {"ip": ip, "reason": reason})
    
    def isolate_service(self, service_name: str):
        cmd = f"docker network disconnect backend {service_name}"
        subprocess.run(cmd, shell=True, check=True)
        
        self._log_action("isolate_service", {"service": service_name})
    
    def _log_action(self, action: str, details: dict):
        pass
```

### 5.3 安全事件通知

```python
from typing import List
import requests

class NotificationService:
    def __init__(self, webhook_url: str):
        self.webhook_url = webhook_url
    
    def send_alert(
        self,
        title: str,
        message: str,
        severity: str,
        recipients: List[str]
    ):
        payload = {
            "msgtype": "markdown",
            "markdown": {
                "content": f"### {title}\n\n**严重级别**: {severity}\n\n**详情**: {message}\n\n**接收人**: {', '.join(recipients)}"
            }
        }
        
        requests.post(self.webhook_url, json=payload)
    
    def send_email(self, to: List[str], subject: str, body: str):
        pass
```

---

## 6. 安全培训与意识

### 6.1 安全培训计划

| 培训主题 | 目标人群 | 频率 | 时长 |
|---------|---------|------|------|
| 安全意识培训 | 全体员工 | 每季度 | 2小时 |
| 安全编码培训 | 开发人员 | 每月 | 4小时 |
| 安全运维培训 | 运维人员 | 每月 | 4小时 |
| 应急响应演练 | 安全团队 | 每季度 | 8小时 |
| 合规培训 | 管理层 | 每半年 | 2小时 |

### 6.2 安全意识要点

1. **密码安全**
   - 使用强密码
   - 定期更换密码
   - 不共享密码
   - 使用密码管理器

2. **钓鱼防范**
   - 识别钓鱼邮件
   - 不点击可疑链接
   - 验证发件人身份
   - 报告可疑邮件

3. **数据保护**
   - 不泄露敏感数据
   - 正确处理数据
   - 遵守数据分类
   - 及时报告泄露

4. **设备安全**
   - 锁定设备
   - 不使用公共WiFi
   - 及时更新系统
   - 安装安全软件

---

## 7. 安全合规检查清单

### 7.1 应用安全检查

- [ ] 输入验证完整
- [ ] 输出编码正确
- [ ] SQL注入防护
- [ ] XSS防护
- [ ] CSRF防护
- [ ] 文件上传安全
- [ ] 错误处理安全
- [ ] 日志记录完整

### 7.2 认证授权检查

- [ ] 密码策略执行
- [ ] 多因素认证
- [ ] 会话管理安全
- [ ] 权限最小化
- [ ] Token安全
- [ ] 登录失败处理
- [ ] 账户锁定机制

### 7.3 数据安全检查

- [ ] 传输加密
- [ ] 存储加密
- [ ] 敏感数据脱敏
- [ ] 密钥管理
- [ ] 备份加密
- [ ] 数据分类

### 7.4 网络安全检查

- [ ] HTTPS启用
- [ ] 防火墙配置
- [ ] 网络隔离
- [ ] 端口管理
- [ ] DDoS防护
- [ ] WAF配置

### 7.5 运维安全检查

- [ ] 容器安全
- [ ] 镜像安全
- [ ] 密钥管理
- [ ] 日志审计
- [ ] 监控告警
- [ ] 备份恢复

### 7.6 合规检查

- [ ] 安全策略文档
- [ ] 访问控制策略
- [ ] 数据保护策略
- [ ] 应急响应计划
- [ ] 安全培训记录
- [ ] 审计日志保存

---

## 附录

### A. 安全检查脚本

```bash
#!/bin/bash
# 安全检查脚本

echo "=== 安全检查开始 ==="

echo "1. 检查开放端口..."
netstat -tuln | grep LISTEN

echo "2. 检查运行的服务..."
systemctl list-units --type=service --state=running

echo "3. 检查防火墙状态..."
ufw status

echo "4. 检查SSH配置..."
grep -E "PermitRootLogin|PasswordAuthentication" /etc/ssh/sshd_config

echo "5. 检查Docker安全..."
docker ps --format "table {{.Names}}\t{{.Status}}"

echo "6. 检查日志..."
tail -n 20 /var/log/auth.log

echo "=== 安全检查完成 ==="
```

### B. 安全扫描工具

| 工具 | 用途 | 说明 |
|------|------|------|
| OWASP ZAP | Web应用扫描 | 开源Web应用安全扫描器 |
| Nmap | 端口扫描 | 网络发现和安全审计 |
| Trivy | 容器扫描 | 容器镜像漏洞扫描 |
| Bandit | Python代码扫描 | Python代码安全检查 |
| SonarQube | 代码质量 | 代码质量和安全分析 |

---

**文档维护**：MES 系统架构组  
**联系方式**：[363679401@qq.com](mailto:363679401@qq.com)  
**最后更新**：2026-03-10
