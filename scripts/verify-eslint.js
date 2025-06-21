#!/usr/bin/env node

/**
 * ESLint 验证脚本
 *
 * 此脚本用于验证ESLint配置是否正常工作，以及检查特定文件或目录。
 * 它可以作为开发环境中的快速验证工具。
 *
 * 用法:
 * - `bun scripts/verify-eslint.js` - 验证配置并检查所有重要目录
 * - `bun scripts/verify-eslint.js src/main` - 仅检查主进程代码
 * - `bun scripts/verify-eslint.js src/shared/ipc.ts` - 检查特定文件
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');
const projectRoot = path.resolve(__dirname, '..');

// 定义要检查的关键路径
const keyPaths = ['src/main', 'src/renderer', 'src/shared'];

// 获取命令行参数
const args = process.argv.slice(2);
const targetPath = args[0] || null;
const quietMode = args.includes('--quiet');

// 验证eslint.config.js存在
console.log('🔍 验证ESLint配置文件...');
const configPath = path.join(projectRoot, 'eslint.config.js');
if (!fs.existsSync(configPath)) {
  console.error('❌ eslint.config.js不存在！');
  process.exit(1);
}
console.log('✅ eslint.config.js存在');

// 构建ESLint命令
function buildCommand(pathToCheck) {
  let cmd = `eslint --config eslint.config.js`;

  if (quietMode) {
    cmd += ' --quiet';
  }

  if (pathToCheck) {
    cmd += ` ${pathToCheck}`;
  } else {
    // 默认添加文件扩展类型
    cmd += ' --ext .ts,.tsx';
  }

  return cmd;
}

// 执行ESLint检查
function runLint(pathToCheck = null) {
  const displayPath = pathToCheck || '整个项目';
  console.log(`\n🔍 检查 ${displayPath}...`);

  try {
    const cmd = buildCommand(pathToCheck);
    execSync(cmd, {
      cwd: projectRoot,
      stdio: 'inherit',
    });
    console.log(`✅ ${displayPath} 检查通过`);
    return true;
  } catch (error) {
    console.log(`❌ ${displayPath} 检查发现问题`);
    return false;
  }
}

// 主流程
async function main() {
  console.log('🚀 开始ESLint配置验证\n');

  let success = true;

  // 如果指定了目标路径，只检查该路径
  if (targetPath) {
    success = runLint(targetPath);
  } else {
    // 否则检查所有关键路径
    for (const keyPath of keyPaths) {
      const result = runLint(keyPath);
      success = success && result;
    }
  }

  // 总结
  console.log('\n==============================================');
  if (success) {
    console.log('✅ ESLint检查全部通过！');
  } else {
    console.log('❌ ESLint检查发现问题，请修复后再提交代码。');
  }
}

main().catch((error) => {
  console.error('执行过程中发生错误:', error);
  process.exit(1);
});
