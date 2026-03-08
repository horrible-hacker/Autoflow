const axios = require("axios");
const BaseNode = require("./basenode");
class HttpNode extends BaseNode {
  constructor(config = {}) {
    super(config);
    this.nodeType = "http";
  }
  validate() {
        const errors = [];

        if (!this.config.url) {
            errors.push("url is required");
        }

        if (!this.config.method) {
            errors.push("method is required");
        }

        const validMethods = ["GET", "POST", "PUT", "PATCH", "DELETE"];
        if (this.config.method && !validMethods.includes(this.config.method.toUpperCase())) {
            errors.push(`method must be one of: ${validMethods.join(", ")}`);
        }

        return errors;
    }
    async execute(input = {}) {
            const resolved = this.resolveConfig(this.config, input);

            const { url, method, headers = {}, body = null, params = {}, timeout = 5000 } = resolved;

            const requestConfig = {
                url,
                method: method.toUpperCase(),
                headers,
                params,
                timeout
            };

            if (body && ["POST", "PUT", "PATCH"].includes(method.toUpperCase())) {
                requestConfig.data = body;
            }

            const response = await axios(requestConfig);

            return {
                statusCode: response.status,
                body: response.data,
                headers: response.headers,
                success: true
            };
        }
        getSchema() {
            return {
                nodeType: "http",
                label: "HTTP Request",
                description: "Make an HTTP request to any API",
                fields: [
                {
                    name: "url",
                    label: "URL",
                    type: "text",
                    required: true,
                    placeholder: "https://api.example.com/users/{{userId}}"
                },
                {
                    name: "method",
                    label: "Method",
                    type: "select",
                    required: true,
                    options: ["GET", "POST", "PUT", "PATCH", "DELETE"],
                    default: "GET"
                },
                {
                    name: "headers",
                    label: "Headers",
                    type: "json",
                    required: false,
                    placeholder: '{ "Authorization": "Bearer {{token}}" }'
                },
                {
                    name: "body",
                    label: "Request Body",
                    type: "json",
                    required: false,
                    placeholder: '{ "name": "{{user.name}}" }'
                },
                {
                    name: "params",
                    label: "Query Params",
                    type: "json",
                    required: false,
                    placeholder: '{ "page": "1", "limit": "10" }'
                },
                {
                    name: "timeout",
                    label: "Timeout (ms)",
                    type: "number",
                    required: false,
                    default: 5000
                }
                ]
            };
        }
}
module.exports = HttpNode;