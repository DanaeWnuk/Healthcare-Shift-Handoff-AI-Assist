import { useState } from 'react'
import { View, TextInput, Button, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import BigLogo from '@/assets/biglogo'
import { COLORS } from '@/constants/colors'

export default function LoginScreen() {
    const [userId, setUserId] = useState('')

    const handleSubmit = () => {
        if (userId.trim()) router.replace('/dashboard' as any);
    }

    return (
        <View style={styles.container}>
            <BigLogo />
            <View style={styles.box}>
                <TextInput
                    placeholder="User ID"
                    placeholderTextColor="#aaa"
                    value={userId}
                    onChangeText={setUserId}
                    style={styles.input}
                />
                <Button title="Submit" onPress={handleSubmit} color={COLORS.dark} />
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
    input: {
        backgroundColor: COLORS.light,
        padding: 12,
        borderRadius: 10,
        marginBottom: 12,
    },
})
