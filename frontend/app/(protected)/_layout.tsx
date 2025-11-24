// app/_layout.tsx
import { Stack } from "expo-router";
import useRequireAuth from "@/hooks/useRequireAuth";
import { ActivityIndicator, View, StyleSheet } from "react-native";
import Banner from "@/components/Banner";
import BottomToolbar from "@/components/BottomToolbar";
import { COLORS } from "@/constants/colors";

export default function ProtectedLayout() {
    const { checking } = useRequireAuth();
    if (checking) return <View style={{ flex: 1, justifyContent: "center" }}><ActivityIndicator /></View>;

    return (
        <View style={styles.container}>
            <Banner />

            <View style={styles.content}>
                <Stack />
            </View>

            <BottomToolbar />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 0,
        backgroundColor: COLORS.background,
    },
    content: {
        flex: 1,
        minHeight: 0,
        width: "100%",
        alignSelf: "center",
    },
});
