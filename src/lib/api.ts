import { auth } from './firebase.ts';

export class ApiError extends Error {
  status: number;
  issues?: string[];

  constructor(message: string, status: number, issues?: string[]) {
    super(message);
    this.status = status;
    this.issues = issues;
  }
}

export async function apiFetch<T>(
  path: string,
  options: RequestInit = {},
  explicitToken?: string | null
): Promise<T> {
  const headers = new Headers(options.headers);
  if (options.body && !headers.has('Content-Type')) {
    headers.set('Content-Type', 'application/json');
  }

  let token = explicitToken;
  if (!token && auth.currentUser) {
    token = await auth.currentUser.getIdToken();
  }
  if (token) {
    headers.set('Authorization', `Bearer ${token}`);
  }

  const response = await fetch(path, {
    ...options,
    headers,
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new ApiError(
      payload?.error || `Request failed (${response.status})`,
      response.status,
      Array.isArray(payload?.issues) ? payload.issues : undefined
    );
  }

  return payload as T;
}
