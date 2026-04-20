import fs from 'fs';
import chalk from 'chalk';

export interface DebtEntry {
  id: string;
  baseline: string;
  actual: string;
  deviationType: string;
  owner: string;
  status: 'pending' | 'resolved';
  dueDate?: string;
}

export interface TrackerOptions {
  report?: boolean;
  format?: 'json' | 'markdown';
}

// 内存存储
const debtStore = new Map<string, DebtEntry>();
let debtCounter = 0;

/**
 * 运行偏差追踪命令
 */
export async function runTracker(options: TrackerOptions = {}): Promise<void> {
  const { report = false, format = 'json' } = options;

  if (report) {
    const reportOutput = generateReport(format);
    console.log(reportOutput);
    return;
  }

  // 显示当前偏差列表
  const debts = listDebts();
  if (debts.length === 0) {
    console.log(chalk.green('✅ 当前无偏差记录'));
    return;
  }

  console.log(chalk.bold(`\n📊 偏差追踪 (${debts.length} 条记录)\n`));
  console.log(chalk.gray('─'.repeat(50)));

  for (const debt of debts) {
    const statusIcon = debt.status === 'resolved' ? '✅' : '⏳';
    const statusColor = debt.status === 'resolved' ? chalk.green : chalk.yellow;
    console.log(statusColor(`${statusIcon} #${debt.id} [${debt.status}] ${debt.deviationType}`));
    console.log(`   基线: ${debt.baseline}`);
    console.log(`   实际: ${debt.actual}`);
    console.log(`   责任人: ${debt.owner}${debt.dueDate ? ` | 截止: ${debt.dueDate}` : ''}`);
    console.log(chalk.gray('─'.repeat(50)));
  }
}

/**
 * 添加偏差记录
 */
export function addDebt(entry: Omit<DebtEntry, 'id'>): DebtEntry {
  debtCounter++;
  const id = String(debtCounter).padStart(3, '0');
  const debt: DebtEntry = { ...entry, id };
  debtStore.set(id, debt);
  return debt;
}

/**
 * 列出所有偏差
 */
export function listDebts(): DebtEntry[] {
  return Array.from(debtStore.values());
}

/**
 * 生成偏差报告
 */
export function generateReport(format: string = 'json'): string {
  const debts = listDebts();

  if (format === 'markdown') {
    let md = '# 偏差追踪报告\n\n';
    md += `| ID | 基线要求 | 实际实现 | 偏差类型 | 责任人 | 状态 |\n`;
    md += `|:---|:---|:---|:---|:---|:---|\n`;
    for (const debt of debts) {
      md += `| ${debt.id} | ${debt.baseline} | ${debt.actual} | ${debt.deviationType} | ${debt.owner} | ${debt.status} |\n`;
    }
    md += `\n**总计**: ${debts.length} 条偏差\n`;
    return md;
  }

  return JSON.stringify({
    generatedAt: new Date().toISOString(),
    totalDebts: debts.length,
    pendingDebts: debts.filter(d => d.status === 'pending').length,
    resolvedDebts: debts.filter(d => d.status === 'resolved').length,
    debts
  }, null, 2);
}
