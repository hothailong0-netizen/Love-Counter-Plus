import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Dimensions } from "react-native";
import Animated, { FadeIn, FadeOut, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient } from "@/lib/query-client";
import { LoveProvider } from "@/lib/love-context";
import { 
  useFonts, 
  Nunito_400Regular, 
  Nunito_600SemiBold, 
  Nunito_700Bold, 
  Nunito_800ExtraBold 
} from "@expo-google-fonts/nunito";

SplashScreen.preventAutoHideAsync();

const { width, height } = Dimensions.get("window");

function LoadingScreen({ onFinish }: { onFinish: () => void }) {
  useEffect(() => {
    const timer = setTimeout(() => {
      onFinish();
    }, 5000);
    return () => clearTimeout(timer);
  }, [onFinish]);

  return (
    <LinearGradient
      colors={["#1a0011", "#3d0025", "#E8477C", "#FF6B9D"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={loadingStyles.container}
    >
      <Animated.View entering={FadeIn.duration(800)} style={loadingStyles.content}>
        <Animated.View entering={FadeInUp.delay(200).duration(600)} style={loadingStyles.iconCircle}>
          <Ionicons name="heart" size={52} color="#FFF" />
        </Animated.View>

        <Animated.Text entering={FadeInUp.delay(500).duration(600)} style={loadingStyles.appName}>
          Đếm Ngày Yêu
        </Animated.Text>

        <Animated.Text entering={FadeInUp.delay(800).duration(600)} style={loadingStyles.tagline}>
          Đong đếm từng khoảnh khắc yêu thương
        </Animated.Text>

        <Animated.View entering={FadeInUp.delay(1200).duration(600)} style={loadingStyles.divider} />

        <Animated.Text entering={FadeInUp.delay(1500).duration(600)} style={loadingStyles.madeBy}>
          App Được Làm Ra Bởi
        </Animated.Text>

        <Animated.Text entering={FadeInUp.delay(1800).duration(600)} style={loadingStyles.authorName}>
          Hồ Thái Long
        </Animated.Text>
      </Animated.View>

      <Animated.View entering={FadeIn.delay(2000).duration(600)} style={loadingStyles.loaderRow}>
        <View style={loadingStyles.dot} />
        <View style={[loadingStyles.dot, { opacity: 0.6 }]} />
        <View style={[loadingStyles.dot, { opacity: 0.3 }]} />
      </Animated.View>
    </LinearGradient>
  );
}

const loadingStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  content: {
    alignItems: "center" as const,
    paddingHorizontal: 40,
  },
  iconCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 28,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
  },
  appName: {
    fontSize: 32,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFF",
    marginBottom: 8,
    textAlign: "center" as const,
  },
  tagline: {
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    color: "rgba(255,255,255,0.8)",
    textAlign: "center" as const,
    marginBottom: 32,
  },
  divider: {
    width: 60,
    height: 2,
    backgroundColor: "rgba(255,255,255,0.3)",
    borderRadius: 1,
    marginBottom: 24,
  },
  madeBy: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    color: "rgba(255,255,255,0.6)",
    textAlign: "center" as const,
    marginBottom: 4,
  },
  authorName: {
    fontSize: 20,
    fontFamily: "Nunito_700Bold",
    color: "#FFD700",
    textAlign: "center" as const,
  },
  loaderRow: {
    flexDirection: "row" as const,
    gap: 8,
    position: "absolute" as const,
    bottom: 80,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: "#FFF",
  },
});

function RootLayoutNav() {
  return (
    <Stack screenOptions={{ 
      headerBackTitle: "Quay lại",
      headerTitleStyle: { fontFamily: 'Nunito_700Bold' }
    }}>
      <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
    </Stack>
  );
}

export default function RootLayout() {
  const [fontsLoaded, fontError] = useFonts({
    Nunito_400Regular,
    Nunito_600SemiBold,
    Nunito_700Bold,
    Nunito_800ExtraBold,
  });
  const [showLoading, setShowLoading] = useState(true);

  useEffect(() => {
    if (fontsLoaded || fontError) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError]);

  const handleLoadingFinish = useCallback(() => {
    setShowLoading(false);
  }, []);

  if (!fontsLoaded && !fontError) {
    return null;
  }

  if (showLoading) {
    return <LoadingScreen onFinish={handleLoadingFinish} />;
  }

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <LoveProvider>
          <GestureHandlerRootView>
            <KeyboardProvider>
              <RootLayoutNav />
            </KeyboardProvider>
          </GestureHandlerRootView>
        </LoveProvider>
      </QueryClientProvider>
    </ErrorBoundary>
  );
}
