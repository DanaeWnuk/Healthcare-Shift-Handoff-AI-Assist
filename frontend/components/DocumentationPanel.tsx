// components/DocumentationPanel.tsx
import React, { useState, useEffect, useRef } from "react";
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
    let [recordingState, setRecordingState ] = useState(false); // Start and stop recording mechanism needs this
    let recordingStateRef = useRef(recordingState); // Used to stop recording when button pressed
    let [labelState, setLabelState] = useState(""); // Used to determine which button to toggle
    let [session_id, setSession] = useState(""); // Setup the correct route for calling backend APIs

    // Delay for transcription processing
    const delay = (ms: number) => new Promise(res => setTimeout(res, ms));

    // Update reference when state changes
    const updateRecordingState = (state: boolean) => {
        setRecordingState(state);
        recordingStateRef.current = state;
    };

    // Toggle recording state
    const toggleRecording = (label: string, session_id: string) => {
        setLabelState(label);
        if (recordingState) {
        stopRecording();
        } else {
        startRecording(label);
        }
    };

    //Tell backend to start recording when button toggled
    const startRecording = async (label: string) => {
        try{
            updateRecordingState(true);
            const response = await fetch('http://127.0.0.1:8000/start-recording', { //TODO: change localhost url to supabase url
                method: 'POST',
            });
            const result = await response.json();
            setSession(result["session_id"]); // This will not set the session ID for readTranscription
            readTranscription(label, result["session_id"]); // We have to manually send it over
        } catch (error) {
            console.error('Problem starting stream', error);
        }
    };

    //Read transcription from backend while recording
    const readTranscription = async (label: string, sessionID: string) => {
        try{
            while(recordingStateRef.current){
                const response = await fetch(`http://127.0.0.1:8000/read-transcription/${sessionID}`, { //TODO: change localhost url to supabase url
                method: 'GET',
                });
                const result = await response.json();
                if (label === "Situation") {
                    setSituation(result["transcription"]);
                }
                else if (label === "Background") {
                    setBackground(result["transcription"]);
                }
                else if (label === "Assessment") {
                    setAssessment(result["transcription"]);
                }
                else {
                    setRecommendation(result["transcription"]);
                }
                await delay(5000); // Wait a bit for whisper's analysis before reading-transcription again
            }
        } catch (error) {
            console.error('Problem reading transcription', error);
        }
    };

    //Tell backend to stop recording when button toggled
    const stopRecording = async () => {
        updateRecordingState(false);
        try{
        const response = await fetch(`http://127.0.0.1:8000/stop-recording/${session_id}`, { //TODO: change localhost url to supabase url
            method: 'POST',
        });
        const result = await response.json();
        } catch (error) {
        console.error('Problem ending stream', error);
        }
    };

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

    const renderSection = (label: string, value: string, onChange: (t: string) => void, session_id: string) => (
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
            <View style={styles.audioInput}>
                <TouchableOpacity
                    style = {styles.iconButton}
                    onPress = {() => toggleRecording(label, session_id)}
                >
                    <Ionicons name={recordingState && labelState === label ? "mic" : "mic-off"} size={20} color="#000" />
                </TouchableOpacity>
            </View>
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
                        {renderSection("Situation", situation, setSituation, session_id)}
                        {renderSection("Background", background, setBackground, session_id)}
                        {renderSection("Assessment", assessment, setAssessment, session_id)}
                        {renderSection("Recommendation", recommendation, setRecommendation, session_id)}
                    </>
                ) :
                    <Text>Select a patient to begin documentation.</Text>
                }
            </ScrollView>
            <DocumentationModal patient={docPatient} setDocPatient={setDocPatient} patientSummary={message} />
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
    audioInput: {
        flexDirection: "row",
        position: 'absolute',
        bottom: 4,
        right: 4,
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
