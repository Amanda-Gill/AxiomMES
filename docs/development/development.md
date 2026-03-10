# Axiom MES 智能生产系统 - 开发指南

## 1. 环境搭建

### 1.1 系统要求

| 组件 | 版本要求 | 说明 |
|------|----------|------|
| 操作系统 | Windows 10+, macOS 10.15+, Ubuntu 20.04+ | 支持 Linux、macOS、Windows |
| Python | 3.14+ | 后端开发必需 |
| Node.js | 24.13.1+ | 前端开发必需 |
| Git | 2.40+ | 版本控制 |
| Docker | 29.2.1+ | 容器化开发（可选） |
| Docker Compose | 5.0.2+ | 容器编排（可选） |

### 1.2 后端环境搭建

#### 1.2.1 安装 Python 3.14

**Windows:**
```powershell
# 使用 winget 安装
winget install Python.Python.3.14

# 或从官网下载安装包
# https://www.python.org/downloads/
```

**macOS:**
```bash
# 使用 Homebrew 安装
brew install python@3.14
```

**Linux (Ubuntu):**
```bash
# 添加 PPA 源
sudo add-apt-repository ppa:deadsnakes/ppa
sudo apt update

# 安装 Python 3.14
sudo apt install python3.14 python3.14-venv python3.14-dev
```

#### 1.2.2 创建虚拟环境

```bash
# 进入后端项目目录
cd fastapi-project

# 创建虚拟环境
python -m venv venv

# 激活虚拟环境
# Windows:
venv\Scripts\activate
# macOS/Linux:
source venv/bin/activate
```

#### 1.2.3 安装依赖

```bash
# 安装基础依赖
pip install -r requirements/base.txt

# 安装开发依赖（包含测试、代码检查工具）
pip install -r requirements/dev.txt

# 安装生产依赖
pip install -r requirements/prod.txt
```

#### 1.2.4 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，配置数据库、Redis、RabbitMQ 等连接信息
```

#### 1.2.5 初始化数据库

```bash
# 运行数据库迁移
alembic upgrade head

# 创建超级用户（如需）
python -m src.auth.create_superuser
```

### 1.3 前端环境搭建

#### 1.3.1 安装 Node.js

**Windows:**
```powershell
# 使用 winget 安装
winget install OpenJS.NodeJS.LTS

# 或从官网下载安装包
# https://nodejs.org/
```

**macOS:**
```bash
# 使用 Homebrew 安装
brew install node@24
```

**Linux (Ubuntu):**
```bash
# 使用 NodeSource 安装
curl -fsSL https://deb.nodesource.com/setup_24.x | sudo -E bash -
sudo apt install nodejs
```

#### 1.3.2 安装依赖

```bash
# 进入前端项目目录
cd frontend

# 安装依赖
npm install

# 或使用 pnpm（推荐）
npm install -g pnpm
pnpm install
```

#### 1.3.3 配置环境变量

```bash
# 复制环境变量示例文件
cp .env.example .env

# 编辑 .env 文件，配置 API 地址等
```

### 1.4 开发工具配置

#### 1.4.1 推荐的 IDE

**后端开发：**
- **PyCharm**：专业的 Python IDE，支持 FastAPI、SQLAlchemy 等
- **VS Code**：轻量级编辑器，配合 Python 扩展使用

**前端开发：**
- **VS Code**：推荐使用，配合 Volar、TypeScript 扩展
- **WebStorm**：专业的 Web 开发 IDE

#### 1.4.2 VS Code 扩展推荐

**通用扩展：**
- GitLens - Git 增强
- EditorConfig for VS Code - 代码风格统一
- Code Spell Checker - 拼写检查

**后端扩展：**
- Python - Python 语言支持
- Pylance - Python 语言服务器
- Python Docstring Generator - 文档字符串生成
- autoDocstring - 文档字符串生成

**前端扩展：**
- Vue - Official (Volar) - Vue 3 支持
- TypeScript Vue Plugin (Volar) - TypeScript 支持
- ESLint - 代码检查
- Prettier - Code formatter - 代码格式化

#### 1.4.3 配置 EditorConfig

在项目根目录创建 `.editorconfig` 文件：

```ini
root = true

[*]
charset = utf-8
end_of_line = lf
insert_final_newline = true
trim_trailing_whitespace = true

[*.py]
indent_style = space
indent_size = 4

[*.{js,ts,vue,json}]
indent_style = space
indent_size = 2

[*.md]
trim_trailing_whitespace = false
```

### 1.5 Docker 开发环境（可选）

#### 1.5.1 安装 Docker

**Windows:**
```powershell
# 下载并安装 Docker Desktop
# https://www.docker.com/products/docker-desktop
```

**macOS:**
```bash
# 使用 Homebrew 安装
brew install --cask docker
```

**Linux (Ubuntu):**
```bash
# 安装 Docker
curl -fsSL https://get.docker.com | sh

# 安装 Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/download/v5.0.2/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose
```

#### 1.5.2 启动开发环境

```bash
# 启动所有服务
docker compose up -d

# 查看服务状态
docker compose ps

# 查看日志
docker compose logs -f backend
```

## 2. 编码规范

### 2.1 后端编码规范（Python）

#### 2.1.1 代码风格

- **缩进**：使用 4 个空格，禁止使用制表符
- **行长度**：不超过 120 个字符
- **编码**：所有源文件使用 UTF-8 编码
- **格式化工具**：使用 `black` 进行代码格式化

```bash
# 格式化代码
black .

# 检查代码风格
flake8 .
```

#### 2.1.2 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 模块/包名 | snake_case | `auth`, `data_processor` |
| 类名 | PascalCase | `UserService`, `OrderController` |
| 函数/方法名 | snake_case | `get_user_by_id`, `calculate_cost` |
| 变量名 | snake_case | `user_list`, `total_count` |
| 常量 | UPPER_SNAKE_CASE | `MAX_RETRY_TIMES`, `DEFAULT_PAGE_SIZE` |
| 私有成员 | _前缀 | `_internal_helper` |
| 异常类 | PascalCase + Error 后缀 | `UserNotFoundError` |

#### 2.1.3 类型注解

所有函数参数和返回值必须使用类型注解：

```python
from typing import Optional, List
from datetime import datetime

def get_user_by_id(user_id: int) -> Optional[dict]:
    """根据 ID 获取用户信息"""
    pass

def create_order(
    user_id: int,
    product_ids: List[int],
    created_at: Optional[datetime] = None
) -> dict:
    """创建订单"""
    pass
```

#### 2.1.4 文档字符串

使用 Google 风格的文档字符串：

```python
def calculate_total_price(
    items: List[dict],
    discount: float = 0.0
) -> float:
    """计算订单总价。

    Args:
        items: 订单项列表，每个项包含 product_id、quantity、price。
        discount: 折扣率，范围 0.0-1.0，默认为 0.0。

    Returns:
        计算后的订单总价。

    Raises:
        ValueError: 当折扣率不在有效范围内时抛出。

    Example:
        >>> items = [{"price": 100, "quantity": 2}]
        >>> calculate_total_price(items, 0.1)
        180.0
    """
    if not 0.0 <= discount <= 1.0:
        raise ValueError("Discount must be between 0.0 and 1.0")
    
    total = sum(item["price"] * item["quantity"] for item in items)
    return total * (1 - discount)
```

#### 2.1.5 导入顺序

按照标准库 → 第三方库 → 本地模块的顺序导入，每组之间空一行：

```python
# 标准库
import os
import sys
from typing import Optional, List

# 第三方库
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel

# 本地模块
from src.core.database import get_db
from src.auth.dependencies import get_current_user
from src.auth.schemas import UserResponse
```

#### 2.1.6 异常处理

使用自定义异常类，避免裸抛 `Exception`：

```python
# 定义自定义异常
class UserNotFoundError(Exception):
    """用户不存在异常"""
    pass

class InvalidCredentialsError(Exception):
    """凭证无效异常"""
    pass

# 使用自定义异常
def get_user(user_id: int):
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise UserNotFoundError(f"User with id {user_id} not found")
    return user
```

#### 2.1.7 异步编程

I/O 密集型操作使用 `async/await`：

```python
from fastapi import FastAPI
import httpx

app = FastAPI()

@app.get("/external-data")
async def get_external_data():
    async with httpx.AsyncClient() as client:
        response = await client.get("https://api.example.com/data")
        return response.json()
```

### 2.2 前端编码规范（Vue 3 + TypeScript）

#### 2.2.1 代码风格

- **缩进**：使用 2 个空格
- **引号**：使用单引号
- **分号**：不使用分号
- **格式化工具**：使用 Prettier

```bash
# 格式化代码
npm run format

# 或
pnpm format
```

#### 2.2.2 组件规范

使用组合式 API 和 `<script setup>` 语法：

```vue
<template>
  <div class="user-card">
    <h2>{{ user.name }}</h2>
    <p>{{ user.email }}</p>
  </div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue'
import type { User } from '@/types/api'
import { getUserById } from '@/api/user'

interface Props {
  userId: number
}

const props = defineProps<Props>()

const user = ref<User | null>(null)

onMounted(async () => {
  user.value = await getUserById(props.userId)
})
</script>

<style scoped>
.user-card {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
}
</style>
```

#### 2.2.3 命名约定

| 类型 | 约定 | 示例 |
|------|------|------|
| 组件文件名 | kebab-case | `user-profile.vue` |
| 组件名 | PascalCase | `UserProfile` |
| 变量/函数 | camelCase | `userName`, `fetchData` |
| 常量 | UPPER_SNAKE_CASE | `API_BASE_URL` |
| Pinia Store | camelCase + use 前缀 + Store 后缀 | `useAuthStore` |
| 路由路径 | kebab-case | `/user-profile` |
| CSS 类名 | BEM 规范 | `user-card__title--large` |

#### 2.2.4 TypeScript 规范

严格模式，禁止使用 `any`：

```typescript
// 使用接口定义类型
interface User {
  id: number
  name: string
  email: string
  createdAt: Date
}

// 使用类型别名
type ApiResponse<T> = {
  code: number
  message: string
  data: T
}

// 使用泛型
async function fetchData<T>(url: string): Promise<T> {
  const response = await fetch(url)
  return response.json()
}

// 使用类型守卫
function isUser(obj: unknown): obj is User {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'name' in obj &&
    'email' in obj
  )
}
```

#### 2.2.5 状态管理（Pinia）

```typescript
// stores/auth.ts
import { defineStore } from 'pinia'
import type { User } from '@/types/api'

interface AuthState {
  user: User | null
  token: string | null
}

export const useAuthStore = defineStore('auth', {
  state: (): AuthState => ({
    user: null,
    token: null
  }),

  getters: {
    isAuthenticated: (state) => !!state.token,
    userName: (state) => state.user?.name ?? ''
  },

  actions: {
    async login(username: string, password: string) {
      // 登录逻辑
    },
    
    logout() {
      this.user = null
      this.token = null
    }
  }
})
```

#### 2.2.6 样式规范

使用 SCSS 和 BEM 命名规范：

```scss
// 使用 scoped 避免样式污染
<style scoped lang="scss">
.user-card {
  padding: 16px;
  border: 1px solid #e0e0e0;
  border-radius: 8px;

  // 元素
  &__title {
    font-size: 18px;
    font-weight: bold;
  }

  &__content {
    margin-top: 8px;
  }

  // 修饰符
  &--large {
    padding: 24px;
  }

  &--highlighted {
    border-color: #1976d2;
    background-color: #e3f2fd;
  }
}
</style>
```

### 2.3 通用规范

#### 2.3.1 注释规范

- 复杂逻辑必须添加注释
- 注释应解释"为什么"而非"是什么"
- 使用 TODO 和 FIXME 标记待办事项

```python
# TODO(author): 需要添加缓存机制以提高性能
# FIXME(author): 在高并发场景下可能出现竞态条件

# 使用 Redis 分布式锁确保库存扣减的原子性
# 避免超卖问题
with redis_lock(f"inventory:{product_id}"):
    inventory = get_inventory(product_id)
    if inventory >= quantity:
        decrease_inventory(product_id, quantity)
```

#### 2.3.2 Git 提交规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/) 规范：

```
<type>(<scope>): <subject>

<body>

<footer>
```

**类型（type）：**
- `feat`: 新功能
- `fix`: 修复 bug
- `docs`: 文档更新
- `style`: 代码格式调整（不影响功能）
- `refactor`: 代码重构
- `perf`: 性能优化
- `test`: 测试相关
- `chore`: 构建/工具相关
- `ci`: CI/CD 相关

**示例：**
```
feat(auth): 添加用户登录功能

- 实现 OAuth2 + JWT 认证
- 添加登录、登出接口
- 添加刷新令牌机制

Closes #123
```

## 3. 测试运行

### 3.1 后端测试

#### 3.1.1 测试框架

使用 `pytest` 作为测试框架：

```bash
# 安装测试依赖
pip install pytest pytest-asyncio pytest-cov httpx

# 运行所有测试
pytest

# 运行指定测试文件
pytest tests/auth/test_service.py

# 运行指定测试函数
pytest tests/auth/test_service.py::test_login

# 显示详细输出
pytest -v

# 显示打印输出
pytest -s
```

#### 3.1.2 测试覆盖率

```bash
# 生成覆盖率报告
pytest --cov=src --cov-report=html

# 查看覆盖率报告
open htmlcov/index.html
```

#### 3.1.3 单元测试示例

```python
# tests/auth/test_service.py
import pytest
from src.auth.service import AuthService
from src.auth.exceptions import InvalidCredentialsError

@pytest.fixture
def auth_service():
    return AuthService()

def test_login_success(auth_service):
    """测试登录成功"""
    result = auth_service.login("admin", "password")
    assert result["access_token"] is not None
    assert result["token_type"] == "bearer"

def test_login_invalid_credentials(auth_service):
    """测试登录失败 - 凭证无效"""
    with pytest.raises(InvalidCredentialsError):
        auth_service.login("admin", "wrong_password")

@pytest.mark.asyncio
async def test_async_function():
    """测试异步函数"""
    result = await some_async_function()
    assert result is not None
```

#### 3.1.4 集成测试示例

```python
# tests/integration/test_api.py
from fastapi.testclient import TestClient
from src.main import app

client = TestClient(app)

def test_create_user():
    """测试创建用户接口"""
    response = client.post(
        "/api/v1/users",
        json={
            "username": "testuser",
            "email": "test@example.com",
            "password": "password123"
        }
    )
    assert response.status_code == 201
    assert response.json()["data"]["username"] == "testuser"

def test_get_user():
    """测试获取用户接口"""
    # 先创建用户
    create_response = client.post(
        "/api/v1/users",
        json={
            "username": "testuser2",
            "email": "test2@example.com",
            "password": "password123"
        }
    )
    user_id = create_response.json()["data"]["id"]
    
    # 获取用户
    response = client.get(f"/api/v1/users/{user_id}")
    assert response.status_code == 200
    assert response.json()["data"]["username"] == "testuser2"
```

### 3.2 前端测试

#### 3.2.1 测试框架

使用 `Vitest` 作为测试框架：

```bash
# 安装测试依赖
npm install -D vitest @vue/test-utils happy-dom

# 运行测试
npm run test

# 运行测试并生成覆盖率报告
npm run test:coverage

# 监听模式
npm run test:watch
```

#### 3.2.2 单元测试示例

```typescript
// tests/components/UserCard.spec.ts
import { describe, it, expect } from 'vitest'
import { mount } from '@vue/test-utils'
import UserCard from '@/components/UserCard.vue'

describe('UserCard', () => {
  it('renders user information correctly', () => {
    const user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    }

    const wrapper = mount(UserCard, {
      props: { user }
    })

    expect(wrapper.text()).toContain('John Doe')
    expect(wrapper.text()).toContain('john@example.com')
  })

  it('emits edit event when edit button is clicked', async () => {
    const user = {
      id: 1,
      name: 'John Doe',
      email: 'john@example.com'
    }

    const wrapper = mount(UserCard, {
      props: { user }
    })

    await wrapper.find('.edit-button').trigger('click')
    expect(wrapper.emitted('edit')).toBeTruthy()
  })
})
```

#### 3.2.3 E2E 测试

使用 `Cypress` 或 `Playwright` 进行端到端测试：

```typescript
// e2e/login.spec.ts (Playwright)
import { test, expect } from '@playwright/test'

test('user can login', async ({ page }) => {
  await page.goto('/login')
  
  await page.fill('input[name="username"]', 'admin')
  await page.fill('input[name="password"]', 'password')
  await page.click('button[type="submit"]')
  
  await expect(page).toHaveURL('/dashboard')
  await expect(page.locator('.user-name')).toContainText('Admin')
})
```

### 3.3 测试最佳实践

1. **测试命名**：使用描述性的测试名称，清晰表达测试意图
2. **测试隔离**：每个测试应该独立，不依赖其他测试的结果
3. **测试覆盖**：确保覆盖正常流程、边界条件和异常情况
4. **测试数据**：使用 fixture 或工厂函数生成测试数据
5. **测试清理**：测试后清理创建的数据和资源

## 4. 开发流程

### 4.1 分支管理

采用 Git Flow 或 Trunk Based 开发模式：

```
main (主分支，稳定版本)
├── develop (开发分支)
│   ├── feature/auth (功能分支)
│   ├── feature/order (功能分支)
│   └── ...
├── release/v1.0.0 (发布分支)
└── hotfix/fix-login (修复分支)
```

### 4.2 开发流程

1. **创建功能分支**
   ```bash
   git checkout develop
   git pull origin develop
   git checkout -b feature/new-feature
   ```

2. **开发与提交**
   ```bash
   # 编写代码
   # 运行测试
   pytest
   
   # 提交代码
   git add .
   git commit -m "feat: 添加新功能"
   ```

3. **推送到远程**
   ```bash
   git push origin feature/new-feature
   ```

4. **创建 Pull Request**
   - 在 GitHub/GitLab 上创建 PR
   - 填写 PR 描述，关联 Issue
   - 等待代码审查

5. **代码审查**
   - 通过自动化测试
   - 通过代码审查
   - 合并到 develop 分支

### 4.3 代码审查规范

**审查要点：**
- 代码是否符合编码规范
- 是否有足够的测试覆盖
- 是否有潜在的性能问题
- 是否有安全隐患
- 是否有清晰的注释和文档

## 5. 调试技巧

### 5.1 后端调试

#### 5.1.1 使用日志

```python
import logging

logger = logging.getLogger(__name__)

def some_function():
    logger.debug("Debug message")
    logger.info("Info message")
    logger.warning("Warning message")
    logger.error("Error message")
```

#### 5.1.2 使用断点

```python
# 在代码中添加断点
import pdb; pdb.set_trace()

# 或使用 breakpoint() (Python 3.7+)
breakpoint()
```

#### 5.1.3 使用 IDE 调试器

在 PyCharm 或 VS Code 中设置断点，使用调试模式运行。

### 5.2 前端调试

#### 5.2.1 使用 Vue DevTools

安装 Vue DevTools 浏览器扩展，查看组件状态、Pinia Store 等。

#### 5.2.2 使用控制台

```typescript
// 打印调试信息
console.log('Debug info:', data)

// 打印表格
console.table(arrayData)

// 打印性能信息
console.time('operation')
// ... 操作
console.timeEnd('operation')
```

#### 5.2.3 使用断点

在浏览器开发者工具的 Sources 面板中设置断点。

## 6. 常见问题

### 6.1 后端常见问题

**Q: 数据库迁移失败？**
```bash
# 检查迁移状态
alembic current

# 回滚到上一个版本
alembic downgrade -1

# 重新执行迁移
alembic upgrade head
```

**Q: 依赖安装失败？**
```bash
# 清除缓存
pip cache purge

# 重新安装
pip install -r requirements/base.txt --no-cache-dir
```

### 6.2 前端常见问题

**Q: Node 版本不兼容？**
```bash
# 使用 nvm 切换 Node 版本
nvm install 24
nvm use 24
```

**Q: 依赖安装失败？**
```bash
# 清除缓存
npm cache clean --force

# 删除 node_modules
rm -rf node_modules package-lock.json

# 重新安装
npm install
```

## 7. 相关文档

- [部署文档](./deployment.md)
- [架构文档](./architecture.md)
- [编码规范](../Coding Standards.md)
- [项目规范](../Project Guidelines.md)

---

**文档版本**：1.0
**最后更新**：2026-03-10
**适用范围**：Axiom MES 智能生产系统开发团队
**状态**：正式发布
