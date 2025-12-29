export type DecodeBase64 = (value: string) => string;

export function parseApiKey(headers: Record<string, string | undefined>) {
  const authHeader = headers["authorization"] ?? headers["Authorization"];
  const apiKeyHeader = headers["x-api-key"] ?? headers["X-API-Key"];

  if (authHeader?.startsWith("Bearer ")) {
    return authHeader.slice("Bearer ".length);
  }

  return apiKeyHeader ?? null;
}

export function parseBasicAuth(
  header: string | null | undefined,
  expectedPassword: string,
  decodeBase64: DecodeBase64
) {
  if (!header?.startsWith("Basic ")) {
    return { ok: false, reason: "missing" } as const;
  }

  const decoded = decodeBase64(header.slice("Basic ".length));
  const [username, password] = decoded.split(":");

  if (!username || password !== expectedPassword) {
    return { ok: false, reason: "invalid" } as const;
  }

  return { ok: true, username } as const;
}
