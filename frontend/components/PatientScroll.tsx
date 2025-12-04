// components/PatientScroll.tsx
import { Text, FlatList, Pressable, View, StyleSheet } from "react-native";
import { COLORS } from "@/constants/colors";
import { Ionicons } from "@expo/vector-icons";
import { Patient } from "@/constants/types";

interface IPatientScrollProps {
    patients?: any[];
    onSelectPatient?: (p: Patient) => void;
    loadDocs: (p: Patient) => void;
}

export default function PatientScroll({ patients = [], onSelectPatient, loadDocs }: IPatientScrollProps) {
    const renderName = (p: any) => {
        const prefix = p?.PREFIX ?? p?.prefix ?? p?.title ?? "";
        const first = p?.FIRST ?? p?.first ?? p?.given ?? p?.FIRST_NAME ?? "";
        const last = p?.LAST ?? p?.last ?? p?.family ?? p?.LAST_NAME ?? "";
        return `${prefix ? prefix + " " : ""}${first} ${last}`.trim();
    };

    const keyExtractor = (p: any, index: number) => {
        const id = p?.ID ?? p?.Id ?? p?.id ?? p?.Id_ ?? index;
        return String(id);
    };

    const renderItem = ({ item: p }: { item: Patient }) => (
        <Pressable style={styles.card} onPress={() => onSelectPatient?.(p)}>
            <Text style={styles.name}>{renderName(p)}</Text>
            <Pressable onPress={() => loadDocs(p)}><Ionicons name="archive" size={24} style={styles.icon} /></Pressable>
        </Pressable>
    );

    return (
        <View style={styles.container}>
            <FlatList
                data={patients}
                keyExtractor={keyExtractor}
                renderItem={renderItem}
                style={styles.list}
                contentContainerStyle={styles.content}
                showsVerticalScrollIndicator
            />
        </View>
    );
}

const styles = StyleSheet.create({
    // This container must be able to shrink — minHeight: 0 ensures parents can bound it.
    container: {
        flex: 1,
        minHeight: 0,
    },
    list: {
        flex: 1,
        minHeight: 0,
    },
    content: {
        paddingBottom: 20,
        paddingTop: 8,
    },
    card: {
        backgroundColor: COLORS.primary,
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center"
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
    icon: {
        color: "#fff",
    }
});
