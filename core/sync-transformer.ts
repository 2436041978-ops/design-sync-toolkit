import * as yaml from 'js-yaml';

/**
 * Design Token 接口
 */
export interface DesignToken {
  name: string;
  type: 'color' | 'typography' | 'spacing' | 'shadow' | 'other';
  value: string | number;
  category?: string;
}

/**
 * 转换引擎
 * 负责 YAML 到 JSON 的转换和 Design Token 提取
 */

/**
 * 将 YAML 内容转换为 JSON 对象
 * @param yamlContent - YAML 字符串
 * @returns 解析后的 JSON 对象
 */
export function yamlToJson(yamlContent: string): object {
  const parsed = yaml.load(yamlContent);
  if (parsed === null || typeof parsed !== 'object') {
    return {};
  }
  return parsed as object;
}

/**
 * 从 YAML 内容中提取 Design Tokens
 * @param yamlContent - YAML 字符串
 * @returns DesignToken 数组
 */
export function extractDesignTokens(yamlContent: string): DesignToken[] {
  const parsed = yaml.load(yamlContent);
  if (parsed === null || typeof parsed !== 'object') {
    return [];
  }

  const tokens: DesignToken[] = [];
  const data = parsed as Record<string, any>;

  // 提取颜色 token
  if (data.colors && typeof data.colors === 'object') {
    Object.entries(data.colors).forEach(([key, value]) => {
      tokens.push({
        name: `color-${key}`,
        type: 'color',
        value: String(value),
        category: 'colors'
      });
    });
  }

  // 提取字体 token
  if (data.typography && typeof data.typography === 'object') {
    Object.entries(data.typography).forEach(([key, value]) => {
      tokens.push({
        name: `typography-${key}`,
        type: 'typography',
        value: String(value),
        category: 'typography'
      });
    });
  }

  // 提取间距 token
  if (data.spacing && typeof data.spacing === 'object') {
    Object.entries(data.spacing).forEach(([key, value]) => {
      tokens.push({
        name: `spacing-${key}`,
        type: 'spacing',
        value: typeof value === 'number' ? value : String(value),
        category: 'spacing'
      });
    });
  }

  // 提取阴影 token
  if (data.shadows && typeof data.shadows === 'object') {
    Object.entries(data.shadows).forEach(([key, value]) => {
      tokens.push({
        name: `shadow-${key}`,
        type: 'shadow',
        value: String(value),
        category: 'shadows'
      });
    });
  }

  return tokens;
}

/**
 * 转换引擎类（高级用法）
 */
export class SyncTransformer {
  /**
   * YAML 转 JSON
   */
  yamlToJson(yamlContent: string): object {
    return yamlToJson(yamlContent);
  }

  /**
   * 提取 Design Tokens
   */
  extractDesignTokens(yamlContent: string): DesignToken[] {
    return extractDesignTokens(yamlContent);
  }

  /**
   * 批量转换多个 YAML 内容
   */
  batchTransform(yamlContents: string[]): Array<{ json: object; tokens: DesignToken[] }> {
    return yamlContents.map((content) => ({
      json: yamlToJson(content),
      tokens: extractDesignTokens(content)
    }));
  }
}

export default SyncTransformer;
