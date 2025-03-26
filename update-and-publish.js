#!/usr/bin/env node

/**
 * 自动更新版本、构建和发布包的脚本
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 包的顺序很重要，我们需要先处理不依赖其他包的包
const PACKAGES = [
  'utils',
  'core',
  'processor',
  'web'
];

// 版本增量类型
const INCREMENT_TYPE = process.argv[2] || 'patch'; // 默认为 patch 更新

// 处理控制台颜色
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  dim: '\x1b[2m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

// 日志函数
function log(message, color = '') {
  console.log(`${color}${message}${colors.reset}`);
}

// 更新版本号
function incrementVersion(version, type) {
  const [major, minor, patch] = version.split('.').map(Number);
  
  switch (type) {
    case 'major':
      return `${major + 1}.0.0`;
    case 'minor':
      return `${major}.${minor + 1}.0`;
    case 'patch':
    default:
      return `${major}.${minor}.${patch + 1}`;
  }
}

// 更新单个包
function updatePackage(packageName, type) {
  log(`\n正在处理 ${packageName} 包...`, colors.cyan);
  
  const packageDir = path.join(__dirname, 'packages', packageName);
  const packageJsonPath = path.join(packageDir, 'package.json');
  
  // 读取 package.json
  let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const oldVersion = packageJson.version;
  const newVersion = incrementVersion(oldVersion, type);
  
  log(`更新版本：${oldVersion} -> ${newVersion}`, colors.yellow);
  
  // 更新 package.json 中的版本
  packageJson.version = newVersion;
  
  // 更新依赖版本
  if (packageJson.dependencies) {
    Object.keys(packageJson.dependencies).forEach(dep => {
      if (dep.startsWith('@dmhsq_monitor/')) {
        const depName = dep.replace('@dmhsq_monitor/', '');
        if (PACKAGES.includes(depName)) {
          const depPackageJson = JSON.parse(
            fs.readFileSync(
              path.join(__dirname, 'packages', depName, 'package.json'),
              'utf8'
            )
          );
          packageJson.dependencies[dep] = `^${depPackageJson.version}`;
          log(`更新依赖 ${dep} -> ${depPackageJson.version}`, colors.dim);
        }
      }
    });
  }
  
  // 添加新的 changelog 条目
  if (!packageJson.changelog) {
    packageJson.changelog = {};
  }
  
  const defaultChangelogEntries = {
    'utils': [
      "优化工具函数",
      "提高兼容性和稳定性",
      "改进正则表达式模式"
    ],
    'core': [
      "优化事件处理机制",
      "提升日志记录效率",
      "更新依赖包版本"
    ],
    'processor': [
      "改进IP数据收集机制",
      "优化错误数据去重算法",
      "增强数据处理性能",
      "更新依赖包版本"
    ],
    'web': [
      "升级所有依赖包版本",
      "优化IP地址收集机制",
      "提高错误处理和去重效率",
      "改进整体性能和稳定性"
    ]
  };
  
  packageJson.changelog[newVersion] = defaultChangelogEntries[packageName] || [
    "版本更新",
    "优化性能",
    "修复问题"
  ];
  
  // 写入更新后的 package.json
  fs.writeFileSync(packageJsonPath, JSON.stringify(packageJson, null, 2), 'utf8');
  
  // 更新 constants.ts 中的版本常量
  updateConstantsVersion(packageName, newVersion);
  
  return newVersion;
}

// 更新 constants.ts 中的版本常量
function updateConstantsVersion(packageName, newVersion) {
  const constantsMap = {
    'utils': {
      file: 'src/constants.ts',
      varName: 'UTILS_VERSION'
    },
    'core': {
      file: 'src/constants.ts',
      varName: 'SDK_VERSION'
    },
    'processor': {
      file: 'src/constants.ts',
      varName: 'PROCESSOR_VERSION'
    },
    'web': {
      file: 'src/constants.ts',
      varName: 'WEB_MONITOR_VERSION'
    }
  };
  
  const config = constantsMap[packageName];
  if (!config) return;
  
  const constantsPath = path.join(__dirname, 'packages', packageName, config.file);
  
  // 检查文件是否存在
  if (!fs.existsSync(constantsPath)) {
    log(`警告：${constantsPath} 不存在，跳过更新常量`, colors.yellow);
    return;
  }
  
  let content = fs.readFileSync(constantsPath, 'utf8');
  
  // 使用正则表达式替换版本
  const pattern = new RegExp(`export const ${config.varName} = ['"]([^'"]+)['"]`);
  const newContent = content.replace(pattern, `export const ${config.varName} = '${newVersion}'`);
  
  if (content === newContent) {
    log(`警告：在 ${constantsPath} 中没有找到 ${config.varName} 常量`, colors.yellow);
  } else {
    fs.writeFileSync(constantsPath, newContent, 'utf8');
    log(`更新了 ${constantsPath} 中的 ${config.varName} -> ${newVersion}`, colors.green);
  }
}

// 构建包
function buildPackage(packageName) {
  log(`\n构建 ${packageName} 包...`, colors.blue);
  
  try {
    execSync(`cd packages/${packageName} && npm run build`, { stdio: 'inherit' });
    log(`${packageName} 构建成功`, colors.green);
    return true;
  } catch (error) {
    log(`${packageName} 构建失败: ${error.message}`, colors.red);
    return false;
  }
}

// 发布包
function publishPackage(packageName) {
  log(`\n发布 ${packageName} 包...`, colors.blue);
  
  try {
    execSync(`cd packages/${packageName} && npm publish`, { stdio: 'inherit' });
    log(`${packageName} 发布成功`, colors.green);
    return true;
  } catch (error) {
    log(`${packageName} 发布失败: ${error.message}`, colors.red);
    return false;
  }
}

// 主函数
function main() {
  log('开始更新、构建和发布包...', colors.bright + colors.blue);
  log(`版本更新类型: ${INCREMENT_TYPE}`, colors.bright);
  
  const results = {
    updated: [],
    built: [],
    published: []
  };
  
  // 按顺序处理每个包
  for (const packageName of PACKAGES) {
    try {
      // 更新版本
      const newVersion = updatePackage(packageName, INCREMENT_TYPE);
      results.updated.push(`${packageName}@${newVersion}`);
      
      // 构建
      if (buildPackage(packageName)) {
        results.built.push(packageName);
        
        // 发布
        if (publishPackage(packageName)) {
          results.published.push(packageName);
        }
      }
    } catch (error) {
      log(`处理 ${packageName} 时出错: ${error.message}`, colors.red);
    }
  }
  
  // 打印总结
  log('\n===== 执行结果 =====', colors.bright);
  log(`更新的包: ${results.updated.join(', ')}`, colors.cyan);
  log(`构建的包: ${results.built.join(', ')}`, colors.blue);
  log(`发布的包: ${results.published.join(', ')}`, colors.green);
  
  if (results.published.length === PACKAGES.length) {
    log('\n所有包都已成功更新、构建和发布！', colors.bright + colors.green);
  } else {
    log('\n警告：部分包未能成功处理', colors.bright + colors.yellow);
  }
}

// 执行主函数
main(); 