import { FormatValidator, ValidationResult } from './format-validator';
import { checkFileExists, detectFormat, readFileSafe } from './input-checker';
import { yamlToJson, extractDesignTokens, DesignToken } from './sync-transformer';

/**
 * 同步结果接口
 */
export interface SyncResult {
  file: string;
  success: boolean;
  phase: 'input' | 'validation' | 'transform' | 'unknown';
  validation?: ValidationResult;
  tokens?: DesignToken[];
  json?: object;
  error?: string;
  durationMs: number;
}

/**
 * 同步协调器
 * 编排输入检查 → 格式校验 → 转换提取的完整流程
 */
export class SyncCoordinator {
  private validator: FormatValidator;

  constructor() {
    this.validator = new FormatValidator();
  }

  /**
   * 协调处理多个文件
   * @param files - 文件路径数组
   * @returns 每个文件的处理结果
   */
  coordinate(files: string[]): SyncResult[] {
    return files.map((file) => this.processFile(file));
  }

  /**
   * 处理单个文件
   */
  private processFile(file: string): SyncResult {
    const startTime = Date.now();

    // Phase 1: 输入检查
    if (!checkFileExists(file)) {
      return {
        file,
        success: false,
        phase: 'input',
        error: `File not found or not readable: ${file}`,
        durationMs: Date.now() - startTime
      };
    }

    const format = detectFormat(file);
    if (format !== 'yaml' && format !== 'json') {
      return {
        file,
        success: false,
        phase: 'input',
        error: `Unsupported file format: ${format}`,
        durationMs: Date.now() - startTime
      };
    }

    const content = readFileSafe(file);
    if (content === null) {
      return {
        file,
        success: false,
        phase: 'input',
        error: `Failed to read file: ${file}`,
        durationMs: Date.now() - startTime
      };
    }

    // Phase 2: 格式校验
    const validation = this.validator.validate(content);
    if (!validation.valid) {
      return {
        file,
        success: false,
        phase: 'validation',
        validation,
        error: `Validation failed: ${validation.errors?.join(', ') || 'Unknown error'}`,
        durationMs: Date.now() - startTime
      };
    }

    // Phase 3: 转换提取
    try {
      const json = yamlToJson(content);
      const tokens = extractDesignTokens(content);

      return {
        file,
        success: true,
        phase: 'transform',
        validation,
        tokens,
        json,
        durationMs: Date.now() - startTime
      };
    } catch (err) {
      return {
        file,
        success: false,
        phase: 'transform',
        error: `Transform failed: ${(err as Error).message}`,
        durationMs: Date.now() - startTime
      };
    }
  }

  /**
   * 生成汇总报告
   */
  generateSummary(results: SyncResult[]): {
    total: number;
    passed: number;
    failed: number;
    avgDurationMs: number;
  } {
    const total = results.length;
    const passed = results.filter((r) => r.success).length;
    const failed = total - passed;
    const avgDurationMs = total > 0
      ? results.reduce((sum, r) => sum + r.durationMs, 0) / total
      : 0;

    return {
      total,
      passed,
      failed,
      avgDurationMs: Math.round(avgDurationMs)
    };
  }
}

export default SyncCoordinator;
