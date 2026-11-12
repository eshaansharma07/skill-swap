export interface ApiResponse<T = any> {
  data?: T;
  error?: ProblemDetail;
}

export interface ProblemDetail {
  type?: string;
  title?: string;
  status: number;
  detail?: string;
  instance?: string;
  violations?: Array<{
    field: string;
    message: string;
    rejectedValue?: any;
  }>;
}

export class ApiError extends Error {
  problem: ProblemDetail;

  constructor(problem: ProblemDetail) {
    super(problem.detail || problem.title || "An error occurred");
    this.name = "ApiError";
    this.problem = problem;
  }
}

const BASE_URL = typeof window !== "undefined" ? "" : process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:8080";

export async function apiFetch<T>(
  endpoint: string,
  options: RequestInit = {}
): Promise<T> {
  const url = `${BASE_URL}${endpoint.startsWith("/") ? endpoint : `/${endpoint}`}`;
  
  const headers = new Headers(options.headers || {});
  if (!headers.has("Content-Type") && !(options.body instanceof FormData)) {
    headers.set("Content-Type", "application/json");
  }

  const config: RequestInit = {
    ...options,
    headers,
    credentials: "include", // Send & receive httpOnly cookies
  };

  const response = await fetch(url, config);

  if (response.status === 204) {
    return {} as T;
  }

  const contentType = response.headers.get("content-type");
  const isJson = contentType && contentType.includes("json");
  const data = isJson ? await response.json() : await response.text();

  if (!response.ok) {
    const problem: ProblemDetail = isJson
      ? data
      : {
          status: response.status,
          title: response.statusText,
          detail: String(data),
        };
    throw new ApiError(problem);
  }

  return data as T;
}
