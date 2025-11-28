import { useState } from 'react'
import { View, Text, TextInput, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import { router } from 'expo-router'
import BigLogo from '@/assets/biglogo'
import { setItemAsync } from '@/lib/secureStore';
import { COLORS } from '@/constants/colors'
import { apiFetch } from '@/lib/api';

export default function SignupScreen() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const handleSignup = async () => {
        setError(null);
        if (!email.trim() || !password) {
            setError("Please enter an email and password.");
            return;
        }

        if (password !== confirmPassword) {
            setError("Passwords do not match.");
            return;
        }

        if (password.length < 6) {
            setError("Password must be at least 6 characters.");
            return;
        }

        setLoading(true);

        try {
            const res = await apiFetch("http://localhost:8000/signup", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ email: email.trim(), password, role: "" }),
            });

            if (!res.ok) {
                const body = await res.json().catch(() => ({}));
                // body.detail from FastAPI/Pydantic can be an array of error objects.
                let message = "Signup failed";
                if (body) {
                    if (typeof body.detail === 'string') {
                        message = body.detail;
                    } else if (Array.isArray(body.detail)) {
                        // map array items to readable messages if possible
                        try {
                            const parts = body.detail.map((d: any) => {
                                if (typeof d === 'string') return d;
                                if (d.msg) return d.msg;
                                if (d.message) return d.message;
                                // fallback to JSON snippet
                                return JSON.stringify(d);
                            });
                            message = parts.join('; ');
                        } catch {
                            message = JSON.stringify(body.detail);
                        }
                    } else if (typeof body.detail === 'object') {
                        message = JSON.stringify(body.detail);
                    } else if (body.error) {
                        message = String(body.error);
                    }
                }

                setError(message);
                setLoading(false);
                return;
            }

            const data = await res.json();

            // Some backends (like our Supabase signup flow) don't return an
            // access token on signup. If the signup response included a
            // token, use it; otherwise call the login endpoint to obtain one.
            let token = (data && data.access_token) || null;
            if (!token) {
                // attempt to login to get an access token
                try {
                    const loginRes = await apiFetch("http://localhost:8000/login", {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ email: email.trim(), password }),
                    });

                    if (loginRes.ok) {
                        const loginData = await loginRes.json().catch(() => ({}));
                        token = loginData.access_token || null;
                    } else {
                        // give the user a helpful message
                        const loginBody = await loginRes.json().catch(() => ({}));
                        setError(loginBody.detail || "Signup succeeded but automatic login failed. Please sign in.");
                    }
                } catch (e) {
                    console.warn("Automatic login after signup failed", e);
                    setError("Signup succeeded but automatic login failed. Please sign in.");
                }
            }

            if (!token) {
                setLoading(false);
                return;
            }

            // save token securely
            await setItemAsync("access_token", token);

            // navigate to dashboard
            router.replace("/dashboard");
        } catch (e) {
            console.error("Signup error", e);
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

                <TextInput
                    style={styles.input}
                    placeholder="Confirm password"
                    placeholderTextColor="#aaa"
                    secureTextEntry
                    value={confirmPassword}
                    onChangeText={setConfirmPassword}
                />

                {error ? <Text style={styles.error}>{error}</Text> : null}
                <Pressable style={styles.button} onPress={handleSignup} disabled={loading}>
                    {loading ? <ActivityIndicator color="#fff" /> : <Text style={styles.buttonText}>Sign Up</Text>}
                </Pressable>
                <Pressable onPress={() => router.push('/login')} style={{ marginTop: 12 }}>
                    <Text style={{ textAlign: 'center', color: COLORS.dark }}>Already have an account? Sign in</Text>
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
        alignItems: "center"
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
