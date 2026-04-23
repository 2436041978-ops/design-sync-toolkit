#!/usr/bin/env node

import { Command } from 'commander';
import * as fs from 'fs';
import * as path from 'path';
import { registerCheckCommand } from './check';
import { registerReportCommand } from './report-generator';
import { registerDebtCommand } from './debt-tracker';

/**
 * 读取 package.json 获取版本号
 */
function getVersion(): string {
  try {
    const pkgPath = path.join(__dirname, '..', '..', '..', 'package.json');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf-8'));
    return pkg.version || '0.1.0';
  } catch {
    return '0.1.0';
  }
}

/**
 * CLI 主入口
 * 顶层命令: design-sync
 * 子命令: check / report / debt
 */
const program = new Command();

program
  .name('design-sync')
  .description('设计意图 YAML 形式化表达与轻量级同步工具包')
  .version(getVersion(), '-v, --version', '显示版本号');

// 注册子命令
registerCheckCommand(program);
registerReportCommand(program);
registerDebtCommand(program);

// 解析命令行参数
program.parse();

// 如果没有参数，显示帮助
if (!process.argv.slice(2).length) {
  program.outputHelp();
}
