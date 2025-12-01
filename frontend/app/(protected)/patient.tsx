import { Text, ScrollView, View } from "react-native";
import * as colors from "@/constants/colors";
import { useEffect, useState } from "react";
import { apiFetch } from "@/lib/api";

export default function PatientScroll() {
    const [patients, setPatients] = useState<any[]>([]);
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
        <ScrollView style={{ padding: 2, flex: 1 }} contentContainerStyle={{ padding: 20 }}>
            {patients && patients.length > 0 ? (
                patients.map((p: any) => (
                    <View
                        key={p.ID}
                        style={{
                            backgroundColor: colors.COLORS.primary,
                            padding: 15,
                            borderRadius: 10,
                            marginBottom: 10,
                            flexDirection: 'row',
                            alignItems: 'center',
                            justifyContent: 'space-between'
                        }}
                    >
                        <Text style={{ fontWeight: "600", color: "#fff" }}>
                            {p.PREFIX} {p.FIRST} {p.LAST}
                        </Text>
                    </View>
                ))
            ) : (
                <Text style={{ color: colors.COLORS.text, textAlign: "center", marginTop: 20 }}>
                    No patients found.
                </Text>
            )}
        </ScrollView>
    );
}
