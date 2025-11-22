// components/PatientScroll.tsx
import { Text, FlatList, Pressable, View } from "react-native";
import * as colors from "@/constants/colors";

interface IPatientScrollProps {
    patients: any[];
    onSelectPatient?: (p: any) => void;
}

export default function PatientScroll({ patients, onSelectPatient }: IPatientScrollProps) {
    return (
        <View style={{ flex: 1, minHeight: 0 }}>
            <FlatList
                data={patients}
                keyExtractor={(p) => String(p.ID)}
                contentContainerStyle={{ paddingBottom: 20 }}
                renderItem={({ item: p }) => (
                    <Pressable
                        style={{
                            backgroundColor: colors.COLORS.primary,
                            padding: 15,
                            borderRadius: 10,
                            marginBottom: 10,
                        }}
                        onPress={() => onSelectPatient?.(p)}
                    >
                        <Text style={{ fontWeight: "600", color: "#fff" }}>
                            {p.PREFIX} {p.FIRST} {p.LAST}
                        </Text>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <View style={{ paddingTop: 20 }}>
                        <Text style={{ color: colors.COLORS.text, textAlign: "center" }}>
                            No patients found.
                        </Text>
                    </View>
                }
            />
        </View>
    );
}
