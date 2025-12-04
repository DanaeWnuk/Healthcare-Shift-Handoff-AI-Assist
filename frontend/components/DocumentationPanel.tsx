// components/DocumentationPanel.tsx
import React, { useState, useEffect } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    ActivityIndicator,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as colors from "../constants/colors";
import { apiFetch } from "@/lib/api";
import DocumentationModal from "./DocumentationModal";
import { Patient } from "@/constants/types";

interface DocumentationPanelProps {
    selectedPatient: Patient;
}

export default function DocsPanel({ selectedPatient }: DocumentationPanelProps) {
    const [situation, setSituation] = useState("");
    const [background, setBackground] = useState("");
    const [assessment, setAssessment] = useState("");
    const [recommendation, setRecommendation] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [message, setMessage] = useState<string | null>(null);
    const [docPatient, setDocPatient] = useState<Patient | null>(null);

    useEffect(() => {
        const fetchDocumentation = async (patientId: string) => {
            setLoading(true);
            setError(null);
            try {
                const res = await apiFetch(`http://localhost:8000/patients/${patientId}`);
                if (!res.ok) throw new Error("Failed to fetch documentation");
                const data = await res.json();
                const doc = Array.isArray(data) ? data[0] : (data && data[0]) || {};
                setSituation(doc.situation || doc.SITUATION || "");
                setBackground(doc.background || doc.BACKGROUND || "");
                setAssessment(doc.assessment || doc.ASSESSMENT || "");
                setRecommendation(doc.recommendation || doc.RECOMMENDATION || "");
            } catch (e: any) {
                setError(e?.message || "Failed to load documentation");
                setSituation("");
                setBackground("");
                setAssessment("");
                setRecommendation("");
            } finally {
                setLoading(false);
            }
        };

        const patientId =
            selectedPatient &&
            (selectedPatient.Id);

        if (selectedPatient) {
            if (!patientId) {
                setError("Selected patient has no detectable ID field");
                return;
            }
            fetchDocumentation(String(patientId));
        } else {
            setSituation("");
            setBackground("");
            setAssessment("");
            setRecommendation("");
            setError(null);
        }
    }, [selectedPatient]);

    const handleSave = async () => {
        const note = { situation, background, assessment, recommendation };
        try {
            setLoading(true);
            const res = await apiFetch("http://localhost:8000/summarize", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify(note),
            });

            const data = await res.json().finally(() => { setLoading(false); setDocPatient(selectedPatient) });
            if (data && data.summary) {
                setMessage(data.summary);
            } else {
                setMessage('Error generating summary');
            }
        } catch (e: any) {
            console.error("Failed to save/get summary:", e);
            alert("Failed to save note or retrieve summary");
        }
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
            style={[styles.container, { flexShrink: 1 }]}
        >
            <View style={styles.headerRow}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                    <Text style={styles.title}>Documentation</Text>
                    {selectedPatient ? (
                        <Text style={styles.patientName} numberOfLines={1} ellipsizeMode="tail">
                            {`${selectedPatient.FIRST || selectedPatient.LAST || ""}`}
                        </Text>
                    ) : null}
                    {loading ? <ActivityIndicator size="small" color="#fff" /> : null}
                </View>

                <View style={styles.iconRow}>
                    <TouchableOpacity style={styles.iconButton} onPress={handleSave}>
                        <Ionicons name="save-outline" size={22} color="#000" />
                    </TouchableOpacity>
                </View>
            </View>

            {/* Make ScrollView fill available space (flex:1) and be bounded */}
            <ScrollView style={styles.innerBox} contentContainerStyle={{ paddingBottom: 30 }}>
                {error ? (
                    <View style={{ padding: 8 }}>
                        <Text style={styles.errorText}>{error}</Text>
                    </View>
                ) : null}

                {selectedPatient ? (
                    <>
                        {renderSection("Situation", situation, setSituation)}
                        {renderSection("Background", background, setBackground)}
                        {renderSection("Assessment", assessment, setAssessment)}
                        {renderSection("Recommendation", recommendation, setRecommendation)}
                    </>
                ) :
                    <Text>Select a patient to begin documentation.</Text>
                }
            </ScrollView>
            <DocumentationModal patient={docPatient} setDocPatient={setDocPatient} patientSummary={message} showSave={true} />
        </KeyboardAvoidingView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 0,
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
        flex: 1, // ensures the ScrollView is bounded and will scroll internally
        minHeight: 0,
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
    patientName: {
        color: "#fff",
        fontSize: 13,
        opacity: 0.9,
        maxWidth: 180,
    },
    errorText: {
        color: "#fff",
        backgroundColor: "#d9534f",
        padding: 8,
        borderRadius: 8,
    },
});
