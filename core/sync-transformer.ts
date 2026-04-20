/**
 * 同步转换器 - 将设计 Token 转换为代码
 */

export interface TransformerConfig {
  framework: string;
  rules: TransformerRule[];
}

export interface TransformerRule {
  name: string;
  condition: string;
  output: string;
}

export interface TransformResult {
  success: boolean;
  output: string;
  errors: string[];
}

/**
 * 将设计 Token 转换为代码
 */
export function transformTokens(
  tokens: Record<string, unknown>,
  config: TransformerConfig
): TransformResult {
  const errors: string[] = [];
  const outputs: string[] = [];

  if (!config.rules || config.rules.length === 0) {
    return {
      success: false,
      output: '',
      errors: ['未提供转换规则']
    };
  }

  let matchedAny = false;
  for (const [key, value] of Object.entries(tokens)) {
    const matchingRule = config.rules.find(rule => matchesCondition(key, value, rule));
    if (matchingRule) {
      matchedAny = true;
      try {
        const output = applyRule(value, matchingRule, key);
        outputs.push(`/* ${key} */\n${output}`);
      } catch (error) {
        errors.push(`转换 ${key} 失败: ${error instanceof Error ? error.message : String(error)}`);
      }
    }
  }

  if (!matchedAny && errors.length === 0) {
    errors.push('没有匹配的规则');
  }

  return {
    success: errors.length === 0,
    output: outputs.join('\n\n'),
    errors
  };
}

/**
 * 检查 token 是否匹配规则条件
 */
function matchesCondition(key: string, _value: unknown, rule: TransformerRule): boolean {
  // 先检查通配符
  if (rule.condition.includes('*')) {
    const regex = new RegExp('^' + rule.condition.replace(/\*/g, '.*') + '$');
    return regex.test(key);
  }
  // 再检查点路径
  if (rule.condition.includes('.')) {
    return key.startsWith(rule.condition) || key === rule.condition;
  }
  return key === rule.condition;
}

/**
 * 应用单条转换规则
 */
export function applyRule(token: unknown, rule: TransformerRule, key?: string): string {
  let output = rule.output;

  if (key) {
    output = output.replace(/\{\{key\}\}/g, key.split('.').pop() || key);
  }

  if (typeof token === 'string' || typeof token === 'number') {
    output = output.replace(/\{\{value\}\}/g, String(token));
  } else if (typeof token === 'object' && token !== null) {
    for (const [k, v] of Object.entries(token)) {
      output = output.replace(new RegExp(`\\{\\{${k}\\}\\}`, 'g'), String(v));
    }
  }

  return output;
}
