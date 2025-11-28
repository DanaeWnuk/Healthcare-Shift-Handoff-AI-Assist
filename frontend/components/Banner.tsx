// components/Banner.tsx
import { View, StyleSheet } from "react-native";
import * as colors from "@/constants/colors";
import Logo from "@/assets/logo";

export default function Banner() {
    return (
        <View style={styles.container}>
            {/* Logo */}
            <View style={styles.logoWrapper}>
                <Logo />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        paddingTop: 10,
        paddingBottom: 10,
        paddingStart: 10,
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "flex-start",
        backgroundColor: colors.COLORS.primary,
    },
    logoWrapper: {
        flexDirection: "row",
        alignItems: "center",
        gap: 8,
    },
});
