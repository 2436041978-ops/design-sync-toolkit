#!/usr/bin/env node
import { Command } from 'commander';
import chalk from 'chalk';
import { runCheck } from './check';
import { runTracker } from './debt-tracker';
import { runReport } from './report-generator';

const program = new Command();

program
  .name('dsc')
  .description('Design Sync Toolkit - 设计规范同步工具集')
  .version('0.4.0');

// check 命令
program
  .command('check <file>')
  .description('检查需求基线合规性')
  .option('-c, --config <path>', '指定配置文件路径')
  .option('-m, --mode <mode>', '检查模式: warn(仅提醒) | strict(严格)', 'warn')
  .option('--fail-on-error', '发现错误时退出码为 1', false)
  .action(async (file: string, options: { config?: string; mode?: string; failOnError?: boolean }) => {
    try {
      await runCheck(file, {
        config: options.config,
        mode: options.mode as 'warn' | 'strict',
        failOnError: options.failOnError
      });
    } catch (error) {
      console.error(chalk.red(`❌ 检查失败: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

// debt-tracker 命令
program
  .command('debt-tracker')
  .description('偏差登记与追踪')
  .option('-r, --report', '生成偏差报告', false)
  .option('-f, --format <format>', '报告格式: json | markdown', 'json')
  .action(async (options: { report?: boolean; format?: string }) => {
    try {
      await runTracker({
        report: options.report,
        format: options.format as 'json' | 'markdown'
      });
    } catch (error) {
      console.error(chalk.red(`❌ 偏差追踪失败: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

// report 命令
program
  .command('report')
  .description('生成质量报告')
  .option('-o, --output <path>', '输出文件路径')
  .option('-f, --format <format>', '报告格式: json | markdown | html', 'markdown')
  .action(async (options: { output?: string; format?: string }) => {
    try {
      await runReport({
        output: options.output,
        format: options.format as 'json' | 'markdown' | 'html'
      });
    } catch (error) {
      console.error(chalk.red(`❌ 报告生成失败: ${error instanceof Error ? error.message : String(error)}`));
      process.exit(1);
    }
  });

program.parse();
