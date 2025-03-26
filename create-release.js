#!/usr/bin/env node

/**
 * 创建版本标签并推送到 GitHub 的脚本
 */
import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';
import { fileURLToPath } from 'url';

// 获取当前文件的目录
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 包的顺序
const PACKAGES = [
  'utils',
  'core',
  'processor',
  'web'
];

// 处理控制台颜色
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
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

// 获取主要版本
function getMainVersion() {
  // 获取web包版本作为主要版本
  const packageJsonPath = path.join(__dirname, 'packages', 'web', 'package.json');
  let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  return packageJson.version;
}

// 主函数
function main() {
  try {
    // 检查是否有未提交的更改
    try {
      execSync('git diff --quiet && git diff --staged --quiet');
    } catch (error) {
      log('\n警告：有未提交的变更。请先提交或取消所有更改。', colors.bright + colors.yellow);
      const response = require('readline').createInterface({
        input: process.stdin,
        output: process.stdout
      });
      
      response.question('是否继续？(y/N) ', answer => {
        if (answer.toLowerCase() !== 'y') {
          log('操作已取消', colors.red);
          process.exit(1);
        }
        response.close();
        continueRelease();
      });
    }
    
    continueRelease();
    
  } catch (error) {
    log(`\n错误：${error.message}`, colors.red);
    process.exit(1);
  }
}

function continueRelease() {
  try {
    const version = getMainVersion();
    const tagName = `v${version}`;
    
    log(`\n正在创建版本标签: ${tagName}`, colors.cyan);
    
    // 创建版本更新日志
    let releaseNotes = `### 版本更新内容\n\n`;
    
    // 读取每个包的 changelog
    for (const packageName of PACKAGES) {
      const packageJsonPath = path.join(__dirname, 'packages', packageName, 'package.json');
      let packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
      const packageVersion = packageJson.version;
      
      releaseNotes += `#### @dmhsq_monitor/${packageName}@${packageVersion}\n`;
      
      if (packageJson.changelog && packageJson.changelog[packageVersion]) {
        packageJson.changelog[packageVersion].forEach(note => {
          releaseNotes += `- ${note}\n`;
        });
      }
      
      releaseNotes += '\n';
    }
    
    // 将更新日志写入临时文件
    const tempNotesPath = path.join(__dirname, 'RELEASE_NOTES.md');
    fs.writeFileSync(tempNotesPath, releaseNotes, 'utf8');
    
    log(`\n版本更新内容:\n${releaseNotes}`, colors.reset);
    
    // 创建标签
    try {
      execSync(`git tag -a ${tagName} -m "${tagName}"`);
      log(`\n标签 ${tagName} 创建成功`, colors.green);
    } catch (error) {
      log(`\n标签创建失败: ${error.message}`, colors.red);
      log(`\n如果标签已存在，可以使用: git tag -d ${tagName} 删除它`, colors.yellow);
      process.exit(1);
    }
    
    // 推送标签到远程
    log(`\n推送标签到远程仓库...`, colors.blue);
    try {
      execSync(`git push origin ${tagName}`);
      log(`\n标签 ${tagName} 推送成功`, colors.green);
      log(`\nGitHub Actions 将自动构建和发布包`, colors.cyan);
    } catch (error) {
      log(`\n标签推送失败: ${error.message}`, colors.red);
      log(`\n您可以稍后手动推送: git push origin ${tagName}`, colors.yellow);
    }
    
    // 删除临时文件
    fs.unlinkSync(tempNotesPath);
    
  } catch (error) {
    log(`\n错误：${error.message}`, colors.red);
    process.exit(1);
  }
}

// 执行主函数
main(); 