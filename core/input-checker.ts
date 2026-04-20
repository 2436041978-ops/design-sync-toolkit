/**
 * 输入检查器 - 验证需求基线是否符合 SMART 规范
 */

export interface BaselineInput {
  actor: string;
  action: string;
  metric: string;
  owner: string;
  constraints: string[];
}

export interface CheckResult {
  dimension: string;
  passed: boolean;
  severity: 'error' | 'warning' | 'info';
  message: string;
}

/**
 * 对输入进行完整的 SMART 检查
 */
export function checkInput(input: BaselineInput): CheckResult[] {
  const results: CheckResult[] = [];

  // S - Specific: 检查 action
  const specificResult = checkSpecific(input);
  results.push(specificResult);

  // M - Measurable: 检查 metric 是否可量化
  const measurableResult = checkMetricQuantifiable(input.metric);
  results.push(measurableResult);

  // A - Achievable/Assigned: 检查 owner
  const assignableResult = checkOwner(input.owner);
  results.push(assignableResult);

  // T - Time-bound/Constrained: 检查 constraints
  const constraintResult = checkConstraints(input.constraints);
  results.push(constraintResult);

  // 额外检查：禁用词扫描
  const denyWordResults = checkDenyWords(input.metric + ' ' + input.action);
  results.push(...denyWordResults);

  return results;
}

/**
 * 检查字段是否存在
 */
export function checkFieldPresence(
  input: BaselineInput,
  field: keyof BaselineInput
): CheckResult {
  const value = input[field];
  const isPresent = value !== undefined && value !== '' &&
    (Array.isArray(value) ? value.length > 0 : true);

  const fieldNames: Record<string, string> = {
    actor: '角色',
    action: '动作',
    metric: '指标',
    owner: '责任人',
    constraints: '约束条件'
  };

  return {
    dimension: 'P',
    passed: isPresent,
    severity: isPresent ? 'info' : 'error',
    message: isPresent
      ? `${fieldNames[field] || field} 已填写`
      : `${fieldNames[field] || field} 不能为空`
  };
}

/**
 * 检查 metric 是否可量化（包含数字和单位）
 */
export function checkMetricQuantifiable(metric: string): CheckResult {
  if (!metric || metric.trim() === '') {
    return {
      dimension: 'M',
      passed: false,
      severity: 'error',
      message: '指标(metric)不能为空，需包含数字和单位，如 "3步完成率>95%"'
    };
  }

  const hasNumber = /\d/.test(metric);
  const hasUnitOrSymbol = /[%‰℃°$￥€¥ms秒分小时天步个次]/.test(metric) ||
    /[<>≤≥=≤≥]/.test(metric) ||
    /\d+\s*[a-zA-Z]+/.test(metric);

  const isQuantifiable = hasNumber && hasUnitOrSymbol;

  return {
    dimension: 'M',
    passed: isQuantifiable,
    severity: isQuantifiable ? 'info' : 'warning',
    message: isQuantifiable
      ? `M-可衡量: 指标 "${metric}" 包含数字和单位`
      : `M-可衡量: 指标 "${metric}" 建议包含明确的数字和单位（如 "3步完成率>95%"）`
  };
}

/**
 * 检查特定性 (Specific)
 */
function checkSpecific(input: BaselineInput): CheckResult {
  const hasActor = input.actor && input.actor.trim() !== '';
  const hasAction = input.action && input.action.trim() !== '';

  if (!hasActor && !hasAction) {
    return {
      dimension: 'S',
      passed: false,
      severity: 'error',
      message: 'S-具体: actor (角色) 和 action (动作) 不能为空'
    };
  }

  if (!hasAction) {
    return {
      dimension: 'S',
      passed: false,
      severity: 'error',
      message: 'S-具体: action (动作) 不能为空'
    };
  }

  return {
    dimension: 'S',
    passed: true,
    severity: 'info',
    message: `S-具体: "${input.actor}" 执行 "${input.action}"`
  };
}

/**
 * 检查责任人
 */
function checkOwner(owner: string): CheckResult {
  if (!owner || owner.trim() === '') {
    return {
      dimension: 'A',
      passed: false,
      severity: 'error',
      message: 'A-可归因: 缺少责任人 (owner)'
    };
  }

  return {
    dimension: 'A',
    passed: true,
    severity: 'info',
    message: `A-可归因: 责任人为 "${owner}"`
  };
}

/**
 * 检查约束条件
 */
function checkConstraints(constraints: string[]): CheckResult {
  if (!constraints || constraints.length === 0) {
    return {
      dimension: 'T',
      passed: false,
      severity: 'warning',
      message: 'T-可约束: 建议添加否定边界约束（如 "不得强制等待"）'
    };
  }

  return {
    dimension: 'T',
    passed: true,
    severity: 'info',
    message: `T-可约束: 已定义 ${constraints.length} 条约束`
  };
}

/**
 * 检查文本中是否包含禁用词
 */
export function checkDenyWords(
  text: string,
  denyWords: string[] = ['大概', '可能', '尽量', '友好']
): CheckResult[] {
  const results: CheckResult[] = [];

  for (const word of denyWords) {
    if (text.includes(word)) {
      results.push({
        dimension: 'lang',
        passed: false,
        severity: 'warning',
        message: `语言检查: 发现禁用词 "${word}"，建议替换为更具体的表述`
      });
    }
  }

  if (results.length === 0) {
    results.push({
      dimension: 'lang',
      passed: true,
      severity: 'info',
      message: '语言检查: 未发现禁用词'
    });
  }

  return results;
}
