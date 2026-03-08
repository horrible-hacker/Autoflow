const BaseNode = require("./basenode");

describe("BaseNode", () => {

  test("throws if execute() not implemented", async () => {
    const node = new BaseNode({});
    const result = await node.safeExecute({});
    expect(result.success).toBe(false);
    expect(result.error).toContain("not implemented");
  });

  test("resolveTemplate replaces {{variable}} with value", () => {
    const node = new BaseNode({});
    const result = node.resolveTemplate("Hello {{name}}", { name: "Raj" });
    expect(result).toBe("Hello Raj");
  });

  test("resolveTemplate handles nested paths like {{user.name}}", () => {
    const node = new BaseNode({});
    const result = node.resolveTemplate(
      "Hello {{user.name}}",
      { user: { name: "Raj" } }
    );
    expect(result).toBe("Hello Raj");
  });

  test("resolveTemplate leaves unmatched {{var}} unchanged", () => {
    const node = new BaseNode({});
    const result = node.resolveTemplate("Hello {{unknown}}", {});
    expect(result).toBe("Hello {{unknown}}");
  });

  test("safeExecute returns validation errors cleanly", async () => {
    class BrokenNode extends BaseNode {
      validate() { return ["url is required", "method is required"]; }
    }
    const node = new BrokenNode({});
    const result = await node.safeExecute({});
    expect(result.success).toBe(false);
    expect(result.error).toContain("url is required");
  });

  test("safeExecute catches thrown errors from execute()", async () => {
    class ExplodingNode extends BaseNode {
      async execute() { throw new Error("Something blew up"); }
      validate() { return []; }
    }
    const node = new ExplodingNode({});
    const result = await node.safeExecute({});
    expect(result.success).toBe(false);
    expect(result.error).toBe("Something blew up");
  });

  test("safeExecute returns success with output on happy path", async () => {
    class GoodNode extends BaseNode {
      async execute(input) { return { message: "worked", input }; }
      validate() { return []; }
    }
    const node = new GoodNode({});
    const result = await node.safeExecute({ foo: "bar" });
    expect(result.success).toBe(true);
    expect(result.output.message).toBe("worked");
    expect(result.output.input.foo).toBe("bar");
  });

});