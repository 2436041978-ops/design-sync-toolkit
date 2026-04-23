import { Command } from 'commander';
import chalk from 'chalk';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 技术债务条目接口
 */
interface DebtItem {
  id: string;
  description: string;
  owner: string;
  status: 'open' | 'closed';
  created_at: string;
  closed_at?: string;
}

/**
 * 债务存储管理
 */
const DEBT_DIR = '.design-sync';
const DEBT_FILE = path.join(DEBT_DIR, 'debt.json');

/**
 * 确保债务存储目录和文件存在
 */
function ensureDebtStorage(): void {
  if (!fs.existsSync(DEBT_DIR)) {
    fs.mkdirSync(DEBT_DIR, { recursive: true });
  }
  if (!fs.existsSync(DEBT_FILE)) {
    fs.writeFileSync(DEBT_FILE, JSON.stringify([], null, 2), 'utf-8');
  }
}

/**
 * 读取所有债务条目
 */
function readDebts(): DebtItem[] {
  ensureDebtStorage();
  try {
    const content = fs.readFileSync(DEBT_FILE, 'utf-8');
    return JSON.parse(content);
  } catch {
    return [];
  }
}

/**
 * 写入债务条目
 */
function writeDebts(debts: DebtItem[]): void {
  ensureDebtStorage();
  fs.writeFileSync(DEBT_FILE, JSON.stringify(debts, null, 2), 'utf-8');
}

/**
 * 生成唯一 ID
 */
function generateId(): string {
  const now = new Date();
  const timestamp = now.getTime().toString(36).toUpperCase();
  return `DEBT-${timestamp}`;
}

/**
 * 注册 debt 子命令
 * 技术债务追踪：add / list / close
 */
export function registerDebtCommand(program: Command): void {
  const debtCmd = program
    .command('debt')
    .description('遗留问题（技术债务）追踪管理');

  // debt add <description> --owner <name>
  debtCmd
    .command('add <description>')
    .description('添加技术债务条目')
    .requiredOption('-o, --owner <name>', '债务负责人')
    .action((description: string, options: { owner: string }) => {
      const debts = readDebts();
      const newDebt: DebtItem = {
        id: generateId(),
        description,
        owner: options.owner,
        status: 'open',
        created_at: new Date().toISOString()
      };
      debts.push(newDebt);
      writeDebts(debts);

      console.log(chalk.green('✅ 技术债务已添加'));
      console.log(chalk.gray(`   ID: ${newDebt.id}`));
      console.log(chalk.gray(`   描述: ${description}`));
      console.log(chalk.gray(`   负责人: ${options.owner}`));
    });

  // debt list
  debtCmd
    .command('list')
    .description('列出所有未关闭的技术债务')
    .option('-a, --all', '显示所有债务（包括已关闭）')
    .action((options: { all?: boolean }) => {
      const debts = readDebts();
      const filtered = options.all ? debts : debts.filter((d) => d.status === 'open');

      if (filtered.length === 0) {
        console.log(chalk.green('🎉 暂无技术债务'));
        return;
      }

      console.log(chalk.blue(`📋 技术债务列表 (${filtered.length} 条)\n`));

      filtered.forEach((debt, index) => {
        const statusIcon = debt.status === 'open' ? '🔴' : '✅';
        const statusText = debt.status === 'open'
          ? chalk.red('未解决')
          : chalk.green('已关闭');

        console.log(`${index + 1}. ${statusIcon} [${chalk.cyan(debt.id)}] ${debt.description}`);
        console.log(`   负责人: ${chalk.yellow(debt.owner)} | 状态: ${statusText}`);
        console.log(`   创建: ${chalk.gray(debt.created_at)}`);
        if (debt.closed_at) {
          console.log(`   关闭: ${chalk.gray(debt.closed_at)}`);
        }
        console.log('');
      });

      const openCount = debts.filter((d) => d.status === 'open').length;
      const closedCount = debts.filter((d) => d.status === 'closed').length;
      console.log(chalk.gray(`汇总: ${openCount} 未解决 | ${closedCount} 已关闭`));
    });

  // debt close <id>
  debtCmd
    .command('close <id>')
    .description('关闭指定技术债务')
    .action((id: string) => {
      const debts = readDebts();
      const debt = debts.find((d) => d.id === id);

      if (!debt) {
        console.error(chalk.red(`❌ 未找到债务: ${id}`));
        process.exit(1);
      }

      if (debt.status === 'closed') {
        console.log(chalk.yellow(`⚠️  债务 ${id} 已经处于关闭状态`));
        return;
      }

      debt.status = 'closed';
      debt.closed_at = new Date().toISOString();
      writeDebts(debts);

      console.log(chalk.green(`✅ 债务 ${id} 已关闭`));
    });
}
