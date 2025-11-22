import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import BigLogo from '@/assets/biglogo'
import { setItemAsync } from '@/lib/secureStore';
import { COLORS } from '@/constants/colors'
import { apiFetch } from '@/lib/api';

export default function LoginScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignUp = () => {
        router.navigate('/signup');
    }

    const handleLogin = async () => {
        setError(null);
        if (!email.trim() || !password) {
            setError("Please enter an email and password.");
            return;
        }

        setLoading(true);

        try {
            const res = await apiFetch("http://localhost:8000/login", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                setError(body.detail || "Login failed");
                setLoading(false);
                return;
            }

            const data = await res.json();
            const token = data.access_token;
            if (!token) {
                setError("No token returned from server");
                setLoading(false);
                return;
            }

            // save token securely
            await setItemAsync("access_token", token);

            // navigate to dashboard (replace or push as you prefer)
            router.replace("/dashboard");
        } catch (e) {
            console.error("Login error", e);
            setError("Network error");
        } finally {
            setLoading(false);
        }
    };

    return (
        <View style={styles.container}>
            <BigLogo />
            <View style={styles.box}>
                <TextInput
                    style={styles.input}
                    placeholder="Email"
                    autoCapitalize='none'
                    autoComplete='email'
                    keyboardType='email-address'
                    placeholderTextColor="#aaa"
                    value={email}
                    onChangeText={setEmail}
                />
                <TextInput
                    style={styles.input}
                    placeholder="Password"
                    placeholderTextColor="#aaa"
                    secureTextEntry
                    value={password}
                    onChangeText={setPassword}
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Pressable style={styles.button} onPress={handleLogin} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign In</Text>}
                </Pressable>
                <Pressable style={styles.button} onPress={handleSignUp} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
                </Pressable>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
    box: {
        marginTop: 40,
        width: '80%',
        backgroundColor: COLORS.accent,
        borderRadius: 20,
        padding: 20,
    },
    button: {
        backgroundColor: COLORS.dark,
        padding: 14,
        borderRadius: 8,
        alignItems: "center",
        marginBottom: 7,
    },
    error: {
        color: "crimson",
        marginBottom: 12
    },
    buttonText: {
        color: "#fff", fontWeight: "600"
    },
    input: {
        backgroundColor: COLORS.light,
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
})

// auth helpers live in `frontend/lib/auth.ts`
