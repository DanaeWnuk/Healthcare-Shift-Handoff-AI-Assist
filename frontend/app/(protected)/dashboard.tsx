// app/dashboard.tsx
import React, { useEffect, useState } from "react";
import { View, Text, useWindowDimensions, StyleSheet } from "react-native";
import DocsPanel from "@/components/DocumentationPanel";
import PatientScroll from "@/components/PatientScroll";
import { apiFetch } from "@/lib/api";
import { COLORS } from "@/constants/colors";

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
                    <PatientScroll patients={patients} onSelectPatient={setSelectedPatient} />
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
