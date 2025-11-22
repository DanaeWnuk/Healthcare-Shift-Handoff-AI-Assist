// components/PatientScroll.tsx
import React from "react";
import { Text, FlatList, Pressable, View, StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";

interface IPatientScrollProps {
    patients?: any[];
    onSelectPatient?: (p: any) => void;
}

export default function PatientScroll({ patients = [], onSelectPatient }: IPatientScrollProps) {
    const renderName = (p: any) => {
        // Support different schemas returned by backend: PREFIX/FIRST/LAST or prefix/first/last
        const prefix = p?.PREFIX ?? p?.prefix ?? p?.title ?? "";
        const first = p?.FIRST ?? p?.first ?? p?.given ?? p?.FIRST_NAME ?? "";
        const last = p?.LAST ?? p?.last ?? p?.family ?? p?.LAST_NAME ?? "";
        return `${prefix ? prefix + " " : ""}${first} ${last}`.trim();
    };

    const keyExtractor = (p: any, index: number) => {
        const id = p?.ID ?? p?.Id ?? p?.id ?? p?.Id_ ?? index;
        return String(id);
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={patients}
                keyExtractor={keyExtractor}
                style={styles.list}
                contentContainerStyle={styles.content}
                renderItem={({ item: p }) => (
                    <Pressable style={styles.card} onPress={() => onSelectPatient?.(p)}>
                        <Text style={styles.name}>{renderName(p)}</Text>
                    </Pressable>
                )}
                ListEmptyComponent={
                    <View style={styles.emptyWrap}>
                        <Text style={styles.emptyText}>No patients found.</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        minHeight: 0,
    },
    list: {
        flex: 1,
    },
    content: {
        paddingBottom: 20,
        paddingTop: 8,
        flexGrow: 1,
    },
    card: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
    },
    name: {
        fontWeight: "600",
        color: "#fff",
    },
    emptyWrap: {
        paddingTop: 20,
        alignItems: "center",
    },
    emptyText: {
        color: COLORS.text,
        textAlign: "center",
    },
});

