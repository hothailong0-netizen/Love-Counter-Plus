import { QueryClientProvider } from "@tanstack/react-query";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import React, { useEffect, useState, useCallback } from "react";
import { View, Text, StyleSheet, Dimensions, TextInput, Pressable, Alert, Platform } from "react-native";
import Animated, { FadeIn, FadeOut, FadeInUp } from "react-native-reanimated";
import { LinearGradient } from "expo-linear-gradient";
import { GestureHandlerRootView } from "react-native-gesture-handler";
import { KeyboardProvider } from "react-native-keyboard-controller";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets, SafeAreaProvider } from "react-native-safe-area-context";
import { ErrorBoundary } from "@/components/ErrorBoundary";
import { queryClient, initializeApiUrl, isApiConfigured } from "@/lib/query-client";
import { setServerUrl } from "@/lib/server-config";
import { LoveProvider } from "@/lib/love-context";
import Colors from "@/constants/colors";
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

function ServerSetupScreen({ onComplete }: { onComplete: () => void }) {
  const [url, setUrl] = useState("");

  const handleSave = async () => {
    if (!url.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập URL server");
      return;
    }
    try {
      await setServerUrl(url.trim());
      await initializeApiUrl();
      onComplete();
    } catch {
      Alert.alert("Lỗi", "Không thể lưu URL server. Vui lòng thử lại.");
    }
  };

  return (
    <LinearGradient
      colors={["#1a0011", "#3d0025", "#E8477C", "#FF6B9D"]}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
      style={setupStyles.container}
    >
      <View style={setupStyles.content}>
        <View style={setupStyles.iconCircle}>
          <Ionicons name="server-outline" size={40} color="#FFF" />
        </View>

        <Text style={setupStyles.title}>Thiết lập kết nối</Text>
        <Text style={setupStyles.subtitle}>
          Nhập URL server của bạn để bắt đầu sử dụng ứng dụng
        </Text>

        <View style={setupStyles.inputContainer}>
          <Text style={setupStyles.inputLabel}>URL Server</Text>
          <TextInput
            style={setupStyles.input}
            value={url}
            onChangeText={setUrl}
            placeholder="https://example.replit.app"
            placeholderTextColor="rgba(255,255,255,0.4)"
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />
        </View>

        <Pressable style={setupStyles.saveButton} onPress={handleSave}>
          <Ionicons name="checkmark-circle" size={20} color={Colors.primary} />
          <Text style={setupStyles.saveButtonText}>Lưu</Text>
        </Pressable>

        <Text style={setupStyles.hint}>
          URL thường có dạng https://ten-app.replit.app
        </Text>
      </View>
    </LinearGradient>
  );
}

const setupStyles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  content: {
    alignItems: "center" as const,
    paddingHorizontal: 32,
    width: "100%" as const,
    maxWidth: 400,
  },
  iconCircle: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: "rgba(255,255,255,0.15)",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 24,
    borderWidth: 2,
    borderColor: "rgba(255,255,255,0.25)",
  },
  title: {
    fontSize: 26,
    fontFamily: "Nunito_800ExtraBold",
    color: "#FFF",
    marginBottom: 8,
    textAlign: "center" as const,
  },
  subtitle: {
    fontSize: 15,
    fontFamily: "Nunito_400Regular",
    color: "rgba(255,255,255,0.8)",
    textAlign: "center" as const,
    marginBottom: 32,
    lineHeight: 22,
  },
  inputContainer: {
    width: "100%" as const,
    marginBottom: 20,
  },
  inputLabel: {
    fontSize: 14,
    fontFamily: "Nunito_600SemiBold",
    color: "rgba(255,255,255,0.9)",
    marginBottom: 8,
  },
  input: {
    fontFamily: "Nunito_400Regular",
    backgroundColor: "rgba(255,255,255,0.15)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.3)",
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 15,
    color: "#FFF",
  },
  saveButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: "#FFF",
    paddingVertical: 14,
    paddingHorizontal: 40,
    borderRadius: 14,
    gap: 8,
    width: "100%" as const,
  },
  saveButtonText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.primary,
  },
  hint: {
    fontSize: 13,
    fontFamily: "Nunito_400Regular",
    color: "rgba(255,255,255,0.5)",
    textAlign: "center" as const,
    marginTop: 16,
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
  const [apiInitialized, setApiInitialized] = useState(false);
  const [needsSetup, setNeedsSetup] = useState(false);

  useEffect(() => {
    async function init() {
      await initializeApiUrl();
      setApiInitialized(true);
      if (!isApiConfigured()) {
        setNeedsSetup(true);
      }
    }
    init();
  }, []);

  useEffect(() => {
    if ((fontsLoaded || fontError) && apiInitialized) {
      SplashScreen.hideAsync();
    }
  }, [fontsLoaded, fontError, apiInitialized]);

  const handleLoadingFinish = useCallback(() => {
    setShowLoading(false);
  }, []);

  const handleSetupComplete = useCallback(() => {
    setNeedsSetup(false);
  }, []);

  if ((!fontsLoaded && !fontError) || !apiInitialized) {
    return null;
  }

  if (showLoading) {
    return <LoadingScreen onFinish={handleLoadingFinish} />;
  }

  if (needsSetup) {
    return <ServerSetupScreen onComplete={handleSetupComplete} />;
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
