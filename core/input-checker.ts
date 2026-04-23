import * as fs from 'fs';

/**
 * 文件格式类型
 */
export type FileFormat = 'yaml' | 'json' | 'unknown';

/**
 * 输入预检模块
 * 负责文件存在性检查、格式检测和安全读取
 */

/**
 * 检查文件是否存在且可读
 * @param filePath - 文件路径
 * @returns 是否存在
 */
export function checkFileExists(filePath: string): boolean {
  try {
    fs.accessSync(filePath, fs.constants.R_OK);
    return fs.statSync(filePath).isFile();
  } catch {
    return false;
  }
}

/**
 * 检测文件格式（基于扩展名）
 * @param filePath - 文件路径
 * @returns FileFormat - 文件格式类型
 */
export function detectFormat(filePath: string): FileFormat {
  const ext = filePath.toLowerCase().split('.').pop();
  switch (ext) {
    case 'yaml':
    case 'yml':
      return 'yaml';
    case 'json':
      return 'json';
    default:
      return 'unknown';
  }
}

/**
 * 安全读取文件内容
 * @param filePath - 文件路径
 * @returns 文件内容或 null（读取失败时）
 */
export function readFileSafe(filePath: string): string | null {
  try {
    return fs.readFileSync(filePath, 'utf-8');
  } catch {
    return null;
  }
}

/**
 * 输入检查器类（带状态管理）
 */
export class InputChecker {
  private checkedFiles: Map<string, boolean> = new Map();

  /**
   * 检查文件是否存在
   */
  checkFileExists(filePath: string): boolean {
    const result = checkFileExists(filePath);
    this.checkedFiles.set(filePath, result);
    return result;
  }

  /**
   * 检测文件格式
   */
  detectFormat(filePath: string): FileFormat {
    return detectFormat(filePath);
  }

  /**
   * 安全读取文件
   */
  readFileSafe(filePath: string): string | null {
    return readFileSafe(filePath);
  }

  /**
   * 获取已检查文件记录
   */
  getCheckedFiles(): Map<string, boolean> {
    return new Map(this.checkedFiles);
  }

  /**
   * 清空检查记录
   */
  clearRecords(): void {
    this.checkedFiles.clear();
  }
}

export default InputChecker;
