#!/usr/bin/env node
/**
 * 检查 skills 能否按角色正常调用
 * - 校验所有 mapping JSON
 * - 校验映射中的代理是否有对应 agents/*.md
 * - 校验项目内技能路径 (skills/...) 是否存在
 * - 列出未配置技能映射的代理
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const MAPPINGS_DIR = path.join(ROOT, 'ai-agents/mappings');
const AGENTS_DIR = path.join(ROOT, 'ai-agents/agents');
const SKILLS_DIR = path.join(ROOT, 'ai-agents/skills');

const MAPPING_FILES = [
  'engineering-agent-skills.json',
  'design-agent-skills.json',
  'marketing-agent-skills.json',
  'product-agent-skills.json',
  'testing-agent-skills.json',
  'project-management-agent-skills.json',
  'studio-operations-agent-skills.json',
];

function collectAgentMdFiles(dir, base = '') {
  const result = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const rel = base ? `${base}/${e.name}` : e.name;
    if (e.isDirectory() && e.name !== 'README.md') {
      result.push(...collectAgentMdFiles(path.join(dir, e.name), rel));
    } else if (e.isFile() && e.name.endsWith('.md') && e.name !== 'README.md') {
      result.push(rel.replace(/\.md$/, ''));
    }
  }
  return result;
}

function main() {
  const errors = [];
  const agentsInMappings = new Set();
  const agentMdFiles = new Set();
  const projectSkillPaths = new Set();

  // 收集所有 agents/*.md 对应的 id（目录/子目录/文件名）
  function addAgentIds(agentsDir, prefix = '') {
    const entries = fs.readdirSync(agentsDir, { withFileTypes: true });
    for (const e of entries) {
      const name = e.name;
      if (e.isDirectory()) {
        addAgentIds(path.join(agentsDir, name), prefix ? `${prefix}/${name}` : name);
      } else if (e.isFile() && name.endsWith('.md') && name !== 'README.md') {
        const id = (prefix ? prefix + '/' : '') + name.replace(/\.md$/, '');
        agentMdFiles.add(id);
        // 也按 "category/agent-name" 形式存，mapping 里用的是 "agent-name"
        const parts = id.split('/');
        if (parts.length >= 2) agentMdFiles.add(parts[parts.length - 1]);
      }
    }
  }
  if (fs.existsSync(AGENTS_DIR)) addAgentIds(AGENTS_DIR);

  // 收集项目内技能文件（相对 ai-agents 的路径 skills/...）
  function addSkillPaths(skillsDir, base = '') {
    if (!fs.existsSync(skillsDir)) return;
    const entries = fs.readdirSync(skillsDir, { withFileTypes: true });
    for (const e of entries) {
      const rel = base ? `${base}/${e.name}` : e.name;
      if (e.isDirectory()) {
        addSkillPaths(path.join(skillsDir, e.name), rel);
      } else if (e.isFile() && e.name.endsWith('.md')) {
        projectSkillPaths.add('skills/' + rel);
      }
    }
  }
  addSkillPaths(SKILLS_DIR);

  console.log('=== 1. 映射文件与代理一致性 ===\n');

  for (const file of MAPPING_FILES) {
    const filePath = path.join(MAPPINGS_DIR, file);
    if (!fs.existsSync(filePath)) {
      errors.push(`映射文件不存在: ${file}`);
      continue;
    }
    let data;
    try {
      data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    } catch (e) {
      errors.push(`${file}: JSON 解析失败 - ${e.message}`);
      continue;
    }
    const agents = data.agents || {};
    for (const [agentId, config] of Object.entries(agents)) {
      agentsInMappings.add(agentId);
      const skills = config.skills || [];
      for (const skillPath of skills) {
        if (skillPath.startsWith('skills/')) {
          const fullPath = path.join(ROOT, 'ai-agents', skillPath);
          if (!fs.existsSync(fullPath)) {
            errors.push(`[${file}] 代理 "${agentId}" 引用的项目技能不存在: ${skillPath}`);
          }
        }
        // 绝对路径 C:/Users/... 不在此仓库校验
      }
    }
  }

  console.log('已配置技能映射的代理数量:', agentsInMappings.size);
  console.log('项目内技能路径校验: 仅检查 skills/*.md，见下方错误列表（无则通过）\n');

  // 有 agents/*.md 但未在任何 mapping 中出现的代理
  const agentIdsFromFiles = new Set();
  function collectAgentIdsFromFiles(dir, prefix = '') {
    if (!fs.existsSync(dir)) return;
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const e of entries) {
      const name = e.name;
      if (e.isDirectory()) {
        collectAgentIdsFromFiles(path.join(dir, name), prefix ? `${prefix}/${name}` : name);
      } else if (e.isFile() && name.endsWith('.md') && name !== 'README.md') {
        const id = name.replace(/\.md$/, '');
        agentIdsFromFiles.add(id);
      }
    }
  }
  collectAgentIdsFromFiles(AGENTS_DIR);

  const missingMapping = [...agentIdsFromFiles].filter((id) => !agentsInMappings.has(id));

  console.log('=== 2. 未配置技能映射的代理（有角色定义但无 mapping）===');
  if (missingMapping.length) {
    console.log('以下代理在 agents/ 下有 .md 定义，但未出现在任何 *-agent-skills.json 中：');
    missingMapping.forEach((id) => console.log('  -', id));
    console.log('');
  } else {
    console.log('无，所有代理均已配置映射。\n');
  }

  console.log('=== 3. 错误汇总 ===');
  if (errors.length) {
    errors.forEach((e) => console.log('  ', e));
  } else {
    console.log('  无错误。项目内技能路径均存在，JSON 有效。');
  }

  console.log('\n=== 4. 按角色调用的前提 ===');
  console.log('  - 调度方需根据「角色/代理 ID」选择对应的 mapping 文件（如 engineering-agent-skills.json）。');
  console.log('  - 再根据该代理的 skills 数组加载：');
  console.log('    1) 项目内路径：解析为 <项目根>/ai-agents/<path>；');
  console.log('    2) 绝对路径：直接读取（如 C:/Users/.../.agents/skills/...）。');
  console.log('  - 本仓库内未包含「调度/加载」实现，需由 Cursor 规则、外部调度器或脚本按上述约定加载。');

  process.exit(errors.length ? 1 : 0);
}

main();
