import { COLORS } from "@/constants/colors";
import { Patient } from "@/constants/types";
import { Ionicons } from "@expo/vector-icons";
import { Modal, Text, View, Pressable, StyleSheet } from "react-native";

interface DocumentationModalProps {
    patient?: Patient | null;
    patientSummary?: string | null;
    showSave?: boolean;
    setDocPatient: (p: Patient | null) => void;
}

export default function DocumentationModal({ patient, patientSummary, setDocPatient }: DocumentationModalProps) {
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

                        <Pressable onPress={() => setDocPatient(null)}>
                            <Ionicons name="close" size={28} color="white" />
                        </Pressable>
                    </View>

                    {/* MAIN CONTENT */}
                    <View style={styles.modalContent}>
                        <Text style={{ color: "#333" }}>
                            {patientSummary}
                        </Text>
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
})