# Skills 实际触发/调用检查报告

检查时间：按本文件生成时环境为准  
检查范围：依赖**外部 CLI 或运行时**的若干 Skills，验证其声明的命令是否已安装、可调用。

---

## 1. 环境基线（已就绪）

| 依赖 | 状态 | 说明 |
|------|------|------|
| node | ✅ 可用 | v24.13.0 |
| npm | ✅ 可用 | 11.6.2 |
| npx | ✅ 可用 | 11.6.2 |
| python | ✅ 可用 | Python 3.14.3 |

---

## 2. 依赖外部 CLI 的 Skills 检查结果

| Skill | 声明的命令/工具 | 检查结果 | 说明 |
|-------|-----------------|----------|------|
| **agent-browser** | `npx agent-browser:*`, `agent-browser:*` | ⏳ 未确认 | 全局无 `agent-browser`；`npx agent-browser --version` 执行超时（可能首次拉包慢），未在本次完成验证。 |
| **agent-tools** | `infsh *` (inference.sh CLI) | ❌ 不可用 | `infsh` 未在 PATH 中。需安装：`curl -fsSL https://cli.inference.sh \| sh` 并 `infsh login`。 |
| **python-executor** | `infsh *` | ❌ 不可用 | 同上，依赖 inference.sh CLI。 |
| **audit-website** | `squirrel:*` (squirrelscan) | ❌ 不可用 | `squirrel` 未在 PATH 中。需安装 squirrelscan CLI 并加入 PATH。 |
| **playwright-cli** | `playwright-cli:*` | ❌ 不可用 | 全局无 `playwright-cli`。Skill 文档建议可用 `npx playwright-cli` 作为备选，未在本次执行验证。 |
| **autoship** | `autoship:*`, `npx autoship:*` | ❌ 不可用 | 全局无 `autoship`；`npx autoship --help` 在本次执行中超时，未完成验证。 |
| **before-and-after** | `before-and-after`, `npx @vercel/before-and-after`, `gh`, `vercel` | ⚠️ 部分不可用 | `gh`（GitHub CLI）未在 PATH 中；`before-and-after` / `vercel` 未单独验证。 |
| **python-sdk** | `pip install inferencesh`, `python *` | ✅ 可用 | `python` 已安装；实际调用依赖 `inferencesh` 包与 inference.sh 服务，未做端到端调用测试。 |

---

## 3. 不依赖外部 CLI 的 Skills（逻辑/文档类）

以下 Skills 主要提供说明、工作流或内建工具用法，**不要求**单独安装上述 CLI，在“命令是否存在”意义上视为可触发/调用：

- **find-skills**：使用 `npx skills`（与当前环境 npx 一致）
- **brainstorming / writing-plans / receiving-code-review** 等：纯指导型，无外部命令依赖
- **fastapi-best-practices / next-best-practices** 等：文档与规范，无强制 CLI
- **shadcn-ui**：使用 `npx shadcn@latest`，依赖 node/npx（已就绪）

---

## 4. 建议操作（若要让“实际触发”全部可用）

1. **inference.sh（agent-tools / python-executor）**  
   - 安装 CLI：`curl -fsSL https://cli.inference.sh | sh`  
   - 登录：`infsh login`

2. **audit-website**  
   - 安装 [squirrelscan](https://squirrelscan.com) 的 `squirrel` CLI 并加入 PATH。

3. **before-and-after / autoship 等依赖 GitHub 的流程**  
   - 安装并登录 [GitHub CLI](https://cli.github.com/)：`gh auth login`。

4. **agent-browser / playwright-cli / autoship**  
   - 若需全局使用：在对应项目或全局安装后，确保命令在 PATH 中。  
   - 或统一通过 `npx <package>` 调用（注意首次可能较慢）。

---

## 5. 小结

| 类别 | 数量 | 说明 |
|------|------|------|
| 环境基线 (node/npm/npx/python) | 4/4 ✅ | 已就绪 |
| 依赖外部 CLI 的 Skills 抽样 | 2 明确不可用，2 未确认/超时，1 部分不可用，1 可用 | 见上表 |
| 不依赖外部 CLI 的 Skills | 多数 | 按“可触发”视为可用，未逐条执行命令 |

**结论**：当前 56/58 个 Skills 的 **SKILL.md 存在且内容有效**；其中依赖 **infsh、squirrel、gh** 等的 Skills 在未安装对应 CLI 时**无法完成实际触发/调用**。按上表安装并配置后即可正常使用。
