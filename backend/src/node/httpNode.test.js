const HttpNode = require("./httpNode");
describe("HttpNode", () => {

  // ── validate() tests ──────────────────────────────────────────────

  test("validate fails when url is missing", () => {
    const node = new HttpNode({ method: "GET" });
    expect(node.validate()).toContain("url is required");
  });

  test("validate fails when method is missing", () => {
    const node = new HttpNode({ url: "https://example.com" });
    expect(node.validate()).toContain("method is required");
  });

  test("validate fails when method is invalid", () => {
    const node = new HttpNode({ url: "https://example.com", method: "JUMP" });
    const errors = node.validate();
    expect(errors.some(e => e.includes("method must be one of"))).toBe(true);
  });

  test("validate passes with valid config", () => {
    const node = new HttpNode({ url: "https://example.com", method: "GET" });
    expect(node.validate()).toEqual([]);
  });

  // ── execute() tests ───────────────────────────────────────────────

  test("fetches real data from jsonplaceholder", async () => {
    const node = new HttpNode({
      url: "https://jsonplaceholder.typicode.com/users/1",
      method: "GET"
    });
    const result = await node.safeExecute({});
    expect(result.success).toBe(true);
    expect(result.output.statusCode).toBe(200);
    expect(result.output.body.name).toBe("Leanne Graham");
  }, 10000);

  test("resolves {{variables}} in url from input", async () => {
    const node = new HttpNode({
      url: "https://jsonplaceholder.typicode.com/users/{{userId}}",
      method: "GET"
    });
    const result = await node.safeExecute({ userId: 2 });
    expect(result.success).toBe(true);
    expect(result.output.body.id).toBe(2);
  }, 10000);

  test("returns failure cleanly on invalid url", async () => {
    const node = new HttpNode({
      url: "https://this-url-does-not-exist-xyz.com",
      method: "GET",
      timeout: 3000
    });
    const result = await node.safeExecute({});
    expect(result.success).toBe(false);
    expect(result.error).toBeTruthy();
  }, 10000);

  test("getSchema returns correct nodeType and fields", () => {
    const node = new HttpNode({});
    const schema = node.getSchema();
    expect(schema.nodeType).toBe("http");
    expect(schema.fields.length).toBe(6);
    expect(schema.fields[0].name).toBe("url");
  });

});