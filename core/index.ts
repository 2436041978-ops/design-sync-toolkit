/**
 * Design Sync Toolkit - 内核统一导出
 *
 * 本工具包采用输入-校验-输出三层轻量架构：
 * - 输入层：需求录入 + 格式预检
 * - 校验层：Schema 合规检查 + 批量扫描报告
 * - 输出层：交付追踪 + 遗留问题清理
 */

// 格式校验器
export { FormatValidator, ValidationResult } from './format-validator';

// 输入预检模块
export {
  InputChecker,
  checkFileExists,
  detectFormat,
  readFileSafe,
  FileFormat
} from './input-checker';

// 转换引擎
export {
  SyncTransformer,
  yamlToJson,
  extractDesignTokens,
  DesignToken
} from './sync-transformer';

// 同步协调器
export {
  SyncCoordinator,
  SyncResult
} from './sync-coordinator';
