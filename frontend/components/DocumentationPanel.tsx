import React, { useState, useRef } from "react";
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    TextInput,
    ScrollView,
    KeyboardAvoidingView,
    Platform,
    GestureResponderEvent,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as colors from "../constants/colors";

export default function DocsPanel() {
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
        //setSession("");
        const result = await response.json();
        alert(result);
        } catch (error) {
        console.error('Problem ending stream', error);
        }
    };


    const handleSave = () => {
        const note = { situation, background, assessment, recommendation };
        console.log("Saving SBAR note:", note);
        alert("SBAR note saved (front end only for now)");
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
                {renderSection("Situation", situation, setSituation, session_id)}
                {renderSection("Background", background, setBackground, session_id)}
                {renderSection("Assessment", assessment, setAssessment, session_id)}
                {renderSection("Recommendation", recommendation, setRecommendation, session_id)}
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
    audioInput: {
        flexDirection: "row",
        position: 'absolute',
        bottom: 4,
        right: 4,
    },
});
