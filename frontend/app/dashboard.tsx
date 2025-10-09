import React from "react";
import { View, Text, ScrollView, Pressable, useWindowDimensions } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import Banner from "@/components/banner";
import * as colors from "@/constants/colors";
import DocsPanel from "@/components/documentationPanel";

const patients = ["Mr. Person One", "Mr. Person Two", "Mrs. Person One", "Mrs. Person Two"];

export default function Dashboard() {
    const { width } = useWindowDimensions();
    const isTablet = width > 768;

    return (
        <View style={{ flex: 1, backgroundColor: "#dce0f0" }}>
            <Banner />
            {isTablet ? <TabletLayout /> : <MobileLayout />}
        </View>
    );
}

function MobileLayout() {
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
                    <Text style={{ color: "#fff"}}>Next Nurse RN @16:45</Text>
                    <Text style={{ color: "#fff" }}>Handoff Reminder: 16:40</Text>
                </View>
            </View>

            {/* Patients */}
            <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Patients</Text>
            {patients.map((p) => (
                <Pressable
                    key={p}
                    style={{
                        backgroundColor: colors.COLORS.primary,
                        padding: 15,
                        borderRadius: 10,
                        marginBottom: 10,
                    }}
                >
                    <Text style={{ fontWeight: "600", color: "#fff" }}>{p}</Text>
                </Pressable>
            ))}

            {/* Bottom Nav */}
            <View
                style={{
                    flexDirection: "row",
                    justifyContent: "space-around",
                    backgroundColor: colors.COLORS.primary,
                    borderRadius: 20,
                    padding: 15,
                    marginTop: 30,
                }}
            >
                <Ionicons name="trash-outline" size={24} color="white" />
                <Ionicons name="calendar-outline" size={24} color="white" />
                <Ionicons name="home-outline" size={24} color="white" />
                <Ionicons name="mail-outline" size={24} color="white" />
                <Ionicons name="person-outline" size={24} color="white" />
            </View>
        </ScrollView>
    );
}

function TabletLayout() {
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
                    <Text style={{ color: "#fff"}} >Next Nurse RN @16:45</Text>
                    <Text style={{ color: "#fff" }}>Handoff Reminder: 16:40</Text>
                </View>

                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 10 }}>Patients</Text>
                <ScrollView style={{ maxHeight: "60%" }}>
                    {patients.map((p) => (
                        <Pressable
                            key={p}
                            style={{
                                backgroundColor: colors.COLORS.primary,
                                padding: 15,
                                borderRadius: 10,
                                marginBottom: 10,
                            }}
                        >
                            <Text style={{ fontWeight: "600", color: "#fff" }}>{p}</Text>
                        </Pressable>
                    ))}
                </ScrollView>

                {/* Bottom Nav */}
                <View
                    style={{
                        flexDirection: "row",
                        justifyContent: "space-around",
                        backgroundColor: colors.COLORS.primary,
                        borderRadius: 20,
                        padding: 15,
                        marginTop: 20,
                    }}
                >
                    <Ionicons name="trash-outline" size={24} color="white" />
                    <Ionicons name="calendar-outline" size={24} color="white" />
                    <Ionicons name="home-outline" size={24} color="white" />
                    <Ionicons name="mail-outline" size={24} color="white" />
                    <Ionicons name="person-outline" size={24} color="white" />
                </View>
            </View>

            {/* Right Column */}
            <DocsPanel />
        </View>
    );
}
