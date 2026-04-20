# 贡献指南

## 开发环境搭建

```bash
# 克隆仓库
git clone https://github.com/your-org/design-sync-toolkit.git
cd design-sync-toolkit

# 安装依赖
npm install

# 运行测试
npm test

# 构建
npm run build
```

## 代码规范

- TypeScript 严格模式
- 所有导出函数必须有 JSDoc 注释
- 使用 `npm run lint` 检查代码风格

## 提交信息规范

遵循 [Conventional Commits](https://www.conventionalcommits.org/zh-hans/v1.0.0/)：

- `feat:` 新功能
- `fix:` 修复
- `docs:` 文档
- `test:` 测试
- `refactor:` 重构
- `chore:` 构建/工具

## 测试要求

- 新增功能必须附带单元测试
- 覆盖率需维持 80% 以上

## PR 流程

1. Fork 仓库并创建特性分支
2. 确保 `npm test` 通过
3. 提交 PR 并描述变更内容
