import * as SecureStore from "expo-secure-store";
import { router } from "expo-router";

export const TOKEN_KEY = "access_token";

export async function getToken() {
    return await SecureStore.getItemAsync(TOKEN_KEY);
}

export async function clearToken() {
    await SecureStore.deleteItemAsync(TOKEN_KEY);
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

