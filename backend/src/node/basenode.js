class BaseNode {
  constructor(config = {}) {
    this.config = config;
    this.nodeType = "base";
  }
  validate() {
    return [];
  }
   async execute(input = {}) {
    throw new Error(`execute() not implemented in ${this.nodeType}`);
  }
  getSchema() {
        return {
            nodeType: this.nodeType,
            fields: []
        };
    }

    async safeExecute(input = {}) {
    const errors = this.validate();
    if (errors.length > 0) {
        return {
        success: false,
        output: null,
        error: `Validation failed: ${errors.join(", ")}`,
        nodeType: this.nodeType,
        duration: 0
        };
    }

    const startTime = Date.now();
    try {
        const result = await this.execute(input);
        return {
        success: true,
        output: result,
        error: null,
        nodeType: this.nodeType,
        duration: Date.now() - startTime
        };
    } catch (err) {
        return {
        success: false,
        output: null,
        error: err.message || "Unknown error",
        nodeType: this.nodeType,
        duration: Date.now() - startTime
        };
    }
    }
    resolveTemplate(template, data = {}) {
        if (typeof template !== "string") return template;
        return template.replace(/\{\{([\w.]+)\}\}/g, (match, path) => {
            const value = path.split(".").reduce((obj, key) => {
            return obj && obj[key] !== undefined ? obj[key] : undefined;
            }, data);
            return value !== undefined ? value : match;
        });
        }
    resolveConfig(config, data = {}) {
        const resolved = {};
        for (const [key, value] of Object.entries(config)) {
            if (typeof value === "string") {
            resolved[key] = this.resolveTemplate(value, data);
            } else if (typeof value === "object" && value !== null) {
            resolved[key] = this.resolveConfig(value, data);
            } else {
            resolved[key] = value;
            }
        }
        return resolved;
        }
}

module.exports = BaseNode;