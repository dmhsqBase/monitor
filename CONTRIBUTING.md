# 贡献指南

感谢您考虑为 Monitor 项目做出贡献！

## 开发环境设置

1. Fork 这个仓库
2. 克隆你的 fork 到本地
3. 安装依赖:

```bash
pnpm install
```

## 开发工作流程

1. 确保在最新的 `main` 分支上创建新分支
2. 进行你的更改
3. 在提交之前运行测试和构建:

```bash
pnpm test
pnpm build
```

4. 提交你的更改 (参考 [约定式提交](https://www.conventionalcommits.org/zh-hans/v1.0.0/))
5. 推送到你的 fork
6. 提交 Pull Request

## 项目结构

```
monitor/
├── packages/
│   ├── utils/           # 工具库
│   ├── core/            # 核心库
│   ├── processor/       # 加工库
│   ├── collector/       # 采集库
│   └── notifier/        # 通知库
├── ...
```

## 代码风格

- 遵循 TypeScript 标准
- 使用 ES6+ 语法
- 添加适当的注释和文档

## 添加新功能

如果你想添加新功能:

1. 先讨论该功能的需求和设计
2. 确定该功能应该放在哪个包中
3. 实现该功能并添加测试
4. 更新文档

## 提交 Pull Request

1. 更新相关包中的 `README.md` 以反映你的更改
2. 更新文档，如果适用
3. 你的 PR 应该包含测试，以确保代码质量

感谢您的贡献！ 