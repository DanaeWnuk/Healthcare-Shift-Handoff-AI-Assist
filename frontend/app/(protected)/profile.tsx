import { View, Text, StyleSheet, Pressable, ActivityIndicator } from 'react-native'
import BigLogo from '@/assets/biglogo'
import { COLORS } from '@/constants/colors'
import { logout } from '@/lib/auth'

export default function LoginScreen() {
    return (
        <View style={styles.container}>
            <BigLogo />
            <View style={styles.box}>
                <Text style={styles.text}>User Options</Text>
                <Pressable style={styles.button} onPress={logout}>
                    <Text style={styles.buttonText}>Log Out</Text>
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
    text: {
        color: "#fff",
        fontWeight: "600",
        margin: 12,
    },
    input: {
        backgroundColor: COLORS.light,
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
})
