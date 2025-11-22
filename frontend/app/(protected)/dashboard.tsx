import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Banner from "@/components/Banner";
import * as colors from "@/constants/colors";
import DocsPanel from "@/components/DocumentationPanel";
import BottomToolbar from "@/components/BottomToolbar";
import PatientScroll from "@/components/PatientScroll";
import { router } from "expo-router";
import { apiFetch } from "@/lib/api";

export default function Dashboard() {
    const { width } = useWindowDimensions();
    const isTablet = width > 768;
    const [patients, setPatients] = useState<any[]>([]);
    const [selectedPatient, setSelectedPatient] = useState<any | null>(null);
    // fixed toolbar sizing (kept in sync with rendered toolbar wrapper)
    const TOOLBAR_HEIGHT = 64; // actual toolbar content height
    const TOOLBAR_BOTTOM_MARGIN = 20; // distance from bottom edge
    const TOOLBAR_WRAPPER_HEIGHT = TOOLBAR_HEIGHT; // wrapper height
    const TOOLBAR_SPACE = TOOLBAR_WRAPPER_HEIGHT + TOOLBAR_BOTTOM_MARGIN;

    const fetchPatients = async () => {
        try {
            const res = await apiFetch("http://localhost:8000/patients");
            const data = await res.json();
            setPatients(data.patients);
        } catch (err) {
            console.error("Error fetching patients:", err);
        }
    };

    useEffect(() => {
        fetchPatients();
    }, []);

    return (
        <View style={{ flex: 1, backgroundColor: "#dce0f0", position: "relative", paddingBottom: TOOLBAR_SPACE }}>
            <Banner />
            <MainLayout
                patients={patients}
                isTablet={isTablet}
                toolbarSpace={TOOLBAR_SPACE}
                selectedPatient={selectedPatient}
                setSelectedPatient={setSelectedPatient}
            />

            {/* Fixed bottom toolbar */}
            <View style={{ position: "absolute", left: 20, right: 20, bottom: TOOLBAR_BOTTOM_MARGIN, height: TOOLBAR_WRAPPER_HEIGHT, zIndex: 1000, elevation: 10 }}>
                <BottomToolbar />
            </View>
        </View>
    );
}

interface MainLayoutProps {
    patients: any[];
    isTablet: boolean;
    toolbarSpace?: number;
    selectedPatient: any | null;
    setSelectedPatient: (p: any) => void;
}

function MainLayout({ patients, selectedPatient, setSelectedPatient }: MainLayoutProps) {
    return (
        <View style={{ flex: 1, flexDirection: "row", padding: 20, gap: 20 }}>
            {/* Left Column */}
            <View style={{ flex: 1, minHeight: 0 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Patients</Text>
                <View style={{ flex: 1, minHeight: 0 }}>
                    <PatientScroll
                        patients={patients}
                        onSelectPatient={setSelectedPatient}
                    />
                </View>

                {/* Bottom Nav (now fixed) */}
            </View>

            {/* Right Column */}
            <DocsPanel selectedPatient={selectedPatient} />
        </View>
    );
}