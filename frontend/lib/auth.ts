import { router } from "expo-router";
import { getItemAsync, deleteItemAsync } from "./secureStore";

export const TOKEN_KEY = "access_token";

export async function getToken() {
    return await getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
    await deleteItemAsync(TOKEN_KEY);
}

// auth.ts
export async function logout() {
    try {
        const token = await getToken();
        if (token) {
            await fetch(`/logout`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });
        }
    } catch (e) {
        console.warn("Server logout failed (it's safe to ignore):", e);
    }

    await clearToken();
    redirectToLogin();
}


export async function getAuthHeaders() {
    const token = await getToken();
    if (token) {
        return {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
        };
    }

    return { "Content-Type": "application/json" };
}

export function redirectToLogin() {
    // replace so user can't go back to protected page
    router.replace("/login");
}
