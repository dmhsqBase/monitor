# 监控系统包更新工具

这个工具用于自动更新、构建和发布监控系统的各个包。

## 功能

- 自动更新所有包的版本号
- 更新各个包中`constants.ts`文件中的版本常量
- 更新包之间的依赖关系
- 构建所有包
- 发布更新后的包到npm

## 使用方法

### 完整更新流程（更新 + 构建 + 发布）

```bash
# 执行默认版本更新 (patch, 如 1.0.1 -> 1.0.2)
./update-and-publish.js

# 指定版本更新类型
./update-and-publish.js patch  # 补丁版本 (x.y.z -> x.y.z+1)
./update-and-publish.js minor  # 次要版本 (x.y.z -> x.y+1.0)
./update-and-publish.js major  # 主要版本 (x.y.z -> x+1.0.0)
```

### 仅更新版本（不构建和发布）

如果只需要更新版本号和依赖关系，但不需要构建和发布，可以使用：

```bash
# 执行默认版本更新 (patch)
./update-versions.js

# 指定版本更新类型
./update-versions.js patch
./update-versions.js minor
./update-versions.js major
```

### 使用GitHub Actions自动发布

项目配置了GitHub Actions用于自动构建和发布包。发布流程如下：

1. 使用提供的脚本更新版本号：
   ```bash
   ./update-versions.js [patch|minor|major]
   ```

2. 提交更改到Git仓库：
   ```bash
   git add .
   git commit -m "chore: 更新版本至x.y.z"
   git push
   ```

3. 创建并推送版本标签（推荐使用便捷脚本）：
   ```bash
   # 使用工具脚本自动创建和推送标签
   ./create-release.js
   ```

4. GitHub Actions将自动执行以下操作：
   - 构建所有包
   - 发布到npm
   - 创建GitHub Release并附带更新日志

### 一键发布

可以使用根目录下的 `release` 命令一键完成版本更新、提交和创建标签：

```bash
npm run release
```

这个命令会自动执行以下步骤：
1. 更新所有包的版本号（patch 级别更新）
2. 提交更改到 Git 仓库
3. 创建并推送版本标签

## 包更新顺序

脚本会按照依赖关系顺序更新各个包：

1. `@dmhsq_monitor/utils` - 工具库，不依赖其他包
2. `@dmhsq_monitor/core` - 核心库，依赖 utils
3. `@dmhsq_monitor/processor` - 处理器库，依赖 core 和 utils
4. `@dmhsq_monitor/web` - Web监控库，依赖所有其他包

## CI/CD流程

本项目使用GitHub Actions实现CI/CD：

- **CI流程**: 每次推送代码到`main`、`master`、`dev`、`develop`分支或创建针对这些分支的PR时，自动运行linting、类型检查、构建和测试
- **CD流程**: 当推送带有`v`前缀的标签（如`v1.0.0`）时，自动构建并发布包到npm

### 项目结构优化

- 根目录添加了 `package.json` 用于管理工作区
- 所有包都通过根目录的脚本命令进行管理
- CI/CD 流程已优化，避免了重复构建和依赖问题

## 技术说明

- 脚本使用 ES 模块语法编写
- 脚本会自动处理版本号递增、changelog更新和常量修改
- 需要 Node.js 14.0.0 或更高版本
- 工作区使用 npm workspaces 管理

## 注意事项

- 确保已登录npm账号 (`npm login`)
- 确保在GitHub仓库设置中添加了`NPM_TOKEN`秘密变量
- 确保有网络连接
- 确保所有包的代码都已经提交到版本控制系统 