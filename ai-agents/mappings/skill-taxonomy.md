# 技能分类说明 / Skill Taxonomy

本文档说明 `ai-agents/skills/` 下的技能分类与代理-技能关联逻辑。

## 1. 目录结构

```
skills/
├── technical/          # 技术类（对应工程类代理）
│   ├── coding/        # 编码：语言、API、前端
│   ├── devops/        # 运维：容器、CI/CD、云
│   └── testing/      # 测试：单元、接口、性能
├── product/           # 产品类（对应产品类代理）
├── marketing/         # 营销类（对应营销类代理）
├── design/            # 设计类（对应设计类代理）
└── common/            # 通用技能（所有代理共享）
```

## 2. 分类含义

| 分类 | 说明 | 典型代理 |
|------|------|----------|
| **technical** | 开发、运维、测试相关能力 | frontend-developer, backend-architect, devops-automator, api-tester |
| **product** | 需求、故事、规划、市场研究 | trend-researcher, feedback-synthesizer, sprint-prioritizer |
| **marketing** | 内容、社媒、SEO、增长分析 | content-creator, growth-hacker, tiktok-strategist |
| **design** | UI/UX、品牌、原型 | ui-designer, ux-researcher, brand-guardian |
| **common** | 沟通、问题解决、文档、批判性思维 | 所有代理均可引用 |

## 3. 代理-技能映射

- **engineering-agent-skills.json**：工程类代理（前端、后端、移动端、AI、DevOps、快速原型）与 `technical/*`、部分 `design/*`、`common/*` 的映射。
- **marketing-agent-skills.json**：营销类代理与 `marketing/*`、部分 `design/*`、`common/*` 的映射。
- **product-agent-skills.json**：产品类代理与 `product/*`、`common/*` 的映射。
- **design-agent-skills.json**：设计类代理与 `design/*`、部分 `marketing/*`、`common/*` 的映射。
- **testing-agent-skills.json**：测试类代理（api-tester、performance-benchmarker、test-results-analyzer、workflow-optimizer、tool-evaluator）与 `technical/testing/*`、`common/*` 的映射。
- **project-management-agent-skills.json**：项目管理类代理与 `common/*` 及办公类全局技能的映射。
- **studio-operations-agent-skills.json**：工作室运营类代理（analytics-reporter、finance-tracker、infrastructure-maintainer、legal-compliance-checker、support-responder）与 `common/*`、`technical/devops/*` 及办公/合规类全局技能的映射。

## 4. 使用方式

- **调度代理**：根据任务类型选择代理，再按映射加载对应技能文件作为上下文。
- **扩展技能**：在对应分类下新增 `.md`，再在相应映射 JSON 中为代理补充 `skills` 路径。
- **扩展代理**：在 `agents/` 下新增代理定义，并在 `mappings/` 中为其配置 `skills` 数组。

## 5. 路径约定

- 映射中的技能路径为相对 `ai-agents/` 的路径，例如：`skills/technical/coding/python-coding.md`。
- 加载时建议以项目根解析为绝对路径，避免歧义。

## 6. 未映射全局 Skills 的按角色配置

原先未在 mappings 中引用的全局 skills（如 agent-browser、audit-website、test-driven-development、theme-factory 等）已通过脚本 `ai-agents/scripts/add-unmapped-skills.js` 按角色追加到对应 JSON 中；后续若安装新全局 skill，可在该脚本的 `UNMAPPED_ADDITIONS` 中配置「skill 名 → 文件名与代理 id」，再运行脚本即可批量写入。
