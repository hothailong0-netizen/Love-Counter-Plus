import { isLiquidGlassAvailable } from "expo-glass-effect";
import { Tabs } from "expo-router";
import { NativeTabs, Icon, Label } from "expo-router/unstable-native-tabs";
import { BlurView } from "expo-blur";
import { Platform, StyleSheet } from "react-native";
import { Ionicons } from "@expo/vector-icons";
import React from "react";

import Colors from "@/constants/colors";

function NativeTabLayout() {
  return (
    <NativeTabs>
      <NativeTabs.Trigger name="index">
        <Icon sf={{ default: "heart", selected: "heart.fill" }} />
        <Label>Trang ch\u1EE7</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="memories">
        <Icon sf={{ default: "book", selected: "book.fill" }} />
        <Label>Nh\u1EADt k\u00FD</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="milestones">
        <Icon sf={{ default: "star", selected: "star.fill" }} />
        <Label>C\u1ED9t m\u1ED1c</Label>
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="settings">
        <Icon sf={{ default: "gearshape", selected: "gearshape.fill" }} />
        <Label>C\u00E0i \u0111\u1EB7t</Label>
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}

function ClassicTabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors.primary,
        tabBarInactiveTintColor: '#999',
        headerShown: false,
        tabBarStyle: {
          position: "absolute",
          backgroundColor: Platform.select({
            ios: "transparent",
            android: "#fff",
            web: "#fff",
          }),
          borderTopWidth: 0,
          elevation: 0,
          height: Platform.OS === 'web' ? 84 : 56,
          paddingBottom: Platform.OS === 'web' ? 34 : 4,
          paddingTop: 4,
        },
        tabBarBackground: () =>
          Platform.OS === "ios" ? (
            <BlurView
              intensity={100}
              tint="light"
              style={StyleSheet.absoluteFill}
            />
          ) : null,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Trang ch\u1EE7",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="heart" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="memories"
        options={{
          title: "Nh\u1EADt k\u00FD",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="book" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="milestones"
        options={{
          title: "C\u1ED9t m\u1ED1c",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="star" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "C\u00E0i \u0111\u1EB7t",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="settings" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}

export default function TabLayout() {
  if (isLiquidGlassAvailable()) {
    return <NativeTabLayout />;
  }
  return <ClassicTabLayout />;
}
