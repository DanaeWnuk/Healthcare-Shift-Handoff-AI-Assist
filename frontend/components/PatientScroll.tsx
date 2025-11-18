// components/PatientScroll.tsx
import { Text, ScrollView, Pressable } from "react-native";
import * as colors from "@/constants/colors";

interface IPatientScrollProps {
    patients: any[];
    onSelectPatient?: (p: any) => void;
}

export default function PatientScroll({ patients, onSelectPatient }: IPatientScrollProps) {
    return (
        <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 20 }}>
            {patients && patients.length > 0 ? (
                patients.map((p: any) => (
                    <Pressable
                        key={p.ID}
                        style={{
                            backgroundColor: colors.COLORS.primary,
                            padding: 15,
                            borderRadius: 10,
                            marginBottom: 10,
                        }}
                        onPress={() => {
                            if (onSelectPatient) onSelectPatient(p);
                        }}
                    >
                        <Text style={{ fontWeight: "600", color: "#fff" }}>
                            {p.PREFIX} {p.FIRST} {p.LAST}
                        </Text>
                    </Pressable>
                ))
            ) : (
                <Text style={{ color: colors.COLORS.text, textAlign: "center", marginTop: 20 }}>
                    No patients found.
                </Text>
            )}
        </ScrollView>
    );
}
