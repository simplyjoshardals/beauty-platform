import { API_ROUTES } from "./apiRoutes";
import { PATHS } from "./paths";

export interface ApiFetchOptions extends RequestInit {
  authRequired?: boolean;
  timeout?: number;
}

// Singleton refresh promise to prevent concurrent refresh attempts
let refreshPromise: Promise<boolean> | null = null;

function timeoutPromise<T>(ms: number, promise: Promise<T>): Promise<T> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      reject(new Error("Request timeout"));
    }, ms);

    promise
      .then((res) => {
        clearTimeout(timer);
        resolve(res);
      })
      .catch((err) => {
        clearTimeout(timer);
        reject(err);
      });
  });
}

async function safeJsonParse(response: Response) {
  try {
    return await response.json();
  } catch {
    return { success: false, error: "Invalid JSON response" };
  }
}

async function attemptRefresh(): Promise<boolean> {
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {
    try {
      const refreshRes = await fetch(API_ROUTES.AUTH.REFRESH_TOKEN, {
        method: "POST",
        credentials: "include",
      });

      if (!refreshRes.ok) {
        return false;
      }

      const refreshData = await safeJsonParse(refreshRes);
      return refreshData.success === true;
    } catch {
      return false;
    } finally {
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export async function apiFetch(input: RequestInfo, init?: ApiFetchOptions) {
  const opts = init || {};
  const authRequired = opts.authRequired ?? true;
  const timeout = opts.timeout ?? 15000;

  const headers: Record<string, string> = {
    ...((opts.headers as Record<string, string>) || {}),
  };

  if (opts.body && !(opts.body instanceof FormData)) {
    headers["Content-Type"] = "application/json";
  }

  // ---- MAIN REQUEST ---- //
  let response: Response;
  try {
    response = await timeoutPromise(
      timeout,
      fetch(input, {
        ...opts,
        headers,
        credentials: "include",
      }),
    );
  } catch (err) {
    return {
      success: false,
      error: "Network error or timeout",
      detail: String(err),
    };
  }

  // ---- SUCCESS OR NOT AUTH REQUIRED ---- //
  if (!authRequired || response.status !== 401) {
    return safeJsonParse(response);
  }

  // ---- ATTEMPT REFRESH (ONLY ONCE ACROSS ALL REQUESTS) ---- //
  const refreshSuccess = await attemptRefresh();

  if (!refreshSuccess) {
    // Was hardcoded "/auth/login" — that route no longer exists; the
    // app now has one unified /auth entry point (PATHS.AUTH), reached
    // from RequireAuth/AuthGateModal on the frontend the same way.
    if (typeof window !== "undefined") {
      window.location.href = PATHS.AUTH;
    }
    return { success: false, error: "Invalid or expired session" };
  }

  // ---- RETRY ORIGINAL REQUEST ---- //
  try {
    response = await timeoutPromise(
      timeout,
      fetch(input, {
        ...opts,
        headers,
        credentials: "include",
      }),
    );
  } catch (err) {
    return {
      success: false,
      error: "Network error after refresh",
      detail: String(err),
    };
  }

  // ---- IF RETRY ALSO 401, SESSION IS DEAD — REDIRECT ---- //
  if (response.status === 401) {
    if (typeof window !== "undefined") {
      window.location.href = PATHS.AUTH;
    }
    return { success: false, error: "Session expired. Redirecting to login." };
  }

  return safeJsonParse(response);
}
