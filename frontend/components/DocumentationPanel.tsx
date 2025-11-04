import React, { useState } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as colors from "../constants/colors";

export default function DocsPanel() {
    const [situation, setSituation] = useState("");
    const [background, setBackground] = useState("");
    const [assessment, setAssessment] = useState("");
    const [recommendation, setRecommendation] = useState("");

    const handleSave = () => {
        const note = { situation, background, assessment, recommendation };
        console.log("Saving SBAR note:", note);
        alert("SBAR note saved (front end only for now)");
        
        const res = await fetch("http://localhost:8000/summarize", { //Sends a POST request to the backend
            method: "POST",
            headers: {
                "Content-Type": "application/json",
            },
            body: JSON.stringify(note),
        });
        
        const data = await res.json(); //Waits for the backend (FastAPI) to return the summary and converts it to a JSON (WARNING: It's been a long time since I touched JavaScript, so let me know if anything seems wrong!)
    };

    const renderSection = (label: string, value: string, onChange: (t: string) => void) => (
        <View style={styles.section}>
            <Text style={styles.sectionTitle}>{label}</Text>
            <TextInput
                style={styles.textInput}
                multiline
                placeholder={`Enter ${label.toLowerCase()} here...`}
                value={value}
                onChangeText={onChange}
                textAlignVertical="top"
                placeholderTextColor="#999"
            />
        </View>
    );

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === "ios" ? "padding" : undefined}
            style={styles.container}
        >
            {/* Header */}
            <View style={styles.headerRow}>
                <Text style={styles.title}>Documentation / SBAR Notes</Text>
                <View style={styles.iconRow}>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="create-outline" size={20} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton}>
                        <Ionicons name="add-outline" size={22} color="#000" />
                    </TouchableOpacity>
                    <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
                        <Ionicons name="save-outline" size={22} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Content */}
            <ScrollView style={styles.innerBox} contentContainerStyle={{ paddingBottom: 30 }}>
                {renderSection("Situation", situation, setSituation)}
                {renderSection("Background", background, setBackground)}
                {renderSection("Assessment", assessment, setAssessment)}
                {renderSection("Recommendation", recommendation, setRecommendation)}
            </ScrollView>
        </KeyboardAvoidingView>
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
        elevation: 2,
    },
    innerBox: {
        flex: 1,
        backgroundColor: "#fff",
        borderRadius: 10,
        padding: 10,
    },
    section: {
        marginBottom: 15,
    },
    sectionTitle: {
        fontSize: 14,
        fontWeight: "bold",
        marginBottom: 5,
        color: "#333",
    },
    textInput: {
        minHeight: 80,
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: "#000",
        backgroundColor: "#fafafa",
    },
});
