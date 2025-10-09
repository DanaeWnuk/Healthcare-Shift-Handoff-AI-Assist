import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as colors from "../constants/colors"; // adjust path if needed

export default function DocsPanel() {
    return (
        <View style={styles.container}>
            {/* Header */}
            <View style={styles.headerRow}>
                <Text style={styles.title}>Documentation / Notes</Text>
                <View style={styles.iconRow}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="create-outline" size={20} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="add-outline" size={22} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="save-outline" size={22} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content Box */}
            <View style={styles.innerBox}>
                {/* TODO: add editable text input or notes content */}
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 2,
        backgroundColor: colors.COLORS.primary,
        borderRadius: 15,
        padding: 15,
    },
    headerRow: {
        flexDirection: "row",
        alignItems: "center",
        justifyContent: "space-between",
        marginBottom: 10,
    },
    title: {
        fontSize: 16,
        fontWeight: "bold",
        color: "#fff",
    },
    iconRow: {
        flexDirection: "row",
        alignItems: "center",
        gap: 10,
    },
    iconButton: {
        backgroundColor: "#fff",
        padding: 6,
        borderRadius: 8,
        elevation: 2, // subtle shadow
    },
    innerBox: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 10,
    },
});
