import { describe, expect, it } from "vitest";
import { parseApiKey, parseBasicAuth } from "../lib/auth";

const decodeBase64 = (value: string) =>
  Buffer.from(value, "base64").toString("utf8");

describe("parseApiKey", () => {
  it("reads bearer token", () => {
    const apiKey = parseApiKey({ Authorization: "Bearer rc_test_123" });
    expect(apiKey).toBe("rc_test_123");
  });

  it("reads x-api-key header", () => {
    const apiKey = parseApiKey({ "X-API-Key": "rc_test_456" });
    expect(apiKey).toBe("rc_test_456");
  });

  it("returns null when missing", () => {
    const apiKey = parseApiKey({});
    expect(apiKey).toBeNull();
  });
});

describe("parseBasicAuth", () => {
  it("accepts matching password", () => {
    const header =
      "Basic " + Buffer.from("admin:secret", "utf8").toString("base64");
    const result = parseBasicAuth(header, "secret", decodeBase64);
    expect(result.ok).toBe(true);
    if (result.ok) {
      expect(result.username).toBe("admin");
    }
  });

  it("rejects mismatched password", () => {
    const header =
      "Basic " + Buffer.from("admin:wrong", "utf8").toString("base64");
    const result = parseBasicAuth(header, "secret", decodeBase64);
    expect(result.ok).toBe(false);
  });

  it("rejects missing header", () => {
    const result = parseBasicAuth(undefined, "secret", decodeBase64);
    expect(result.ok).toBe(false);
  });
});
