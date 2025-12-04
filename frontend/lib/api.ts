import { getAuthHeaders, clearToken, redirectToLogin } from "./auth";

// Safe fetch wrapper that merges headers into a proper Headers instance.
export async function apiFetch(input: string, init: RequestInit = {}): Promise<Response> {
    try {
        // Build a Headers object from any incoming init.headers
        const merged = new Headers(init.headers as HeadersInit | undefined);

        // Merge auth headers (ensures no undefined values are set)
        const authHeaders = await getAuthHeaders();
        Object.entries(authHeaders).forEach(([k, v]) => {
            if (v !== undefined && v !== null) merged.set(k, String(v));
        });

        const res = await fetch(input, { ...init, headers: merged });

        if (res.status === 401) {
            // token invalid or expired — clear locally and redirect
            try {
                await clearToken();
            } catch (e) {
                console.warn("apiFetch: clearToken failed", e);
            }
            redirectToLogin();
            throw new Error("Unauthorized");
        }

        return res;
    } catch (err) {
        console.error("apiFetch error", err, { input, init });
        throw err;
    }
}

