const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8787";

class ApiClient {
  private sessionToken: string | null = null;

  constructor() {
    this.sessionToken = localStorage.getItem("sessionToken");
  }

  setSessionToken(token: string | null) {
    this.sessionToken = token;
    if (token) {
      localStorage.setItem("sessionToken", token);
    } else {
      localStorage.removeItem("sessionToken");
    }
  }

  getSessionToken() {
    return this.sessionToken;
  }

  private async request<T>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
      ...(options.headers as Record<string, string>),
    };

    if (this.sessionToken) {
      headers["Authorization"] = `Bearer ${this.sessionToken}`;
    }

    const response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || `HTTP ${response.status}`);
    }

    return response.json();
  }

  // Auth endpoints
  async login(email: string) {
    return this.request<{ message: string; token?: string }>("/auth/login", {
      method: "POST",
      body: JSON.stringify({ email }),
    });
  }

  async verify(token: string) {
    return this.request<{ message: string; sessionToken: string }>(
      "/auth/verify",
      {
        method: "POST",
        body: JSON.stringify({ token }),
      }
    );
  }

  async getMe() {
    return this.request<{ userId: string; email: string }>("/auth/me");
  }

  async logout() {
    await this.request("/auth/logout", { method: "POST" });
    this.setSessionToken(null);
  }

  // Dev endpoint for local testing
  async getPendingVerifications() {
    return this.request<{
      pending: Array<{ email: string; token: string; expiresAt: string }>;
    }>("/auth/dev/pending");
  }
}

export const api = new ApiClient();
