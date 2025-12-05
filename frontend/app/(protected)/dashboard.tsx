// app/dashboard.tsx
import { useEffect, useState } from "react";
import { View, Text, useWindowDimensions, StyleSheet } from "react-native";
import DocsPanel from "@/components/DocumentationPanel";
import PatientScroll from "@/components/PatientScroll";
import { apiFetch } from "@/lib/api";
import { COLORS } from "@/constants/colors";
import { Patient } from "@/constants/types";
import DocumentationModal from "@/components/DocumentationModal";

export default function Dashboard() {
    const { width } = useWindowDimensions();
    const isTablet = width > 768;
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    const [documentationPatient, setDocumentationPatient] = useState<Patient | null>();
    const [patientSummary, setPatientSummary] = useState<string | null>(null);

    const fetchPatients = async () => {
        try {
            const res = await apiFetch("http://localhost:8000/patients");
            const data = await res.json();
            setPatients(data?.patients ?? []);
        } catch (err) {
            console.error("Error fetching patients:", err);
        }
    };

    const fetchAndSetPatientSummary = async () => {
        let data = 'No Summary Data.';
        try {
            const res = await apiFetch(
                `http://localhost:8000/patients/${documentationPatient.Id}/ai_summaries`
            );
            const json = await res.json();
            data = json.summary ?? "No summary text found.";
        } catch (err) {
            console.error("Error fetching patient summary", err);
            data = "Error getting summary data, or no summary data found.";
        }
        setPatientSummary(data);
    };


    useEffect(() => {
        fetchPatients();
    }, []);

    useEffect(() => {
        if (documentationPatient != null) {
            console.log(documentationPatient)
            fetchAndSetPatientSummary();
        }
    }, [documentationPatient])

    return (
        <View style={styles.screen}>
            <MainLayout
                patients={patients}
                isTablet={isTablet}
                selectedPatient={selectedPatient}
                setSelectedPatient={setSelectedPatient}
                loadPatientDocs={setDocumentationPatient}
            />
            <DocumentationModal patient={documentationPatient} setDocPatient={setDocumentationPatient} patientSummary={patientSummary} />
        </View>
    );
}

interface MainLayoutProps {
    patients: any[];
    isTablet: boolean;
    selectedPatient: any | null;
    setSelectedPatient: (p: Patient) => void;
    loadPatientDocs: (p: Patient) => void;
}

function MainLayout({ patients, isTablet, selectedPatient, setSelectedPatient, loadPatientDocs }: MainLayoutProps) {
    const flexDirection = isTablet ? "row" : "column";

    return (
        <View style={{
            flex: 1,
            minHeight: 0,
            flexDirection,
            padding: 20,
            gap: 20
        }}>
            {/* LEFT / TOP */}
            <View style={{
                flex: 1,
                minHeight: 0,
                flexShrink: 1,
            }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Patients</Text>

                <View style={{ flex: 1, minHeight: 0 }}>
                    <PatientScroll patients={patients} onSelectPatient={setSelectedPatient} loadDocs={loadPatientDocs} />
                </View>
            </View>

            {/* RIGHT / BOTTOM */}
            <View style={{
                flex: 1,
                minHeight: 0,
                flexShrink: 1,
            }}>
                <DocsPanel selectedPatient={selectedPatient} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, minHeight: 0, backgroundColor: COLORS.background, position: "relative" },
    container: { flex: 1, padding: 20, gap: 20, minHeight: 0 },
    title: { fontSize: 18, fontWeight: "bold", marginBottom: 10, flexShrink: 1 },
});
