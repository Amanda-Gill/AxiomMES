#!/usr/bin/env node
/**
 * 将未映射的全局 skills 按角色追加到 mappings/*-agent-skills.json
 */
const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../..');
const MAPPINGS_DIR = path.join(ROOT, 'ai-agents/mappings');

const GLOBAL_PREFIX = 'C:/Users/Aiden/.agents/skills/';
const GLOBAL_SUFFIX = '/SKILL.md';
const toPath = (name) => GLOBAL_PREFIX + name + GLOBAL_SUFFIX;

// 未映射的全局 skill 名称 -> 要追加到的 { "文件名": [ "代理id", ... ] }
const UNMAPPED_ADDITIONS = {
  'agent-browser': { 'testing-agent-skills.json': ['api-tester', 'tool-evaluator'] },
  'agent-tools': { 'engineering-agent-skills.json': ['backend-architect', 'ai-engineer'] },
  'audit-website': { 'marketing-agent-skills.json': ['growth-hacker', 'app-store-optimizer'], 'design-agent-skills.json': ['ui-designer'] },
  'before-and-after': { 'testing-agent-skills.json': ['api-tester'], 'project-management-agent-skills.json': ['project-shipper'] },
  'dispatching-parallel-agents': { 'engineering-agent-skills.json': ['ai-engineer', 'devops-automator'], 'project-management-agent-skills.json': ['studio-producer', 'project-shipper'] },
  'enhance-prompt': { 'design-agent-skills.json': ['ui-designer', 'ux-researcher'] },
  'executing-plans': { 'project-management-agent-skills.json': ['project-shipper', 'experiment-tracker'], 'product-agent-skills.json': ['sprint-prioritizer'] },
  'finding-duplicate-functions': { 'engineering-agent-skills.json': ['frontend-developer', 'backend-architect', 'ai-engineer'] },
  'find-skills': { 'project-management-agent-skills.json': ['studio-producer'] },
  'json-render-core': { 'engineering-agent-skills.json': ['frontend-developer', 'rapid-prototyper'] },
  'json-render-react': { 'engineering-agent-skills.json': ['frontend-developer', 'rapid-prototyper'] },
  'receiving-code-review': { 'engineering-agent-skills.json': ['frontend-developer', 'backend-architect', 'mobile-app-builder', 'ai-engineer'] },
  'remembering-conversations': { 'product-agent-skills.json': ['feedback-synthesizer'], 'project-management-agent-skills.json': ['studio-producer'] },
  'requesting-code-review': { 'engineering-agent-skills.json': ['frontend-developer', 'backend-architect', 'mobile-app-builder', 'ai-engineer'], 'project-management-agent-skills.json': ['project-shipper'] },
  'skill-creator': { 'project-management-agent-skills.json': ['studio-producer'] },
  'test-driven-development': { 'testing-agent-skills.json': ['api-tester', 'performance-benchmarker', 'test-results-analyzer', 'workflow-optimizer', 'tool-evaluator'], 'engineering-agent-skills.json': ['frontend-developer', 'backend-architect', 'mobile-app-builder', 'ai-engineer'] },
  'theme-factory': { 'design-agent-skills.json': ['ui-designer', 'brand-guardian', 'visual-storyteller'] },
  'verification-before-completion': { 'testing-agent-skills.json': ['api-tester', 'performance-benchmarker', 'test-results-analyzer', 'workflow-optimizer', 'tool-evaluator'], 'engineering-agent-skills.json': ['devops-automator'], 'project-management-agent-skills.json': ['project-shipper'] },
  'writing-skills': { 'project-management-agent-skills.json': ['studio-producer'], 'marketing-agent-skills.json': ['content-creator'] },
  'using-superpowers': { 'project-management-agent-skills.json': ['studio-producer'] },
};

// 收集：每个 (file, agentId) 要追加的 skill 路径
const byFileAgent = {};
for (const [skillName, fileAgents] of Object.entries(UNMAPPED_ADDITIONS)) {
  const pathStr = toPath(skillName);
  for (const [file, agentIds] of Object.entries(fileAgents)) {
    for (const aid of agentIds) {
      const key = `${file}\0${aid}`;
      if (!byFileAgent[key]) byFileAgent[key] = [];
      byFileAgent[key].push(pathStr);
    }
  }
}

// 按文件分组
const byFile = {};
for (const key of Object.keys(byFileAgent)) {
  const [file, agentId] = key.split('\0');
  if (!byFile[file]) byFile[file] = {};
  byFile[file][agentId] = byFileAgent[key];
}

for (const [fileName, agentSkills] of Object.entries(byFile)) {
  const filePath = path.join(MAPPINGS_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.warn('Skip (not found):', fileName);
    continue;
  }
  const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const agents = data.agents || {};
  let added = 0;
  for (const [agentId, newPaths] of Object.entries(agentSkills)) {
    if (!agents[agentId] || !Array.isArray(agents[agentId].skills)) continue;
    const set = new Set(agents[agentId].skills);
    for (const p of newPaths) {
      if (!set.has(p)) {
        set.add(p);
        added++;
      }
    }
    agents[agentId].skills = [...set];
  }
  if (added) {
    fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
    console.log(fileName, 'added', added, 'skill refs');
  }
}
console.log('Done.');
