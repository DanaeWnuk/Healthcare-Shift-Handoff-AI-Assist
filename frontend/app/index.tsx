import { useEffect } from 'react'
import { View, StyleSheet } from 'react-native'
import { router } from 'expo-router'
import BigLogo from '@/assets/biglogo';
import {COLORS} from "@/constants/colors";

export default function SplashScreen() {
    useEffect(() => {
        const timer = setTimeout(() => router.replace('/login' as any), 2000)
        return () => clearTimeout(timer)
    }, [])

    return (
        <View style={styles.container}>
            <BigLogo />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: COLORS.background,
    },
});
