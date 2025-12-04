import { COLORS } from "@/constants/colors";
import { Patient } from "@/constants/types";
import { apiFetch } from "@/lib/api";
import { Ionicons } from "@expo/vector-icons";
import { useEffect, useState } from "react";
import { Modal, Text, View, Pressable, StyleSheet, ActivityIndicator, TextInput } from "react-native";

interface DocumentationModalProps {
    patient?: Patient | null;
    patientSummary?: string | null;
    showSave?: boolean;
    setDocPatient: (p: Patient | null) => void;
}

export default function DocumentationModal({ patient, patientSummary, setDocPatient, showSave }: DocumentationModalProps) {
    const [loading, setLoading] = useState<boolean>(false);
    const [patSum, setPatSum] = useState<string | null>();

    useEffect(() => setPatSum(patientSummary), [])

    const handleSave = async () => {
        if (!patient?.Id) return;

        setLoading(true);

        try {
            const url = `http://localhost:8000/patients/${patient.Id}/save_summary?summary_text=${encodeURIComponent(
                patSum || ""
            )}`;

            const res = await apiFetch(url, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                }
            });

            const data = await res.json();
            console.log("AI summary saved:", data);

        } catch (e) {
            console.error("Failed to save summary", e);
        } finally {
            setLoading(false);
        }
    };



    return (
        <Modal
            visible={!!patient}
            animationType="fade"
            transparent
        >
            <View style={styles.modalOverlay}>
                <View style={styles.modalWrapper}>

                    {/* HEADER */}
                    <View style={styles.modalHeader}>
                        <Text style={styles.modalHeaderText}>
                            {patient?.FIRST} {patient?.LAST}
                        </Text>
                        <View style={styles.modalHeaderBtns}>
                            {loading ? <ActivityIndicator size="small" color="#fff" /> : null}

                            {showSave ?
                                <Pressable onPress={() => handleSave()}>
                                    <Ionicons name="save" size={28} color="white" />
                                </Pressable>
                                : null}
                            <Pressable onPress={() => setDocPatient(null)}>
                                <Ionicons name="close" size={28} color="white" />
                            </Pressable>
                        </View>
                    </View>

                    {/* MAIN CONTENT */}
                    <View style={styles.modalContent}>
                        {showSave ? <TextInput
                            style={styles.textInput}
                            multiline
                            value={patSum!}
                            onChangeText={setPatSum}
                            textAlignVertical="top"
                            placeholderTextColor="#999"
                        /> :
                            <Text style={{ color: "#333" }}>
                                {patientSummary}
                            </Text>
                        }
                    </View>

                </View>
            </View>
        </Modal>
    );
}

const styles = StyleSheet.create({
    /* Modal overlay (dims background) */
    modalOverlay: {
        flex: 1,
        backgroundColor: "rgba(0,0,0,0.5)",
        justifyContent: "center",
        alignItems: "center",
    },

    /* Centered modal container */
    modalWrapper: {
        width: "90%",
        height: "70%",
        backgroundColor: "white",
        borderRadius: 16,
        overflow: "hidden",
    },

    /* Header (colored bar with close button) */
    modalHeader: {
        backgroundColor: COLORS.primary,
        padding: 16,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },
    modalHeaderBtns: {
        backgroundColor: COLORS.primary,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
    },

    modalHeaderText: {
        color: "white",
        fontSize: 20,
        fontWeight: "600",
    },

    /* Main content area */
    modalContent: {
        flex: 1,
        backgroundColor: "white",
        padding: 20,
    },

    textInput: {
        height: "100%",
        borderColor: "#ccc",
        borderWidth: 1,
        borderRadius: 8,
        padding: 10,
        fontSize: 14,
        color: "#000",
        backgroundColor: "#fafafa",
    },
})