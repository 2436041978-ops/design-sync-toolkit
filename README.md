# Design Sync Toolkit

> 设计意图的 YAML 形式化表达与轻量级同步工具包

## 问题定义：语义漂移

在跨团队协作中，设计意图往往以非结构化方式传递（口头、文档、IM 消息），导致：

- **信息衰减**：原始意图在传递过程中逐渐失真
- **标准缺失**：无统一格式规范，难以机器解析
- **追踪困难**：无法追溯意图变更历史和审批留痕
- **交付偏差**：最终产出与原始意图存在偏差

Design Sync Toolkit 通过 YAML 形式化表达 + 三层轻量框架，解决上述问题。

## 三层轻量框架

| 层级 | 职责 | 对应 CLI 命令 |
|------|------|--------------|
| **输入层** | 需求录入 + 格式预检 | `design-sync check` |
| **校验层** | Schema 合规检查 + 批量扫描报告 | `design-sync report` |
| **输出层** | 交付追踪 + 遗留问题清理 | `design-sync debt` |

## 零代码快速开始

```bash
# 安装
npm install -g design-sync-toolkit

# 1. 创建设计意图文件（任意文本编辑器）
# intent.yaml
intent_id: "R001"
description: "用户登录流程优化"
layer: "input"
priority: "P0"
ownership:
  design: "Alice"
  product: "Bob"
status: "draft"
created_at: "2024-01-01"
updated_at: "2024-01-01"
version: "1.0.0"
dependencies: []
acceptance_criteria:
  - "3步完成登录"
tags: ["login", "ux"]

# 2. 校验格式
design-sync check intent.yaml
# ✅ 格式合规

# 3. 批量扫描目录
design-sync report ./intents/

# 4. 追踪技术债务
design-sync debt add "响应时间优化" --owner "Alice"
design-sync debt list
```

详细指南请查看 [docs/QUICKSTART.md](docs/QUICKSTART.md)。

## 核心文件结构

```
design-sync-toolkit/
├── core/                          # 内核层
│   ├── baseline-format.json       # 基线格式 JSON Schema
│   ├── format-validator.ts        # 格式校验器 (AJV)
│   ├── input-checker.ts           # 输入预检
│   ├── sync-transformer.ts        # 转换引擎 (YAML → JSON / Design Tokens)
│   ├── sync-coordinator.ts        # 同步协调器
│   └── index.ts                   # 内核统一导出
├── presets/cli/                   # CLI 工具入口
│   ├── index.ts                   # CLI 主入口 (commander)
│   ├── check.ts                   # check 子命令
│   ├── report-generator.ts        # report 子命令
│   └── debt-tracker.ts            # debt 子命令
├── docs/                          # 文档
│   └── QUICKSTART.md              # 零代码快速开始
├── tests/                         # 测试
│   └── unit/                      # 单元测试
└── package.json                   # npm 包配置
```

## 核心 API

```typescript
import { FormatValidator, SyncCoordinator } from 'design-sync-toolkit';

// 格式校验
const validator = new FormatValidator();
const result = validator.validate(yamlContent);
// { valid: true } 或 { valid: false, errors: [...] }

// 协调处理多个文件
const coordinator = new SyncCoordinator();
const results = coordinator.coordinate(['file1.yaml', 'file2.yaml']);
```

## Gap 期局限性声明（v0.1.0）

> **当前版本基于推演数据集验证，尚未接入真实生产环境。**
>
> 已知局限：
> - 校验规则基于基线 Schema，实际业务场景可能需要扩展
> - 企业工具链集成（华为系/阿里系/字节系）为占位状态
> - 审批留痕机制依赖本地 JSON 存储，未对接企业 SSO
> - 批量报告生成暂未支持自定义模板
>
> v0.2.0 计划：支持自定义 Schema 扩展、远程存储适配、CI/CD 插件

## License

Apache-2.0 © Design Sync Team
