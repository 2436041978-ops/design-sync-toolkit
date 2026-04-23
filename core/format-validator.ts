import * as yaml from 'js-yaml';
import Ajv from 'ajv';
import * as fs from 'fs';
import * as path from 'path';

/**
 * 校验结果接口
 */
export interface ValidationResult {
  valid: boolean;
  errors?: string[];
}

/**
 * 基于 AJV 的格式校验器
 * 加载 baseline-format.json Schema 对 YAML 内容进行合规检查
 */
export class FormatValidator {
  private ajv: Ajv;
  private validateFn: ReturnType<Ajv['compile']> | null = null;
  private schemaLoaded: boolean = false;

  constructor() {
    this.ajv = new Ajv({ allErrors: true, strict: false });
  }

  /**
   * 加载 JSON Schema 文件
   */
  private loadSchema(): void {
    if (this.schemaLoaded) return;

    try {
      const schemaPath = path.join(__dirname, 'baseline-format.json');
      const schemaContent = fs.readFileSync(schemaPath, 'utf-8');
      const schema = JSON.parse(schemaContent);
      this.validateFn = this.ajv.compile(schema);
      this.schemaLoaded = true;
    } catch (err) {
      throw new Error(`Failed to load baseline format schema: ${(err as Error).message}`);
    }
  }

  /**
   * 校验 YAML 内容是否符合基线格式规范
   * @param yamlContent - YAML 格式字符串
   * @returns ValidationResult - 校验结果
   */
  validate(yamlContent: string): ValidationResult {
    try {
      this.loadSchema();

      // 将 YAML 解析为 JSON 对象
      const parsed = yaml.load(yamlContent);

      if (parsed === null || typeof parsed !== 'object') {
        return {
          valid: false,
          errors: ['YAML content is empty or not a valid object']
        };
      }

      // 执行 Schema 校验
      const valid = this.validateFn ? this.validateFn(parsed) : false;

      if (!valid && this.validateFn && this.validateFn.errors) {
        const errors = this.validateFn.errors.map((err: any) => {
          const path = err.instancePath ? err.instancePath : 'root';
          return `${path}: ${err.message}`;
        });
        return { valid: false, errors };
      }

      return { valid: true };
    } catch (err) {
      return {
        valid: false,
        errors: [`YAML parse error: ${(err as Error).message}`]
      };
    }
  }

  /**
   * 静态便捷方法：快速校验 YAML 字符串
   */
  static quickValidate(yamlContent: string): ValidationResult {
    const validator = new FormatValidator();
    return validator.validate(yamlContent);
  }
}

export default FormatValidator;
