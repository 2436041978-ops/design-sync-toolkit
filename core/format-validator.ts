/**
 * 格式验证器 - 验证基线文件的格式（JSON / Markdown）
 */

import { BaselineInput } from './input-checker';

export interface ValidationResult {
  valid: boolean;
  errors: string[];
  format?: 'json' | 'markdown' | 'unknown';
  parsed?: BaselineInput;
}

/**
 * 验证文件内容格式
 */
export function validateFormat(content: string): ValidationResult {
  // 先尝试 JSON 解析
  try {
    const parsed = JSON.parse(content);
    const requiredFields = ['actor', 'action', 'metric', 'owner', 'constraints'];
    const missing = requiredFields.filter(f => !(f in parsed));

    if (missing.length > 0) {
      return {
        valid: false,
        errors: [`JSON 缺少必填字段: ${missing.join(', ')}`],
        format: 'json'
      };
    }

    return {
      valid: true,
      errors: [],
      format: 'json',
      parsed: parsed as BaselineInput
    };
  } catch {
    // 不是 JSON，尝试 Markdown
  }

  // 尝试 Markdown 解析
  if (content.includes('##') || content.includes('- ') || content.includes(':')) {
    try {
      const parsed = parseMarkdownBaseline(content);
      const errors: string[] = [];

      if (!parsed.action) errors.push('Markdown 中未找到需求描述');
      if (!parsed.metric) errors.push('Markdown 中未找到目标(metric)');

      return {
        valid: errors.length === 0,
        errors,
        format: 'markdown',
        parsed
      };
    } catch (e) {
      return {
        valid: false,
        errors: [`Markdown 解析失败: ${e instanceof Error ? e.message : String(e)}`],
        format: 'markdown'
      };
    }
  }

  return {
    valid: false,
    errors: ['无法识别的文件格式，请使用 JSON 或 Markdown'],
    format: 'unknown'
  };
}

/**
 * 解析 Markdown 格式的基线
 */
export function parseMarkdownBaseline(content: string): BaselineInput {
  const lines = content.split('\n');

  const input: BaselineInput = {
    actor: '用户',
    action: '',
    metric: '',
    owner: '',
    constraints: []
  };

  for (const line of lines) {
    const trimmed = line.trim();

    // 匹配需求标题: ## 需求：xxx 或 ## 需求: xxx
    if (trimmed.startsWith('## 需求') || trimmed.startsWith('##需求')) {
      const match = trimmed.match(/需求[\uff1a:]\s*(.+)/);
      if (match) {
        input.action = match[1].trim();
      }
    }

    // 匹配目标: - 目标：xxx 或 - 目标: xxx
    if (trimmed.includes('目标') && /[\uff1a:]/.test(trimmed)) {
      const match = trimmed.match(/目标\s*[\uff1a:]\s*(.+)/);
      if (match) {
        input.metric = match[1].trim();
      }
    }

    // 匹配责任人: - 责任人：xxx
    if (trimmed.includes('责任人') && /[\uff1a:]/.test(trimmed)) {
      const match = trimmed.match(/责任人\s*[\uff1a:]\s*(.+)/);
      if (match) {
        input.owner = match[1].trim();
      }
    }

    // 匹配角色: - 角色：xxx
    if (trimmed.includes('角色') && /[\uff1a:]/.test(trimmed)) {
      const match = trimmed.match(/角色\s*[\uff1a:]\s*(.+)/);
      if (match) {
        input.actor = match[1].trim();
      }
    }

    // 匹配边界约束: - 边界：xxx 或 - 约束：xxx
    if ((trimmed.includes('边界') || trimmed.includes('约束')) && /[\uff1a:]/.test(trimmed)) {
      const match = trimmed.match(/(?:边界|约束)\s*[\uff1a:]\s*(.+)/);
      if (match) {
        input.constraints.push(match[1].trim());
      }
    }

    // 捕获包含否定词的约束行（但未被边界/约束模式捕获的）
    if ((trimmed.includes('不得') || trimmed.includes('禁止')) &&
        !trimmed.includes('边界') && !trimmed.includes('约束')) {
      const cleanLine = trimmed.replace(/^[-*]\s*/, '').trim();
      if (cleanLine && !input.constraints.includes(cleanLine)) {
        input.constraints.push(cleanLine);
      }
    }
  }

  return input;
}

/**
 * 验证数据是否符合 JSON Schema
 */
export function validateSchema(data: unknown, schema?: object): ValidationResult {
  if (!schema) {
    return { valid: true, errors: [] };
  }

  const errors: string[] = [];

  try {
    if (schema && typeof schema === 'object') {
      const s = schema as Record<string, unknown>;

      if (s.required && Array.isArray(s.required)) {
        if (data && typeof data === 'object') {
          const d = data as Record<string, unknown>;
          for (const field of s.required) {
            if (!(field in d)) {
              errors.push(`缺少必填字段: ${field}`);
            }
          }
        }
      }

      if (s.properties && typeof s.properties === 'object' && data && typeof data === 'object') {
        const d = data as Record<string, unknown>;
        const props = s.properties as Record<string, unknown>;
        for (const [key, propSchema] of Object.entries(props)) {
          if (key in d) {
            const value = d[key];
            const ps = propSchema as Record<string, unknown>;
            if (ps.type === 'string' && typeof value !== 'string') {
              errors.push(`${key} 应为字符串类型`);
            }
            if (ps.type === 'array' && !Array.isArray(value)) {
              errors.push(`${key} 应为数组类型`);
            }
            if (ps.type === 'boolean' && typeof value !== 'boolean') {
              errors.push(`${key} 应为布尔类型`);
            }
          }
        }
      }
    }
  } catch (e) {
    errors.push(`Schema 验证出错: ${e instanceof Error ? e.message : String(e)}`);
  }

  return {
    valid: errors.length === 0,
    errors
  };
}
