import { Platform } from "react-native";
import * as ExpoSecureStore from "expo-secure-store";

export async function getItemAsync(key: string): Promise<string | null> {
    if (Platform.OS === "web") {
        try {
            return Promise.resolve(localStorage.getItem(key));
        } catch (e) {
            return Promise.resolve(null);
        }
    }

    return ExpoSecureStore.getItemAsync(key);
}

export async function setItemAsync(key: string, value: string): Promise<void> {
    if (Platform.OS === "web") {
        try {
            localStorage.setItem(key, value);
            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    }

    return ExpoSecureStore.setItemAsync(key, value);
}

export async function deleteItemAsync(key: string): Promise<void> {
    if (Platform.OS === "web") {
        try {
            localStorage.removeItem(key);
            return Promise.resolve();
        } catch (e) {
            return Promise.reject(e);
        }
    }

    return ExpoSecureStore.deleteItemAsync(key);
}
