// components/BottomToolbar.tsx
import React from "react";
import { View, Pressable, ViewStyle } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import * as colors from "@/constants/colors";
import { router } from "expo-router";

export default function BottomToolbar({ style }: { style?: ViewStyle }) {

    const onHome = () => {
        router.navigate('/dashboard');
    }

    const onProfile = () => {
        router.navigate('/dashboard');
    }

    const onCalendar = () => {
        router.navigate('/dashboard');
    }

    const onPatient = () => {
        router.navigate('/dashboard');
    }

    return (
        <View
            style={[
                {
                    flexDirection: "row",
                    justifyContent: "space-around",
                    backgroundColor: colors.COLORS.primary,
                    borderRadius: 20,
                    padding: 15,
                },
                style,
            ]}
        >
            <Pressable
                onPress={onPatient}
            >
                <Ionicons name="people" size={24} color="white" />
            </Pressable>
            <Pressable
                onPress={onCalendar}
            >
                <Ionicons name="calendar-outline" size={24} color="white" />
            </Pressable>
            <Pressable
                onPress={onHome}
            >
                <Ionicons name="home-outline" size={24} color="white" />
            </Pressable>
            <Pressable
                onPress={onProfile}
            >
                <Ionicons name="person-outline" size={24} color="white" />
            </Pressable>
        </View>
    )
}