const API_BASE = import.meta.env.VITE_API_URL ?? "";

export interface ApiEnvelope<T = unknown> {
  success: boolean;
  data: T | null;
  error: { code: string; message: string } | null;
  meta: Record<string, unknown> | null;
}

async function request<T>(
  path: string,
  options: RequestInit = {},
): Promise<{ status: number; body: ApiEnvelope<T> }> {
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(options.headers ?? {}),
    },
  });

  const body = (await response.json()) as ApiEnvelope<T>;
  return { status: response.status, body };
}

export const api = {
  register(input: { email: string; password: string; displayName: string }) {
    return request<{ message: string; email: string }>("/api/v1/auth/register", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  verify(token: string) {
    return request<{ message: string; email?: string; displayName?: string }>(
      "/api/v1/auth/verify",
      {
        method: "POST",
        body: JSON.stringify({ token }),
      },
    );
  },

  login(input: { email: string; password: string }) {
    return request<{
      accessToken: string;
      elf: { id: string; email: string; displayName: string };
    }>("/api/v1/auth/login", {
      method: "POST",
      body: JSON.stringify(input),
    });
  },

  workshopBoard(token: string) {
    return request<{
      greeting: string;
      stats: {
        sledsReady: number;
        bearsPacked: number;
        trainsInProgress: number;
        elvesOnShift: number;
      };
      toys: Array<{
        id: string;
        name: string;
        status: string;
        workshop: string;
      }>;
    }>("/api/v1/workshop/board", {
      headers: { Authorization: `Bearer ${token}` },
    });
  },
};
