import React, { useEffect, useState } from "react";
import { View, Text, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Banner from "@/components/Banner";
import * as colors from "@/constants/colors";
import DocsPanel from "@/components/DocumentationPanel";
import BottomToolbar from "@/components/BottomToolbar";

export default function Dashboard() {
    const { width } = useWindowDimensions();
    const isTablet = width > 768;
    const [patients, setPatients] = useState<any[]>([]);

    const fetchPatients = async () => {
        try {
            const res = await fetch("http://localhost:8000/patients");
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
        <View style={{ flex: 1, backgroundColor: "#dce0f0" }}>
            <Banner />
            {isTablet ? (
                <TabletLayout patients={patients} />
            ) : (
                <MobileLayout patients={patients} />
            )}
        </View>
    );
}

function MobileLayout({ patients }: { patients: any[] }) {
    return (
        <ScrollView contentContainerStyle={{ padding: 20 }}>
            {/* Current Shift */}
            <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>Current Shift</Text>
                <View
                    style={{
                        flexDirection: "column",
                        justifyContent: "flex-start",
                        backgroundColor: colors.COLORS.background,
                        borderRadius: 10,
                        padding: 10,
                        marginTop: 10,
                    }}
                >
                    <Text>First Last RN</Text>
                    <Text>00:07:45</Text>
                    <View
                        style={{
                            height: 10,
                            backgroundColor: colors.COLORS.green,
                            borderRadius: 5,
                            marginTop: 5,
                            width: "75%",
                        }}
                    />
                </View>
            </View>

            {/* Upcoming Handoff */}
            <View style={{ marginBottom: 20 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>Upcoming Handoff</Text>
                <View
                    style={{
                        backgroundColor: colors.COLORS.primary,
                        borderRadius: 10,
                        padding: 15,
                        marginTop: 10,
                    }}
                >
                    <Text style={{ color: "#fff" }}>Next Nurse RN @16:45</Text>
                    <Text style={{ color: "#fff" }}>Handoff Reminder: 16:40</Text>
                </View>
            </View>

            {/* Patients */}
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Patients</Text>
            {patients?.map((p: any) => (
                <Pressable
                    key={p.ID}
                    style={{
                        backgroundColor: colors.COLORS.primary,
                        padding: 15,
                        borderRadius: 10,
                        marginBottom: 10,
                    }}
                >
                    <Text style={{ fontWeight: "600", color: "#fff" }}>
                        {p.PREFIX} {p.FIRST} {p.LAST}
                    </Text>
                </Pressable>
            ))}

            {/* Bottom Nav */}
            <BottomToolbar />
        </ScrollView>
    );
}

function TabletLayout({ patients }: { patients: any[] }) {
    return (
        <View style={{ flex: 1, flexDirection: "row", padding: 20, gap: 20 }}>
            {/* Left Column */}
            <View style={{ flex: 1 }}>
                <Text style={{ fontSize: 18, fontWeight: "bold" }}>Current Shift</Text>
                <View
                    style={{
                        backgroundColor: colors.COLORS.background,
                        borderRadius: 10,
                        padding: 15,
                        marginTop: 10,
                        marginBottom: 15,
                    }}
                >
                    <Text>First Last RN</Text>
                    <Text>00:07:45</Text>
                    <View
                        style={{
                            height: 10,
                            backgroundColor: colors.COLORS.green,
                            borderRadius: 5,
                            marginTop: 10,
                            width: "75%",
                        }}
                    />
                </View>

                <Text style={{ fontSize: 18, fontWeight: "bold" }}>Upcoming Handoff</Text>
                <View
                    style={{
                        backgroundColor: colors.COLORS.primary,
                        borderRadius: 10,
                        padding: 15,
                        marginTop: 10,
                        marginBottom: 15,
                    }}
                >
                    <Text style={{ color: "#fff" }}>Next Nurse RN @16:45</Text>
                    <Text style={{ color: "#fff" }}>Handoff Reminder: 16:40</Text>
                </View>

                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Patients</Text>
                <ScrollView style={{ maxHeight: "60%" }}>
                    {patients?.map((p: any) => (
                        <Pressable
                            key={p.ID}
                            style={{
                                backgroundColor: colors.COLORS.primary,
                                padding: 15,
                                borderRadius: 10,
                                marginBottom: 10,
                            }}
                        >
                            <Text style={{ fontWeight: "600", color: "#fff" }}>
                                {p.PREFIX} {p.FIRST} {p.LAST}
                            </Text>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* Bottom Nav */}
                <BottomToolbar />
            </View>

            {/* Right Column */}
            <DocsPanel />
        </View>
    );
}
