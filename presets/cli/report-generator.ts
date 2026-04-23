import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';
import { FormatValidator } from '../../core/format-validator';
import { detectFormat, readFileSafe } from '../../core/input-checker';

/**
 * 扫描结果接口
 */
interface ScanResult {
  file: string;
  valid: boolean;
  errors?: string[];
}

/**
 * 扫描目录下的所有 YAML 文件
 */
function scanDirectory(dir: string): string[] {
  const files: string[] = [];

  if (!fs.existsSync(dir)) {
    return files;
  }

  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      files.push(...scanDirectory(fullPath));
    } else if (entry.isFile() && (entry.name.endsWith('.yaml') || entry.name.endsWith('.yml'))) {
      files.push(fullPath);
    }
  }

  return files;
}

/**
 * 生成 Markdown 格式报告
 */
function generateMarkdownReport(dir: string, results: ScanResult[]): string {
  const now = new Date().toISOString().split('T')[0];
  const total = results.length;
  const passed = results.filter((r) => r.valid).length;
  const failed = total - passed;

  let report = `# 设计意图格式合规扫描报告\n\n`;
  report += `**扫描目录:** \`${dir}\`\n\n`;
  report += `**扫描日期:** ${now}\n\n`;
  report += `## 汇总\n\n`;
  report += `- 扫描文件总数: ${total}\n`;
  report += `- 通过: ${passed} ✅\n`;
  report += `- 失败: ${failed} ${failed > 0 ? '❌' : ''}\n\n`;

  if (failed > 0) {
    report += `## 违规详情\n\n`;
    results
      .filter((r) => !r.valid)
      .forEach((r) => {
        report += `### ${r.file}\n\n`;
        r.errors?.forEach((err) => {
          report += `- ❌ ${err}\n`;
        });
        report += `\n`;
      });
  }

  report += `## 详细结果\n\n`;
  report += `| 文件 | 状态 | 错误数 |\n`;
  report += `|------|------|--------|\n`;
  results.forEach((r) => {
    const status = r.valid ? '✅ 通过' : '❌ 失败';
    const errorCount = r.errors?.length || 0;
    report += `| ${r.file} | ${status} | ${errorCount} |\n`;
  });

  return report;
}

/**
 * 注册 report 子命令
 * 批量扫描目录下的 YAML 文件并生成报告
 */
export function registerReportCommand(program: Command): void {
  program
    .command('report <directory>')
    .description('批量扫描目录下的设计意图 YAML 文件并生成合规报告')
    .option('-o, --output <file>', '输出报告到指定文件')
    .option('-f, --format <type>', '报告格式 (markdown|json)', 'markdown')
    .action((directory: string, options: { output?: string; format?: string }) => {
      const absPath = path.resolve(directory);

      if (!fs.existsSync(absPath)) {
        console.error(chalk.red(`❌ 目录不存在: ${absPath}`));
        process.exit(1);
      }

      console.log(chalk.blue(`🔍 正在扫描目录: ${absPath}...\n`));

      // 扫描文件
      const yamlFiles = scanDirectory(absPath);
      console.log(chalk.gray(`发现 ${yamlFiles.length} 个 YAML 文件\n`));

      if (yamlFiles.length === 0) {
        console.log(chalk.yellow('⚠️  未找到 YAML 文件'));
        process.exit(0);
      }

      // 校验每个文件
      const validator = new FormatValidator();
      const results: ScanResult[] = yamlFiles.map((file) => {
        const content = readFileSafe(file);
        if (content === null) {
          return { file, valid: false, errors: ['无法读取文件'] };
        }
        const result = validator.validate(content);
        return {
          file,
          valid: result.valid,
          errors: result.errors
        };
      });

      // 生成报告
      const report = generateMarkdownReport(absPath, results);

      // 输出到控制台
      console.log(report);

      // 输出到文件
      if (options.output) {
        fs.writeFileSync(options.output, report, 'utf-8');
        console.log(chalk.green(`\n✅ 报告已保存至: ${options.output}`));
      }

      // 统计
      const passed = results.filter((r) => r.valid).length;
      const failed = results.length - passed;
      console.log(chalk.blue(`\n📊 扫描完成: ${passed} 通过, ${failed} 失败`));

      if (failed > 0) {
        process.exit(1);
      }
    });
}
