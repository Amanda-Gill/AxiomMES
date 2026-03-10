# Axiom MES 智能生产系统 - 测试策略文档

**文档版本**：1.0  
**最后更新**：2026-03-10  
**适用范围**：Axiom MES 智能生产系统测试策略  
**状态**：正式发布  

---

## 目录

1. [测试策略概述](#1-测试策略概述)
2. [测试层次与类型](#2-测试层次与类型)
3. [测试工具与环境](#3-测试工具与环境)
4. [测试流程管理](#4-测试流程管理)
5. [测试覆盖率要求](#5-测试覆盖率要求)
6. [测试数据管理](#6-测试数据管理)
7. [自动化测试策略](#7-自动化测试策略)
8. [测试质量指标](#8-测试质量指标)

---

## 1. 测试策略概述

### 1.1 测试目标

Axiom MES 智能生产系统测试策略旨在实现以下目标：

- **质量保证**：确保系统功能正确、性能稳定、安全可靠
- **风险控制**：及早发现缺陷，降低生产环境风险
- **效率提升**：通过自动化测试提高测试效率
- **持续改进**：建立测试度量体系，持续优化测试过程

### 1.2 测试原则

| 原则 | 说明 |
|------|------|
| 测试左移 | 尽早开始测试，在需求阶段就考虑测试 |
| 测试独立性 | 测试团队独立于开发团队 |
| 测试完整性 | 覆盖所有功能、性能、安全测试场景 |
| 测试可追溯 | 测试用例与需求双向追溯 |
| 测试自动化 | 尽可能自动化测试，提高效率 |
| 测试数据隔离 | 测试数据与生产数据严格隔离 |

### 1.3 测试策略架构

```
┌─────────────────────────────────────────────────────────────┐
│                      测试策略架构                            │
└─────────────────────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────────────┐
│  验收测试                                                    │
│  用户验收测试 │ 业务流程测试                                 │
├─────────────────────────────────────────────────────────────┤
│  系统测试                                                    │
│  功能测试 │ 性能测试 │ 安全测试 │ 兼容性测试                 │
├─────────────────────────────────────────────────────────────┤
│  集成测试                                                    │
│  API集成测试 │ 数据库集成测试 │ 服务集成测试                 │
├─────────────────────────────────────────────────────────────┤
│  单元测试                                                    │
│  代码单元测试 │ 组件测试 │ 模块测试                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 2. 测试层次与类型

### 2.1 单元测试

#### 2.1.1 单元测试策略

| 项目 | 说明 |
|------|------|
| 测试框架 | pytest（后端）、Vitest（前端） |
| 覆盖率目标 | 核心业务逻辑 >85%，整体 >70% |
| 执行频率 | 每次代码提交 |
| 执行时间 | < 5分钟 |
| 责任人 | 开发人员 |

#### 2.1.2 单元测试范围

```python
# 单元测试示例
import pytest
from fastapi.testclient import TestClient
from main import app
from unittest.mock import Mock, patch

client = TestClient(app)

class TestUserService:
    def test_create_user_success(self):
        user_data = {
            "username": "testuser",
            "email": "test@example.com",
            "password": "Test@123456"
        }
        
        response = client.post("/api/v1/users", json=user_data)
        
        assert response.status_code == 201
        assert response.json()["username"] == "testuser"
    
    def test_create_user_duplicate_username(self):
        user_data = {
            "username": "existinguser",
            "email": "test@example.com",
            "password": "Test@123456"
        }
        
        client.post("/api/v1/users", json=user_data)
        response = client.post("/api/v1/users", json=user_data)
        
        assert response.status_code == 400
        assert "already exists" in response.json()["message"]
    
    @patch('services.user_service.UserService.get_user_by_id')
    def test_get_user_not_found(self, mock_get_user):
        mock_get_user.return_value = None
        
        response = client.get("/api/v1/users/999")
        
        assert response.status_code == 404
```

### 2.2 集成测试

#### 2.2.1 集成测试策略

| 项目 | 说明 |
|------|------|
| 测试框架 | pytest + Testcontainers |
| 覆盖率目标 | API接口 100% |
| 执行频率 | 每次合并到主分支 |
| 执行时间 | < 30分钟 |
| 责任人 | 测试人员 |

#### 2.2.2 集成测试范围

```python
# 集成测试示例
import pytest
from testcontainers.postgres import PostgresContainer
from testcontainers.redis import RedisContainer
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from fastapi.testclient import TestClient
from main import app, get_db
from models import Base

@pytest.fixture(scope="module")
def postgres_container():
    with PostgresContainer("postgres:18-alpine") as postgres:
        yield postgres

@pytest.fixture(scope="module")
def redis_container():
    with RedisContainer("redis:8.6.0-alpine") as redis:
        yield redis

@pytest.fixture(scope="module")
def db_session(postgres_container):
    engine = create_engine(postgres_container.get_connection_url())
    Base.metadata.create_all(engine)
    Session = sessionmaker(bind=engine)
    session = Session()
    yield session
    session.close()

@pytest.fixture(scope="module")
def client(db_session):
    def override_get_db():
        return db_session
    
    app.dependency_overrides[get_db] = override_get_db
    yield TestClient(app)
    app.dependency_overrides.clear()

class TestStrategyIntegration:
    def test_create_and_retrieve_strategy(self, client):
        strategy_data = {
            "name": "Test Strategy",
            "description": "Integration test strategy",
            "priority": 5
        }
        
        create_response = client.post("/api/v1/strategies", json=strategy_data)
        assert create_response.status_code == 201
        
        strategy_id = create_response.json()["id"]
        
        get_response = client.get(f"/api/v1/strategies/{strategy_id}")
        assert get_response.status_code == 200
        assert get_response.json()["name"] == "Test Strategy"
```

### 2.3 系统测试

#### 2.3.1 功能测试

| 测试类型 | 测试内容 | 优先级 |
|---------|---------|--------|
| 冒烟测试 | 核心功能验证 | P0 |
| 功能测试 | 所有功能点验证 | P1 |
| 回归测试 | 缺陷修复验证 | P1 |
| 探索性测试 | 未覆盖场景探索 | P2 |

#### 2.3.2 性能测试

| 测试类型 | 测试内容 | 指标要求 |
|---------|---------|---------|
| 负载测试 | 正常负载下的性能 | 响应时间 < 2s |
| 压力测试 | 超出正常负载的性能 | 系统不崩溃 |
| 并发测试 | 并发用户访问 | 支持1000并发 |
| 稳定性测试 | 长时间运行稳定性 | 24小时无故障 |

#### 2.3.3 安全测试

| 测试类型 | 测试内容 | 工具 |
|---------|---------|------|
| 漏洞扫描 | 已知漏洞检测 | OWASP ZAP |
| 渗透测试 | 模拟攻击测试 | Burp Suite |
| 代码审计 | 代码安全检查 | SonarQube |
| 依赖检查 | 第三方依赖漏洞 | Trivy |

### 2.4 验收测试

| 测试类型 | 测试内容 | 参与人员 |
|---------|---------|---------|
| 用户验收测试 | 业务流程验证 | 业务用户 |
| 业务流程测试 | 端到端流程验证 | 业务分析师 |
| 易用性测试 | 用户体验验证 | 产品经理 |

---

## 3. 测试工具与环境

### 3.1 测试工具清单

| 工具类型 | 工具名称 | 用途 | 版本 |
|---------|---------|------|------|
| 单元测试 | pytest | Python单元测试 | 8.x |
| 单元测试 | Vitest | 前端单元测试 | 1.x |
| 集成测试 | Testcontainers | 容器化测试环境 | 4.x |
| API测试 | Postman | API接口测试 | 最新 |
| 性能测试 | Locust | 性能负载测试 | 2.x |
| 性能测试 | JMeter | 性能压力测试 | 5.x |
| E2E测试 | Playwright | 端到端测试 | 1.x |
| 安全测试 | OWASP ZAP | 安全漏洞扫描 | 最新 |
| 代码覆盖 | Coverage.py | 代码覆盖率统计 | 7.x |
| 代码质量 | SonarQube | 代码质量分析 | 10.x |

### 3.2 测试环境配置

```yaml
# 测试环境配置示例
test:
  database:
    host: localhost
    port: 5432
    name: mes_test
    user: test_user
    password: test_password
  
  redis:
    host: localhost
    port: 6379
    db: 1
  
  rabbitmq:
    host: localhost
    port: 5672
    user: test_user
    password: test_password
  
  api:
    base_url: http://localhost:8000
    timeout: 30
  
  frontend:
    base_url: http://localhost:3000
```

### 3.3 测试数据管理

```python
# 测试数据工厂
from factory import Factory, Faker, SubFactory
from models import User, Strategy

class UserFactory(Factory):
    class Meta:
        model = User
    
    username = Faker('user_name')
    email = Faker('email')
    password = Faker('password', length=12)

class StrategyFactory(Factory):
    class Meta:
        model = Strategy
    
    name = Faker('sentence', nb_words=3)
    description = Faker('text')
    priority = Faker('random_int', min=1, max=10)
    created_by = SubFactory(UserFactory)
```

---

## 4. 测试流程管理

### 4.1 测试流程

```
┌─────────────────────────────────────────────────────────────┐
│                      测试流程                                │
└─────────────────────────────────────────────────────────────┘

需求分析
    │
    ▼
测试计划 ───► 测试策略制定
    │
    ▼
测试设计 ───► 测试用例编写
    │
    ▼
测试执行 ───► 测试用例执行
    │
    ├─ 通过 ──► 测试报告
    │
    └─ 失败 ──► 缺陷报告 ──► 缺陷修复 ──► 回归测试
```

### 4.2 缺陷管理流程

```
┌─────────────────────────────────────────────────────────────┐
│                    缺陷管理流程                              │
└─────────────────────────────────────────────────────────────┘

发现缺陷
    │
    ▼
提交缺陷报告
    │
    ▼
缺陷分类 ───► 严重 │ 高 │ 中 │ 低
    │
    ▼
分配给开发人员
    │
    ▼
开发人员修复
    │
    ▼
测试人员验证
    │
    ├─ 通过 ──► 关闭缺陷
    │
    └─ 失败 ──► 重新打开
```

### 4.3 缺陷优先级定义

| 优先级 | 定义 | 响应时间 | 修复时间 |
|--------|------|---------|---------|
| P0-严重 | 系统崩溃、数据丢失、安全漏洞 | 1小时 | 4小时 |
| P1-高 | 核心功能不可用、严重影响用户 | 4小时 | 24小时 |
| P2-中 | 部分功能异常、有临时解决方案 | 24小时 | 3天 |
| P3-低 | 界面问题、优化建议 | 3天 | 1周 |

---

## 5. 测试覆盖率要求

### 5.1 代码覆盖率

| 模块类型 | 行覆盖率要求 | 分支覆盖率要求 |
|---------|-------------|---------------|
| 核心业务逻辑 | > 85% | > 80% |
| API接口 | > 90% | > 85% |
| 工具函数 | > 80% | > 75% |
| 数据模型 | > 70% | > 65% |
| 整体项目 | > 70% | > 65% |

### 5.2 功能覆盖率

| 功能模块 | 测试用例数量要求 | 覆盖场景 |
|---------|----------------|---------|
| 用户管理 | 正向场景 + 异常场景 + 边界场景 | 100% |
| 策略管理 | 正向场景 + 异常场景 + 边界场景 | 100% |
| 排程管理 | 正向场景 + 异常场景 + 边界场景 | 100% |
| 质量管理 | 正向场景 + 异常场景 + 边界场景 | 100% |
| 报表功能 | 正向场景 + 异常场景 | 100% |

### 5.3 覆盖率报告

```python
# pytest.ini 配置
[pytest]
addopts = 
    --cov=src
    --cov-report=html
    --cov-report=term-missing
    --cov-fail-under=70
testpaths = tests
python_files = test_*.py
python_classes = Test*
python_functions = test_*
```

---

## 6. 测试数据管理

### 6.1 测试数据策略

| 数据类型 | 管理方式 | 说明 |
|---------|---------|------|
| 基础数据 | 固定数据集 | 用户、角色、权限等基础配置 |
| 业务数据 | 动态生成 | 订单、策略等业务数据 |
| 边界数据 | 专门准备 | 边界值、异常值测试数据 |
| 敏感数据 | 脱敏处理 | 生产数据脱敏后使用 |

### 6.2 测试数据准备

```python
# conftest.py - 测试数据准备
import pytest
from sqlalchemy.orm import Session
from models import User, Role, Permission
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

@pytest.fixture(scope="session")
def test_data(db_session: Session):
    admin_role = Role(name="Admin", code="admin")
    user_role = Role(name="User", code="user")
    
    db_session.add_all([admin_role, user_role])
    db_session.commit()
    
    admin_user = User(
        username="admin",
        email="admin@example.com",
        hashed_password=pwd_context.hash("Admin@123"),
        roles=[admin_role]
    )
    
    test_user = User(
        username="testuser",
        email="test@example.com",
        hashed_password=pwd_context.hash("Test@123"),
        roles=[user_role]
    )
    
    db_session.add_all([admin_user, test_user])
    db_session.commit()
    
    return {
        "admin_user": admin_user,
        "test_user": test_user,
        "admin_role": admin_role,
        "user_role": user_role
    }
```

### 6.3 数据清理策略

```python
@pytest.fixture(autouse=True)
def cleanup_db(db_session: Session):
    yield
    
    db_session.rollback()
    
    for table in reversed(Base.metadata.sorted_tables):
        db_session.execute(table.delete())
    db_session.commit()
```

---

## 7. 自动化测试策略

### 7.1 自动化测试分层

```
┌─────────────────────────────────────────────────────────────┐
│                    自动化测试金字塔                          │
└─────────────────────────────────────────────────────────────┘

                    ┌─────────┐
                    │  E2E    │  10%
                    │  Tests  │
                ┌───┴─────────┴───┐
                │  Integration    │  20%
                │     Tests       │
            ┌───┴─────────────────┴───┐
            │      Unit Tests         │  70%
            │                         │
            └─────────────────────────┘
```

### 7.2 CI/CD 集成

```yaml
# .github/workflows/test.yml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main ]

jobs:
  unit-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.14'
      
      - name: Install dependencies
        run: |
          pip install -r requirements/dev.txt
      
      - name: Run unit tests
        run: |
          pytest tests/unit -v --cov=src --cov-report=xml
      
      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          file: ./coverage.xml

  integration-test:
    runs-on: ubuntu-latest
    services:
      postgres:
        image: postgres:18-alpine
        env:
          POSTGRES_PASSWORD: test
        options: >-
          --health-cmd pg_isready
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 5432:5432
      
      redis:
        image: redis:8.6.0-alpine
        options: >-
          --health-cmd "redis-cli ping"
          --health-interval 10s
          --health-timeout 5s
          --health-retries 5
        ports:
          - 6379:6379
    
    steps:
      - uses: actions/checkout@v3
      
      - name: Set up Python
        uses: actions/setup-python@v4
        with:
          python-version: '3.14'
      
      - name: Install dependencies
        run: |
          pip install -r requirements/dev.txt
      
      - name: Run integration tests
        run: |
          pytest tests/integration -v
        env:
          DATABASE_URL: postgresql://postgres:test@localhost:5432/test
          REDIS_URL: redis://localhost:6379/0

  e2e-test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '24'
      
      - name: Install Playwright
        run: |
          npm install
          npx playwright install
      
      - name: Run E2E tests
        run: |
          npx playwright test
```

### 7.3 自动化测试报告

```python
# 测试报告生成配置
import pytest
from pytest_html import HTMLReport

def pytest_configure(config):
    config._metadata = {
        "Project": "Axiom MES",
        "Version": "1.0.0",
        "Environment": "Test",
        "Browser": "Chrome",
        "Python Version": "3.14"
    }

@pytest.hookimpl(hookwrapper=True)
def pytest_runtest_makereport(item, call):
    outcome = yield
    report = outcome.get_result()
    
    if report.when == "call":
        if report.failed:
            screenshot = take_screenshot()
            report.extra = [pytest_html.extras.image(screenshot)]
```

---

## 8. 测试质量指标

### 8.1 测试质量指标定义

| 指标名称 | 定义 | 目标值 | 计算方式 |
|---------|------|--------|---------|
| 测试覆盖率 | 代码被测试覆盖的比例 | >70% | 已测试代码行/总代码行 |
| 缺陷发现率 | 单位时间发现的缺陷数 | 稳定 | 发现缺陷数/测试时间 |
| 缺陷修复率 | 已修复缺陷占发现缺陷的比例 | >95% | 已修复缺陷数/发现缺陷数 |
| 回归通过率 | 回归测试通过的比例 | >98% | 通过用例数/总用例数 |
| 自动化率 | 自动化测试用例占比 | >80% | 自动化用例数/总用例数 |
| 测试执行率 | 已执行测试用例占比 | 100% | 已执行用例数/总用例数 |

### 8.2 测试报告模板

```markdown
# 测试报告

## 1. 测试概览
- 测试版本：v1.0.0
- 测试周期：2026-03-01 ~ 2026-03-10
- 测试人员：测试团队

## 2. 测试统计
| 指标 | 数值 |
|------|------|
| 测试用例总数 | 500 |
| 已执行用例数 | 500 |
| 通过用例数 | 485 |
| 失败用例数 | 15 |
| 通过率 | 97% |

## 3. 缺陷统计
| 优先级 | 发现数 | 已修复 | 待修复 |
|--------|--------|--------|--------|
| P0 | 2 | 2 | 0 |
| P1 | 5 | 5 | 0 |
| P2 | 8 | 6 | 2 |
| P3 | 10 | 5 | 5 |

## 4. 覆盖率统计
- 代码覆盖率：75%
- 功能覆盖率：100%
- API覆盖率：100%

## 5. 风险与建议
- 待修复P2缺陷2个，建议在上线前修复
- 测试覆盖率略低于目标，建议补充测试用例
```

---

## 附录

### A. 测试检查清单

- [ ] 测试计划已制定
- [ ] 测试用例已编写并评审
- [ ] 测试环境已准备
- [ ] 测试数据已准备
- [ ] 单元测试已执行
- [ ] 集成测试已执行
- [ ] 系统测试已执行
- [ ] 性能测试已执行
- [ ] 安全测试已执行
- [ ] 回归测试已执行
- [ ] 测试报告已生成
- [ ] 缺陷已全部修复或确认

### B. 测试工具使用指南

| 工具 | 使用场景 | 常用命令 |
|------|---------|---------|
| pytest | 单元测试 | `pytest tests/unit -v` |
| pytest-cov | 覆盖率 | `pytest --cov=src --cov-report=html` |
| locust | 性能测试 | `locust -f locustfile.py` |
| playwright | E2E测试 | `npx playwright test` |

---

**文档维护**：MES 系统测试组  
**联系方式**：[363679401@qq.com](mailto:363679401@qq.com)  
**最后更新**：2026-03-10
