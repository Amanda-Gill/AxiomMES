# 不可用 Skills 解决方案

依赖外部 CLI 的 Skills 在未安装对应工具时会「不可用」。可按下面三种方式处理：**安装依赖**、**用 npx 替代**、**移除或禁用**。

---

## 方案一：安装依赖（推荐，需要用到该能力时）

### 1. agent-tools / python-executor → 安装 inference.sh CLI（infsh）

**作用**：跑 AI 应用（图像/视频/LLM）、云端执行 Python 等。

**安装（Windows PowerShell，需 WSL 或 Git Bash 执行 curl/sh）：**

```powershell
# 若已装 Git for Windows，在 Git Bash 中执行：
# curl -fsSL https://cli.inference.sh | sh

# 或用 PowerShell 下载后手动安装（见下方）
```

**无 curl 时（PowerShell）：**

1. 打开 [inference.sh 安装页](https://inference.sh) 或 [dist.inference.sh/cli](https://dist.inference.sh/cli)，下载 Windows 对应架构的压缩包。
2. 解压得到 `infsh`（或 `infsh.exe`），放到某目录（如 `C:\Tools`），将该目录加入系统 PATH。
3. 打开新终端执行：

```powershell
infsh login
```

按提示完成登录后，**agent-tools**、**python-executor** 即可用。

---

### 2. audit-website → 安装 squirrelscan（squirrel）

**作用**：网站 SEO/性能/安全等审计（230+ 规则）。

**安装：**

1. 打开 [squirrelscan.com](https://squirrelscan.com) 或其 GitHub Releases。
2. 下载 Windows 版 `squirrel` CLI，解压到某目录（如 `C:\Tools`）。
3. 将该目录加入系统 **PATH**。

验证：

```powershell
squirrel --version
```

---

### 3. before-and-after / autoship → 安装 GitHub CLI（gh）

**作用**：PR 截图对比、自动发布/变更集等，依赖 `gh`。

**安装（Windows）：**

- 方式 A： [winget install GitHub.cli](https://winget.run/pkg/GitHub/cli)
- 方式 B：从 [cli.github.com](https://cli.github.com/) 下载 MSI 安装。

安装后**重新打开终端**，执行：

```powershell
gh auth login
```

按提示选择 GitHub.com 并完成登录。完成后 **before-and-after** 等依赖 gh 的流程可用；**autoship** 还需配合 `npx autoship` 或全局安装 autoship。

---

### 4. playwright-cli → 用 npx 即可（无需全局安装）

**作用**：浏览器自动化（打开页面、填表、截图等）。

**解决：** 不装全局命令，直接让 Agent 使用：

```bash
npx playwright-cli open https://example.com
npx playwright-cli snapshot
```

若希望全局命令 `playwright-cli` 存在，可：

```powershell
npm install -g playwright-cli
```

并确保 npm 全局 bin 目录在 PATH 中。

---

### 5. agent-browser → 用 npx 即可

**作用**：与 playwright-cli 类似，另一套浏览器自动化 CLI。

**解决：** 使用 npx 调用，首次可能较慢（会下载包）：

```bash
npx agent-browser open https://example.com
npx agent-browser snapshot -i
```

无需单独安装，只要本机 **node/npx** 可用即可。

---

### 6. autoship → 用 npx 或全局安装

**作用**：基于 changeset 的自动发布、npm 发布等。

**解决：**

- 临时使用：`npx autoship <项目名> -t patch -y`
- 常用可全局安装：`npm install -g autoship`，并确保 npm 全局 bin 在 PATH。

依赖 **gh** 的流程需先完成上面的「安装 GitHub CLI」。

---

## 方案二：不安装，仅用 npx（适合偶尔用）

这些 Skill 只要本机有 **node/npx** 即可通过 npx 调用，无需单独安装 CLI：

| Skill | 调用方式 | 说明 |
|-------|----------|------|
| **playwright-cli** | `npx playwright-cli <子命令> ...` | 首次会下载包，稍慢 |
| **agent-browser** | `npx agent-browser <子命令> ...` | 同上 |
| **autoship** | `npx autoship <项目> -t patch -y` | 需已配置仓库且 gh 已登录 |

Agent 在执行这些 Skill 时若使用上述 npx 命令，即可在「不安装全局 CLI」的情况下恢复可用。

---

## 方案三：不需要的 Skill 如何禁用或移除

若某 Skill 暂时不用，又不想安装依赖，可以：

### 方式 A：从全局 skills 中移除（卸载）

```powershell
# 列出已安装的 skill（全局）
npx skills list -g

# 卸载指定 skill（按 CLI 是否支持，示例）
npx skills remove <skill-name> -g
```

具体是否支持 `remove`、参数名以你本机 `npx skills --help` 为准。

### 方式 B：手动从目录中移走（禁用）

Skills 位于：

```
C:\Users\<你的用户名>\.agents\skills\
```

将对应子文件夹**重命名**（例如加后缀 `.disabled`）或**移到别处**，Agent 就不会再加载该 Skill：

```powershell
# 示例：禁用 audit-website（不删除，仅移走）
Rename-Item "C:\Users\Aiden\.agents\skills\audit-website" "audit-website.disabled"
```

需要恢复时再改回原名或移回 `skills` 目录。

### 方式 C：仅项目内不使用（项目 skills）

若使用项目级 skills（`npx skills list` 不带 `-g`），在项目里不添加这些 skill 即可，不影响全局列表。

---

## 快速对照表

| Skill | 推荐解决方式 | 必装依赖 |
|-------|----------------|----------|
| **agent-tools** | 安装 infsh | inference.sh CLI |
| **python-executor** | 安装 infsh | inference.sh CLI |
| **audit-website** | 安装 squirrel 并加 PATH | squirrelscan CLI |
| **playwright-cli** | 用 npx 或 `npm i -g playwright-cli` | node/npx 或全局包 |
| **agent-browser** | 用 npx | node/npx |
| **autoship** | 用 npx 或全局安装 + gh | node/npx，发布流程需 gh |
| **before-and-after** | 安装 gh 并登录 | GitHub CLI (gh) |

---

## 安装后自检

安装完依赖后，在新开终端中执行：

```powershell
# inference.sh
infsh --version

# squirrelscan
squirrel --version

# GitHub CLI
gh --version

# 若装了全局 playwright-cli / autoship
playwright-cli --help
autoship --help
```

全部能输出版本或帮助信息，则对应 Skills 即可正常被触发/调用。
