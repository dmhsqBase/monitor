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

## 包更新顺序

脚本会按照依赖关系顺序更新各个包：

1. `@dmhsq_monitor/utils` - 工具库，不依赖其他包
2. `@dmhsq_monitor/core` - 核心库，依赖 utils
3. `@dmhsq_monitor/processor` - 处理器库，依赖 core 和 utils
4. `@dmhsq_monitor/web` - Web监控库，依赖所有其他包

## 技术说明

- 脚本使用 ES 模块语法编写
- 脚本会自动处理版本号递增、changelog更新和常量修改
- 需要 Node.js 14.0.0 或更高版本

## 注意事项

- 确保已登录npm账号 (`npm login`)
- 确保有网络连接
- 确保所有包的代码都已经提交到版本控制系统 