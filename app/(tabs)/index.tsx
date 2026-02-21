import { useState, useEffect } from "react";
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Platform,
  ActivityIndicator,
} from "react-native";
import { useLove } from "@/lib/love-context";
import Colors from "@/constants/colors";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  withSequence,
  withDelay,
} from "react-native-reanimated";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import {
  differenceInDays,
  differenceInHours,
  differenceInMinutes,
  differenceInSeconds,
  format,
} from "date-fns";
import { vi } from "date-fns/locale/vi";

function PulsingHeart({ size = 80 }: { size?: number }) {
  const scale = useSharedValue(1);

  useEffect(() => {
    scale.value = withRepeat(
      withSequence(
        withTiming(1.15, { duration: 600 }),
        withTiming(0.95, { duration: 400 }),
        withTiming(1.08, { duration: 300 }),
        withTiming(1, { duration: 300 })
      ),
      -1,
      false
    );
  }, []);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ scale: scale.value }],
  }));

  return (
    <Animated.View style={animatedStyle}>
      <Ionicons name="heart" size={size} color={Colors.heart} />
    </Animated.View>
  );
}

function FloatingHeart({ delay: d, left }: { delay: number; left: number }) {
  const opacity = useSharedValue(0);
  const translateY = useSharedValue(0);

  useEffect(() => {
    opacity.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(0.3, { duration: 1500 }),
          withTiming(0, { duration: 1500 })
        ),
        -1,
        false
      )
    );
    translateY.value = withDelay(
      d,
      withRepeat(
        withSequence(
          withTiming(-60, { duration: 3000 }),
          withTiming(0, { duration: 0 })
        ),
        -1,
        false
      )
    );
  }, []);

  const style = useAnimatedStyle(() => ({
    opacity: opacity.value,
    transform: [{ translateY: translateY.value }],
  }));

  return (
    <Animated.View style={[{ position: "absolute" as const, left, bottom: 0 }, style]}>
      <Ionicons name="heart" size={16} color="rgba(255,255,255,0.4)" />
    </Animated.View>
  );
}

function SetupScreen() {
  const { createCouple } = useLove();
  const insets = useSafeAreaInsets();
  const [partner1, setPartner1] = useState("");
  const [partner2, setPartner2] = useState("");
  const [dateText, setDateText] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  const handleCreate = async () => {
    if (!partner1.trim() || !partner2.trim() || !dateText.trim()) return;

    const parts = dateText.split("/");
    if (parts.length !== 3) return;
    const [day, month, year] = parts;
    const isoDate = `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;

    const parsed = new Date(isoDate);
    if (isNaN(parsed.getTime())) return;

    setIsCreating(true);
    try {
      await createCouple({
        partner1Name: partner1.trim(),
        partner2Name: partner2.trim(),
        startDate: isoDate,
      });
    } catch (e) {
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <LinearGradient
      colors={[Colors.primary, Colors.primaryDark, "#8B1A4A"]}
      style={styles.flex}
      start={{ x: 0, y: 0 }}
      end={{ x: 1, y: 1 }}
    >
      <ScrollView
        contentContainerStyle={[
          styles.setupContainer,
          { paddingTop: topPadding + 40, paddingBottom: bottomPadding + 40 },
        ]}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.setupIconWrap}>
          <PulsingHeart size={72} />
        </View>

        <Text style={styles.setupTitle}>Đếm Ngày Yêu</Text>
        <Text style={styles.setupSubtitle}>
          Hãy bắt đầu hành trình tình yêu của bạn
        </Text>

        <View style={styles.setupForm}>
          <View style={styles.inputWrapper}>
            <Ionicons
              name="person"
              size={20}
              color="rgba(255,255,255,0.6)"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Tên bạn"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={partner1}
              onChangeText={setPartner1}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="person"
              size={20}
              color="rgba(255,255,255,0.6)"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Tên người ấy"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={partner2}
              onChangeText={setPartner2}
            />
          </View>

          <View style={styles.inputWrapper}>
            <Ionicons
              name="calendar"
              size={20}
              color="rgba(255,255,255,0.6)"
              style={styles.inputIcon}
            />
            <TextInput
              style={styles.textInput}
              placeholder="Ngày bắt đầu (DD/MM/YYYY)"
              placeholderTextColor="rgba(255,255,255,0.5)"
              value={dateText}
              onChangeText={setDateText}
              keyboardType="numbers-and-punctuation"
            />
          </View>

          <TouchableOpacity
            style={[styles.createButton, isCreating && styles.createButtonDisabled]}
            onPress={handleCreate}
            disabled={isCreating}
            activeOpacity={0.8}
          >
            {isCreating ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <>
                <Ionicons name="heart" size={20} color="#fff" />
                <Text style={styles.createButtonText}>Bắt đầu</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

export default function HomeScreen() {
  const {
    couple,
    isLoading,
    daysInLove,
    monthsInLove,
    yearsInLove,
    hoursInLove,
    minutesInLove,
    nextMilestone,
    todayQuote,
  } = useLove();
  const insets = useSafeAreaInsets();
  const [seconds, setSeconds] = useState(0);

  const topPadding = Platform.OS === "web" ? 67 : insets.top;
  const bottomPadding = Platform.OS === "web" ? 34 : insets.bottom;

  useEffect(() => {
    if (!couple?.startDate) return;
    const startDate = new Date(couple.startDate);

    const update = () => {
      setSeconds(differenceInSeconds(new Date(), startDate));
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [couple?.startDate]);

  if (isLoading) {
    return (
      <LinearGradient
        colors={[Colors.primary, Colors.primaryDark, "#8B1A4A"]}
        style={[styles.flex, styles.center]}
      >
        <ActivityIndicator size="large" color="#fff" />
      </LinearGradient>
    );
  }

  if (!couple) {
    return (
      <View testID="home-screen" style={styles.flex}>
        <SetupScreen />
      </View>
    );
  }

  const startDate = new Date(couple.startDate);
  const now = new Date();

  const remainingMonths = monthsInLove - yearsInLove * 12;
  const remainingDays = differenceInDays(now, startDate) - Math.floor(monthsInLove * 30.44);
  const displayDays = Math.max(0, Math.round(remainingDays));
  const displayHours = hoursInLove - daysInLove * 24;
  const displayMinutes = minutesInLove - hoursInLove * 60;
  const displaySeconds = seconds % 60;

  const formattedStartDate = format(startDate, "EEEE, dd MMMM yyyy", { locale: vi });

  let milestoneProgress = 0;
  let daysToMilestone = 0;
  if (nextMilestone) {
    daysToMilestone = nextMilestone.days - daysInLove;
    const prevMilestoneDays = daysInLove;
    milestoneProgress = Math.min(1, prevMilestoneDays / nextMilestone.days);
  }

  return (
    <View testID="home-screen" style={styles.flex}>
      <LinearGradient
        colors={[Colors.primaryDark, "#8B1A4A", "#4A0E2A", "#2D0819"]}
        style={styles.flex}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
      >
        <ScrollView
          contentContainerStyle={[
            styles.mainContainer,
            { paddingTop: topPadding + 20, paddingBottom: bottomPadding + 100 },
          ]}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.partnerRow}>
            <Text style={styles.partnerName} numberOfLines={1}>
              {couple.partner1Name}
            </Text>
            <Ionicons
              name="heart"
              size={22}
              color={Colors.heart}
              style={styles.partnerHeart}
            />
            <Text style={styles.partnerName} numberOfLines={1}>
              {couple.partner2Name}
            </Text>
          </View>

          <View style={styles.heartSection}>
            <View style={styles.floatingHeartsContainer}>
              <FloatingHeart delay={0} left={20} />
              <FloatingHeart delay={800} left={60} />
              <FloatingHeart delay={1600} left={100} />
              <FloatingHeart delay={400} left={140} />
              <FloatingHeart delay={1200} left={180} />
            </View>
            <PulsingHeart size={100} />
          </View>

          <Text style={styles.bigNumber}>{daysInLove}</Text>
          <Text style={styles.bigLabel}>ngày yêu nhau</Text>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Ionicons name="time-outline" size={18} color="rgba(255,255,255,0.7)" />
              <Text style={styles.cardTitle}>Thời gian bên nhau</Text>
            </View>
            <Text style={styles.breakdownText}>
              {yearsInLove > 0
                ? `${yearsInLove} năm, ${remainingMonths} tháng, ${displayDays} ngày`
                : remainingMonths > 0
                ? `${remainingMonths} tháng, ${displayDays} ngày`
                : `${daysInLove} ngày`}
            </Text>
            <Text style={styles.breakdownSubText}>
              {displayHours} giờ, {displayMinutes} phút, {displaySeconds} giây bên nhau
            </Text>
          </View>

          <View style={styles.card}>
            <View style={styles.cardRow}>
              <Ionicons name="chatbubble-ellipses-outline" size={18} color="rgba(255,255,255,0.7)" />
              <Text style={styles.cardTitle}>Lời yêu hôm nay</Text>
            </View>
            <View style={styles.quoteContainer}>
              <Ionicons
                name="heart"
                size={14}
                color="rgba(255,255,255,0.3)"
                style={styles.quoteIcon}
              />
              <Text style={styles.quoteText}>{todayQuote}</Text>
            </View>
          </View>

          {nextMilestone && (
            <View style={styles.card}>
              <View style={styles.cardRow}>
                <Ionicons name="flag-outline" size={18} color="rgba(255,255,255,0.7)" />
                <Text style={styles.cardTitle}>Cột mốc tiếp theo</Text>
              </View>
              <Text style={styles.milestoneLabel}>{nextMilestone.label}</Text>
              <Text style={styles.milestoneDesc}>{nextMilestone.description}</Text>
              <Text style={styles.milestoneDays}>
                Còn {daysToMilestone} ngày nữa
              </Text>
              <View style={styles.progressBarBg}>
                <View
                  style={[
                    styles.progressBarFill,
                    { width: `${Math.round(milestoneProgress * 100)}%` },
                  ]}
                />
              </View>
            </View>
          )}

          <View style={styles.startDateContainer}>
            <Ionicons name="calendar-outline" size={16} color="rgba(255,255,255,0.5)" />
            <Text style={styles.startDateText}>
              Bắt đầu từ: {formattedStartDate}
            </Text>
          </View>
        </ScrollView>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
  },
  center: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
  },
  setupContainer: {
    alignItems: "center" as const,
    paddingHorizontal: 32,
  },
  setupIconWrap: {
    marginBottom: 24,
  },
  setupTitle: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 32,
    fontWeight: "800" as const,
    color: "#fff",
    textAlign: "center" as const,
    marginBottom: 8,
    letterSpacing: 1,
  },
  setupSubtitle: {
    fontFamily: "Nunito_400Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.75)",
    textAlign: "center" as const,
    marginBottom: 40,
    lineHeight: 22,
  },
  setupForm: {
    width: "100%" as any,
    gap: 16,
  },
  inputWrapper: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.2)",
    paddingHorizontal: 16,
  },
  inputIcon: {
    marginRight: 12,
  },
  textInput: {
    fontFamily: "Nunito_400Regular",
    flex: 1,
    height: 52,
    color: "#fff",
    fontSize: 16,
  },
  createButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.heart,
    borderRadius: 16,
    height: 54,
    gap: 8,
    marginTop: 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.heart,
        shadowOffset: { width: 0, height: 6 },
        shadowOpacity: 0.4,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
      default: {},
    }),
  },
  createButtonDisabled: {
    opacity: 0.6,
  },
  createButtonText: {
    fontFamily: "Nunito_700Bold",
    color: "#fff",
    fontSize: 18,
    fontWeight: "700" as const,
  },
  mainContainer: {
    alignItems: "center" as const,
    paddingHorizontal: 20,
  },
  partnerRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    marginBottom: 16,
    gap: 8,
    flexWrap: "wrap" as const,
  },
  partnerName: {
    fontFamily: "Nunito_700Bold",
    fontSize: 20,
    fontWeight: "700" as const,
    color: "#fff",
    maxWidth: 140,
  },
  partnerHeart: {
    marginHorizontal: 4,
  },
  heartSection: {
    alignItems: "center" as const,
    justifyContent: "center" as const,
    height: 140,
    width: 200,
    marginBottom: 8,
  },
  floatingHeartsContainer: {
    position: "absolute" as const,
    width: 200,
    height: 100,
    bottom: 20,
  },
  bigNumber: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 72,
    fontWeight: "900" as const,
    color: "#fff",
    textAlign: "center" as const,
    lineHeight: 80,
    ...Platform.select({
      ios: {
        shadowColor: "#FF1744",
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 20,
      },
      default: {},
    }),
  },
  bigLabel: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 18,
    color: "rgba(255,255,255,0.8)",
    fontWeight: "500" as const,
    marginBottom: 28,
    letterSpacing: 2,
    textTransform: "uppercase" as const,
  },
  card: {
    width: "100%" as any,
    backgroundColor: "rgba(255,255,255,0.1)",
    borderRadius: 20,
    padding: 20,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.08)",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12,
      },
      android: { elevation: 4 },
      default: {},
    }),
  },
  cardRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginBottom: 12,
  },
  cardTitle: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    fontWeight: "600" as const,
    color: "rgba(255,255,255,0.7)",
    textTransform: "uppercase" as const,
    letterSpacing: 1,
  },
  breakdownText: {
    fontFamily: "Nunito_700Bold",
    fontSize: 22,
    fontWeight: "700" as const,
    color: "#fff",
    marginBottom: 4,
  },
  breakdownSubText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 16,
    color: "rgba(255,255,255,0.7)",
  },
  quoteContainer: {
    flexDirection: "row" as const,
    gap: 10,
  },
  quoteIcon: {
    marginTop: 3,
  },
  quoteText: {
    fontFamily: "Nunito_400Regular",
    flex: 1,
    fontSize: 16,
    color: "rgba(255,255,255,0.9)",
    fontStyle: "italic" as const,
    lineHeight: 24,
  },
  milestoneLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.gold,
    marginBottom: 4,
  },
  milestoneDesc: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.7)",
    marginBottom: 8,
  },
  milestoneDays: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
    color: "#fff",
    fontWeight: "600" as const,
    marginBottom: 12,
  },
  progressBarBg: {
    height: 8,
    backgroundColor: "rgba(255,255,255,0.15)",
    borderRadius: 4,
    overflow: "hidden" as const,
  },
  progressBarFill: {
    height: 8,
    backgroundColor: Colors.gold,
    borderRadius: 4,
  },
  startDateContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginTop: 8,
  },
  startDateText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: "rgba(255,255,255,0.5)",
    fontStyle: "italic" as const,
  },
});
