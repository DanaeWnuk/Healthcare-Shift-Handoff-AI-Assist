// components/BottomToolbar.tsx
import React from "react";
import {View, TouchableOpacity, StyleSheet} from "react-native";
import {Ionicons} from "@expo/vector-icons";
import * as colors from "@/constants/colors";

export default function BottomToolbar() {
    return (
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
            <TouchableOpacity>
                <Ionicons name="trash-outline" size={24} color="white"/>
            </TouchableOpacity>
            <TouchableOpacity>
                <Ionicons name="calendar-outline" size={24} color="white"/>
            </TouchableOpacity>
            <TouchableOpacity>
                <Ionicons name="home-outline" size={24} color="white"/>
            </TouchableOpacity>
            <TouchableOpacity>
                <Ionicons name="mail-outline" size={24} color="white"/>
            </TouchableOpacity>
            <TouchableOpacity>
                <Ionicons name="person-outline" size={24} color="white"/>
            </TouchableOpacity>
        </View>
    )
}