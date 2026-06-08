# ⚠️ 本项目已归档（Archived）

这是我在 Gap Year 期间的早期实验，探索"设计规范如何轻量同步"。
相关思考已演进并融入 [Schema-As-Code](链接) 体系。
本仓库不再维护，保留仅供历史参考。

<p align="center">
  <h1 align="center">Design Sync Toolkit 设计规范同步工具包</h1>
  <p align="center">面向体验设计团队的轻量级设计规范同步工具集</p>
  <p align="center">
    <img src="https://img.shields.io/npm/v/design-sync-toolkit.svg" alt="npm version" />
    <img src="https://img.shields.io/badge/lint-passing-brightgreen" alt="lint" />
    <img src="https://img.shields.io/badge/CI-passing-brightgreen" alt="CI" />
    <img src="https://img.shields.io/badge/coverage-85%25-brightgreen" alt="coverage" />
    <img src="https://img.shields.io/badge/node-%3E%3D18.0.0-blue" alt="node" />
    <img src="https://img.shields.io/badge/license-MIT-blue" alt="license" />
  </p>
</p>

---

> ⚠️ **重要声明与免责声明**
>
> 本项目为 Gap Year 期间的个人独立预研项目，基于公开设计系统研究与行业最佳实践总结，不代表任何企业官方立场。所有涉及的企业案例、工具链名称均为泛化处理，不指向特定产品或组织。工具集中的方法论参考了行业通用设计规范框架，仅供学习交流与实验探索使用。
>
> 本项目采用 MIT 开源协议，代码和文档均按"原样"提供，作者不对因使用本项目而产生的任何直接或间接损失承担责任。

---

## 目录

- [一、为什么需要这个工具](#一为什么需要这个工具)
- [二、核心定位](#二核心定位)
- [三、三步轻量工作流](#三三步轻量工作流)
- [四、目录结构](#四目录结构)
- [五、快速开始](#五快速开始)
- [六、核心功能详解](#六核心功能详解)
  - [6.1 基线检查（SMART 原则）](#61-基线检查smart-原则)
  - [6.2 AI 内容分级检查](#62-ai-内容分级检查)
  - [6.3 质量门禁](#63-质量门禁)
  - [6.4 偏差追踪](#64-偏差追踪)
- [七、企业级预设方案](#七企业级预设方案)
  - [7.1 严谨流程型](#71-严谨流程型)
  - [7.2 平衡协作型](#72-平衡协作型)
  - [7.3 敏捷迭代型](#73-敏捷迭代型)
- [八、渐进采用路径](#八渐进采用路径)
- [九、局限性与诚实声明](#九局限性与诚实声明)
- [十、Roadmap](#十roadmap)
- [贡献指南](#贡献指南)
- [许可证](#许可证)

---

## 一、为什么需要这个工具

在体验设计团队协作中，我们反复遇到三个核心痛点：

### 痛点一：需求输入即漂移

> 产品 PRD 写着"一键登录"，设计稿画了 7 个步骤。评审时大家面面相觑："这不是同一个需求吧？"

需求从文字到设计稿的转化过程中，设计者基于自己的理解进行"创造性发挥"，导致最终产出与原始需求存在系统性偏差。更隐蔽的是，这类偏差往往在评审环节才被发现，此时已产生大量返工成本。

### 痛点二：AI 加速但不守规矩

> "让 AI 帮我生成一个登录流程"——30 秒后，你得到了一个包含指纹+人脸+短信+邮箱的 12 步注册流程，还贴心地加了一个用户协议勾选框。

AI 工具在提升效率的同时，也带来了"合规幻觉"问题：模型倾向于生成"看起来完整"的内容，但这些内容往往与团队的实际规范相冲突。没有前置检查，AI 产出直接进入设计稿，规范形同虚设。

### 痛点三：规范挂在墙上，不在流程里

> 设计系统文档 300 页，评审时 still 有人用被废弃的配色方案。规范没有被"注入"工作流程，而是作为"参考文档"存在——看与不看全凭自觉。

传统的设计规范以文档形式存在，缺乏与工程流程的耦合。规范是否被遵守，依赖于人的记忆和自觉，而非流程的强制约束。这导致规范的执行率随时间推移而持续衰减。

---

## 二、核心定位

| 我们不是 | 我们是 |
|---------|--------|
| 一个完整的设计系统 | 设计系统的"安检仪"和"校准器" |
| 替代设计师决策的 AI 工具 | 在 AI 输出进入流程前进行合规校验的把关人 |
| 一套强制性的企业制度 | 一套可以渐进采用、按需启用的轻量工具集 |
| 面向专业开发者的复杂框架 | 面向体验设计师的、能读懂报错信息的友好工具 |
| 需要庞大基础设施支持的平台 | 一个 npm install 就能用的命令行工具 |

---

## 三、三步轻量工作流

### Step 1：基线结构化（冻结核弹）

将需求文档转化为结构化的设计基线（`requirement.md`），包含 SMART 五要素：

- **S**pecific（具体）：做什么，不做什么
- **M**easurable（可衡量）：指标是什么，目标值是多少
- **A**chievable（可实现）：在现有约束下能否完成
- **R**elevant（相关）：与业务目标的关联
- **T**ime-bound（有时限）：何时完成

基线一旦确认即进入"冻结"状态，后续所有设计产出以此为准绳。

### Step 2：内容分级管控（红绿灯机制）

对 AI 生成内容进行三级管控：

| 级别 | 含义 | 处理方式 |
|-----|------|---------|
| 🟢 绿灯 | 明确允许的内容 | 直接通过，无需人工复核 |
| 🟡 黄灯 | 需要谨慎评估的内容 | 人工确认后可通过，需记录理由 |
| 🔴 红灯 | 明确禁止的内容 | 阻断流程，必须修改后才能继续 |

### Step 3：门禁自动化（CI 集成）

将基线检查和内容分级嵌入 CI/CD 流水线：

1. 设计师提交设计稿/代码 → 自动触发 `dsc check`
2. 检查通过 → 流程继续
3. 检查失败 → 生成偏差报告，阻断合并
4. 如需例外 → 走偏差登记流程，记录理由并审批

---

## 四、目录结构

```
design-sync-toolkit/
├── core/                        # 核心引擎（架构核心）
│   ├── index.ts                 # 内核入口
│   ├── baseline-format.json     # 基线格式规范
│   ├── input-checker.ts         # 输入预检（SMART检查）
│   ├── format-validator.ts      # 格式校验器
│   ├── sync-coordinator.ts      # 同步协调器
│   └── sync-transformer.ts      # 转换引擎
├── presets/                     # 预设与工具入口
│   ├── cli/                     # 命令行工具
│   │   ├── index.ts             # CLI 主入口
│   │   ├── check.ts             # 检查命令
│   │   ├── debt-tracker.ts      # 债务追踪
│   │   └── report-generator.ts  # 报告生成
│   ├── conservative-workflow/   # 严谨流程型预设
│   ├── balanced-workflow/       # 平衡协作型预设
│   └── agile-workflow/          # 敏捷迭代型预设
├── docs/
│   └── QUICKSTART.md            # 快速开始指南
├── tests/
│   └── unit/
│       └── format-validator.test.ts  # 单元测试样例
├── package.json
├── tsconfig.json
├── jest.config.js
├── LICENSE
├── README.md
└── .gitignore
```

> **完整版下载**：适配器源码、完整文档、CI 配置等详见 [Release 附件](https://github.com/your-org/design-sync-toolkit/releases) `design-sync-toolkit-v0.4.0-full.zip`

---

## 五、快速开始

### 安装

```bash
# 全局安装
npm install -g design-sync-toolkit

# 或在项目中安装
npm install --save-dev design-sync-toolkit
```

### 1 分钟验证

```bash
# 创建一个测试基线文件
cat > requirement.md << 'EOF'
# 登录流程基线

## SMART 检查项

- **具体**：实现手机号一键登录功能，支持本机号码自动识别
- **可衡量**：登录成功率 ≥ 99%，平均耗时 ≤ 3 秒
- **可实现**：基于现有运营商 SDK 能力，技术团队已评估可行
- **相关**：支撑 Q3 用户增长目标，降低注册流失率
- **有时限**：2024-08-15 前完成设计评审，2024-08-30 前上线
EOF

# 运行检查
dsc check requirement.md

# 你应该看到类似输出：
# ✓ SMART: 具体 (S) - 通过
# ✓ SMART: 可衡量 (M) - 通过
# ✓ SMART: 可实现 (A) - 通过
# ✓ SMART: 相关 (R) - 通过
# ✓ SMART: 有时限 (T) - 通过
# ✓ 基线冻结状态：已冻结
# ✓ 禁用词扫描：通过
# ─────────────────────────────
# 检查结果：全部通过 ✅
```

### 5 分钟接入 CI

在 `package.json` 中添加脚本：

```json
{
  "scripts": {
    "design:check": "dsc check requirement.md",
    "design:report": "dsc report --output=design-report.html"
  }
}
```

在 CI 配置中添加步骤：

```yaml
# .github/workflows/ci.yml
- name: Design Baseline Check
  run: npm run design:check
- name: Generate Design Report
  run: npm run design:report
```

---

## 六、核心功能详解

### 6.1 基线检查（SMART 原则）

SMART 检查引擎对每个检查项进行五维度评估：

| 维度 | 检查内容 | 通过标准 | 失败示例 |
|-----|---------|---------|---------|
| **S** 具体 | 是否明确描述了"做什么"和"不做什么" | 包含明确的功能边界描述 | "做一个登录功能" |
| **M** 可衡量 | 是否定义了量化的成功指标 | 包含可测量的指标和目标值 | "体验要好" |
| **A** 可实现 | 是否在现有约束下可行 | 有技术可行性评估或引用 | "登录速度达到 0.001 秒" |
| **R** 相关 | 是否与业务目标对齐 | 明确关联到业务 OKR/目标 | "因为竞品都做了" |
| **T** 有时限 | 是否定义了明确的截止日期 | 包含具体的日期或里程碑 | "尽快完成" |

### 6.2 AI 内容分级检查

```bash
# 扫描 AI 生成内容中的黄灯/红灯词
dsc check --mode=strict ai-generated-content.md
```

分级规则配置示例：

```json
{
  "greenWords": ["本机号码识别", "一键授权", "隐私协议"],
  "yellowWords": ["生物特征", "第三方登录", "个性化推荐"],
  "redWords": ["强制收集", "过度授权", "隐私豁免", "绕过审核"]
}
```

### 6.3 质量门禁

支持两种工作模式：

| 模式 | 行为 | 适用场景 |
|-----|------|---------|
| `warn` | 检查失败时输出警告但不阻断流程 | 试运行阶段、已有项目迁移期 |
| `strict` | 检查失败时返回非零退出码，阻断 CI | 正式发布阶段、关键路径 |

```bash
# warn 模式（默认）
dsc check --mode=warn requirement.md
# 检查失败时退出码 = 0，输出警告信息

# strict 模式
dsc check --mode=strict requirement.md
# 检查失败时退出码 = 1，阻断 CI 流程
```

### 6.4 偏差追踪

当基线需要调整时，通过偏差登记流程记录：

```bash
# 登记偏差
dsc debt-tracker add \
  --baseline=requirement.md \
  --reason="业务目标调整，登录流程需支持多账号切换" \
  --impact="设计稿需增加账号管理模块，预计延期 3 天"

# 查看偏差清单
dsc debt-tracker list

# 生成偏差报告
dsc debt-tracker report --output=debt-report.md
```

偏差追踪的核心价值：
- **可追溯**：每一次偏离基线都有记录和理由
- **可度量**：统计偏差频率和原因分布
- **可复盘**：定期回顾偏差数据，优化基线质量

---

## 七、企业级预设方案

### 7.1 严谨流程型（conservative-workflow）

适配强管控设计体系，适合金融、医疗等对合规要求极高的行业。

| 特性 | 配置 |
|-----|------|
| 检查点 | concept-review → design-review → dev-review → release-review |
| 失败策略 | 任何 SMART 缺失即阻断 |
| 基线冻结 | 强制冻结，解冻需审批 |
| 适配器 | 企业级 CI 平台集成 |

```bash
# 使用严谨流程预设
dsc check --preset=conservative-workflow requirement.md
```

### 7.2 平衡协作型（balanced-workflow）

适配中型团队协作，在规范性和灵活性之间取得平衡。

| 特性 | 配置 |
|-----|------|
| 检查点 | mid-platform-review → business-review → design-review → dev-review |
| 失败策略 | SMART 缺失警告，红灯词阻断 |
| 基线冻结 | 建议冻结，允许弹性调整 |
| 适配器 | 知识库同步 |

```bash
# 使用平衡协作预设
dsc check --preset=balanced-workflow requirement.md
```

### 7.3 敏捷迭代型（agile-workflow）

适配快速迭代团队，最小化流程阻力。

| 特性 | 配置 |
|-----|------|
| 检查点 | sprint-planning → design-review → dev-review → sprint-retro |
| 失败策略 | 仅红灯词阻断，其余为警告 |
| 基线冻结 | 不强制冻结，鼓励迭代更新 |
| 适配器 | 数据库同步、消息卡片推送 |

```bash
# 使用敏捷迭代预设
dsc check --preset=agile-workflow requirement.md
```

---

## 八、渐进采用路径

| 阶段 | 目标 | 行动 | 耗时 | 人数 |
|-----|------|-----|------|------|
| 1. 个人试用 | 验证工具可用性 | 安装并对自己负责的需求运行 `dsc check` | 30 分钟 | 1 |
| 2. 搭档验证 | 确认检查规则合理 | 与搭档互相检查对方的基线文件 | 1 小时 | 2 |
| 3. 小组植入 | 在小范围内建立习惯 | 在小组周会上分享检查结果，收集反馈 | 1 周 | 3-5 |
| 4. 轻量制度 | 形成最小流程闭环 | 将 `dsc check` 加入小组内审清单 | 2 周 | 5-10 |
| 5. CI 接入 | 自动化检查 | 在 CI 配置中加入 `dsc check` 步骤 | 1 天 | 团队 |
| 6. 平台集成 | 与企业工具链打通 | 配置适配器，同步检查结果到知识库 | 1 周 | 团队 |

> 💡 **建议**：每个阶段确认效果后再进入下一阶段。不要一次性全面推行，让团队有时间适应新的工作方式。

---

## 九、局限性与诚实声明

| 局限 | 说明 | 应对建议 |
|-----|------|---------|
| 无法替代专业判断 | 工具只能检查"有没有"，不能判断"好不好" | 将工具作为辅助，保留人工评审环节 |
| 规则维护成本 | 禁用词库和规则需要持续更新 | 建立规则维护责任人，每季度评审一次 |
| 误报可能 | 某些专业术语可能触发误报 | 使用 `--ignore` 参数或更新白名单 |
| 仅覆盖文本基线 | 无法直接检查设计稿源文件 | 配合设计平台 API 进行扩展 |
| 语言支持有限 | 当前主要优化中文场景 | 英文场景可用但体验未充分打磨 |
| 不保证 100% 合规 | 工具是最后一道防线而非唯一防线 | 结合法务/合规团队的专业审查 |

---

## 十、Roadmap

| 版本 | 目标 | 里程碑 |
|-----|------|--------|
| v0.1 | 概念验证 | SMART 检查器基本功能，命令行接口 |
| v0.2 | 核心闭环 | 偏差追踪、报告生成、红绿灯分级 |
| v0.3 | 预设体系 | 三种预设方案、CI 适配器 |
| **v0.4** | **当前：体验打磨** | **文档完善、示例丰富、配置简化** |
| v0.5 | 生态对接 | 主流设计平台 API 集成 |
| v0.6 | 智能化 | AI 辅助基线生成、规则推荐 |
| v0.7 | 度量体系 | 团队合规仪表盘、趋势分析 |
| v0.8 | 多语言 | 完整英文支持、国际化 |
| v0.9 | 企业特性 | SSO、审计日志、权限管理 |
| v1.0 | 正式版 | API 稳定、文档完备、生产就绪 |

---

## 贡献指南

欢迎参与 Design Sync Toolkit 的开发！详情请参见 [CONTRIBUTING.md](./CONTRIBUTING.md)。

### 快速参与

```bash
# Fork 并克隆仓库
git clone https://github.com/your-org/design-sync-toolkit.git
cd design-sync-toolkit

# 安装依赖
npm install

# 运行测试
npm test

# 创建分支并提交 PR
git checkout -b feat/your-feature
```

---

## 许可证

本项目采用 [MIT License](./LICENSE) 开源协议。

---

<p align="center">
  用 ❤️ 和 🧠 为体验设计团队构建
</p>
