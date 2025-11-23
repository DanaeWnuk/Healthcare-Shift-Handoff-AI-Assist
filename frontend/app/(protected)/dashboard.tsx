// app/dashboard.tsx
import React, { useEffect, useState } from "react";
import { View, Text, useWindowDimensions, StyleSheet } from "react-native";
import DocsPanel from "@/components/DocumentationPanel";
import PatientScroll from "@/components/PatientScroll";
import { apiFetch } from "@/lib/api";

export default function Dashboard() {
    const { width } = useWindowDimensions();
    const isTablet = width > 768;
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);

    const fetchPatients = async () => {
        try {
            const res = await apiFetch("http://localhost:8000/patients");
            const data = await res.json();
            setPatients(data?.patients ?? []);
        } catch (err) {
            console.error("Error fetching patients:", err);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    return (
        <View style={styles.screen}>
            <MainLayout
                patients={patients}
                isTablet={isTablet}
                selectedPatient={selectedPatient}
                setSelectedPatient={setSelectedPatient}
            />
        </View>
    );
}

interface MainLayoutProps {
    patients: any[];
    isTablet: boolean;
    selectedPatient: any | null;
    setSelectedPatient: (p: any) => void;
}

function MainLayout({ patients, isTablet, selectedPatient, setSelectedPatient }: MainLayoutProps) {
    // tablet: two columns (left/right) - both equal height
    // mobile: two rows (top/bottom) - give patients a limited portion so it scrolls
    const leftStyle = isTablet
        ? { flex: 1, minHeight: 0, flexShrink: 1 } // share equally on tablet
        : { flex: 0.38, minHeight: 0, flexShrink: 1 }; // ~38% height on phone for patient list

    const rightStyle = isTablet
        ? { flex: 1, minHeight: 0, flexShrink: 1 }
        : { flex: 0.62, minHeight: 0, flexShrink: 1 }; // remainder for docs

    const containerDirection = isTablet ? "row" : "column";

    return (
        <View style={[styles.container, { flexDirection: containerDirection }]}>
            {/* Patients */}
            <View style={leftStyle}>
                <Text style={styles.title}>Patients</Text>
                <PatientScroll patients={patients} onSelectPatient={setSelectedPatient} />
            </View>

            {/* Documentation */}
            <View style={rightStyle}>
                <DocsPanel selectedPatient={selectedPatient} />
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    screen: { flex: 1, minHeight: 0, backgroundColor: "#dce0f0", position: "relative" },
    container: { flex: 1, padding: 20, gap: 20, minHeight: 0 },
    title: { fontSize: 18, fontWeight: "bold", marginBottom: 10, flexShrink: 1 },
});
