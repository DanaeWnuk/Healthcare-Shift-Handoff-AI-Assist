import { Slot } from "expo-router";
import useRequireAuth from "@/hooks/useRequireAuth";
import { ActivityIndicator, View } from "react-native";

export default function ProtectedLayout() {
    const { checking } = useRequireAuth();
    if (checking) return <View style={{ flex: 1, justifyContent: 'center' }}><ActivityIndicator /></View>;
    return <Slot />;
}

