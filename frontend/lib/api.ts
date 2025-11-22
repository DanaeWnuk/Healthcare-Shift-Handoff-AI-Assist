import { getAuthHeaders, clearToken, redirectToLogin } from "./auth";

export async function apiFetch(input: string, init: RequestInit = {}) {
    const headers = { ...(init.headers || {}), ...(await getAuthHeaders()) };
    const res = await fetch(input, { ...init, headers });

    if (res.status === 401) {
        // token invalid or expired — clear locally and redirect
        await clearToken();
        redirectToLogin();
        throw new Error("Unauthorized");
    }

    return res;
}

