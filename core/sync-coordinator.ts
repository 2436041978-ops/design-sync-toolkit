/**
 * 同步协调器 - 协调多个同步任务的执行
 */

export interface SyncTask {
  id: string;
  type: 'check' | 'transform' | 'report';
  input: string;
  config?: Record<string, unknown>;
}

export interface SyncResult {
  taskId: string;
  status: 'success' | 'failure' | 'partial';
  outputs: unknown[];
  logs: string[];
}

/**
 * 协调多个同步任务的执行
 */
export function coordinateSync(tasks: SyncTask[]): SyncResult {
  const outputs: unknown[] = [];
  const logs: string[] = [];
  let hasFailure = false;
  let hasSuccess = false;

  for (const task of tasks) {
    logs.push(`[${task.id}] 开始执行 ${task.type} 任务`);

    try {
      const output = executeTask(task);
      outputs.push(output);
      logs.push(`[${task.id}] 任务完成`);
      hasSuccess = true;
    } catch (error) {
      const errorMsg = error instanceof Error ? error.message : String(error);
      logs.push(`[${task.id}] 任务失败: ${errorMsg}`);
      hasFailure = true;
    }
  }

  const status: SyncResult['status'] =
    hasFailure && hasSuccess ? 'partial' :
      hasFailure ? 'failure' : 'success';

  return {
    taskId: tasks.map(t => t.id).join(','),
    status,
    outputs,
    logs
  };
}

/**
 * 执行单个同步任务
 */
export function executeTask(task: SyncTask): unknown {
  switch (task.type) {
    case 'check':
      return {
        type: 'check',
        input: task.input,
        passed: true,
        checkedAt: new Date().toISOString()
      };
    case 'transform':
      return {
        type: 'transform',
        input: task.input,
        output: '',
        transformedAt: new Date().toISOString()
      };
    case 'report':
      return {
        type: 'report',
        input: task.input,
        generated: true,
        generatedAt: new Date().toISOString()
      };
    default:
      throw new Error(`未知任务类型: ${(task as SyncTask).type}`);
  }
}
