import { getAccessToken } from "@/lib/auth/token-storage";

type ApiErrorBody = {
  message?: string | string[];
  error?: string;
};

type ApiRequestOptions = RequestInit & {
  auth?: boolean;
};

const API_PROXY_BASE_PATH = "/api";
const PRODUCTION_API_ORIGIN = "https://collector-api-f9xu.onrender.com";

function getApiBaseUrl(): string {
  const configuredBaseUrl = process.env.NEXT_PUBLIC_API_BASE_URL?.trim();

  if (!configuredBaseUrl) {
    return process.env.NODE_ENV === "production"
      ? PRODUCTION_API_ORIGIN
      : API_PROXY_BASE_PATH;
  }

  return configuredBaseUrl.endsWith("/")
    ? configuredBaseUrl.slice(0, -1)
    : configuredBaseUrl;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = "ApiError";
  }
}

function buildErrorMessage(body: ApiErrorBody | null, fallback: string): string {
  if (!body) {
    return fallback;
  }

  if (Array.isArray(body.message)) {
    return body.message.join(", ");
  }

  if (typeof body.message === "string") {
    return body.message;
  }

  if (typeof body.error === "string") {
    return body.error;
  }

  return fallback;
}

function buildHeaders(
  options: ApiRequestOptions | undefined,
  hasBody: boolean,
): Headers {
  const headers = new Headers(options?.headers);

  if (!headers.has("Accept")) {
    headers.set("Accept", "application/json");
  }

  if (hasBody && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }

  if (options?.auth) {
    const accessToken = getAccessToken();

    if (accessToken && !headers.has("Authorization")) {
      headers.set("Authorization", `Bearer ${accessToken}`);
    }
  }

  return headers;
}

function resolveApiPath(path: string): string {
  const apiBaseUrl = getApiBaseUrl();

  if (path.startsWith("/")) {
    return `${apiBaseUrl}${path}`;
  }

  return `${apiBaseUrl}/${path}`;
}

export async function apiRequest<T>(
  path: string,
  options?: ApiRequestOptions,
): Promise<T> {
  const requestInit = { ...(options ?? {}) };
  delete requestInit.auth;
  const method = requestInit.method?.toUpperCase() ?? "GET";
  const hasBody =
    requestInit.body !== undefined && method !== "GET" && method !== "HEAD";
  const response = await fetch(resolveApiPath(path), {
    ...requestInit,
    headers: buildHeaders(options, hasBody),
    cache: "no-store",
  });

  if (!response.ok) {
    let body: ApiErrorBody | null = null;

    try {
      body = (await response.json()) as ApiErrorBody;
    } catch {
      body = null;
    }

    throw new ApiError(
      buildErrorMessage(body, `API request failed (${response.status})`),
      response.status,
    );
  }

  return (await response.json()) as T;
}

export function apiRequestWithAuth<T>(
  path: string,
  options?: RequestInit,
): Promise<T> {
  return apiRequest<T>(path, { ...options, auth: true });
}
