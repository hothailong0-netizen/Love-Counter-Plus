import { View, Text, StyleSheet, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import Animated, { FadeInLeft } from "react-native-reanimated";

import { useLove } from "@/lib/love-context";
import Colors from "@/constants/colors";
import milestones from "@/constants/milestones";

function MilestoneCard({
  milestone,
  index,
  isReached,
  isToday,
  daysRemaining,
  isLast,
}: {
  milestone: (typeof milestones)[number];
  index: number;
  isReached: boolean;
  isToday: boolean;
  daysRemaining: number;
  isLast: boolean;
}) {
  const cardContent = (
    <View style={styles.timelineRow}>
      <View style={styles.timelineLeft}>
        <View
          style={[
            styles.iconCircle,
            isReached && styles.iconCircleReached,
            isToday && styles.iconCircleToday,
            !isReached && !isToday && styles.iconCircleUpcoming,
          ]}
        >
          <Ionicons
            name={milestone.icon as any}
            size={26}
            color={isReached || isToday ? Colors.gold : Colors.textSecondary}
          />
        </View>
        {!isLast && (
          <View
            style={[
              styles.connector,
              isReached && styles.connectorReached,
            ]}
          />
        )}
      </View>

      <View
        style={[
          styles.card,
          isReached && styles.cardReached,
          isToday && styles.cardToday,
          !isReached && !isToday && styles.cardUpcoming,
        ]}
      >
        <View style={styles.cardTopRow}>
          <Text
            style={[
              styles.cardLabel,
              isToday && styles.cardLabelToday,
            ]}
          >
            {milestone.label}
          </Text>
          {isReached && !isToday && (
            <Ionicons name="checkmark-circle" size={22} color={Colors.gold} />
          )}
          {isToday && (
            <View style={styles.todayBadge}>
              <Ionicons name="sparkles" size={14} color={Colors.gold} />
              <Text style={styles.todayBadgeText}>Hôm nay!</Text>
            </View>
          )}
        </View>
        <Text
          style={[
            styles.cardDescription,
            !isReached && !isToday && styles.cardDescriptionUpcoming,
          ]}
        >
          {milestone.description}
        </Text>
        {!isReached && !isToday && (
          <Text style={styles.remainingText}>Còn {daysRemaining} ngày</Text>
        )}
      </View>
    </View>
  );

  if (isReached || isToday) {
    return (
      <Animated.View entering={FadeInLeft.delay(index * 80).duration(400)}>
        {cardContent}
      </Animated.View>
    );
  }

  return <View>{cardContent}</View>;
}

export default function MilestonesScreen() {
  const insets = useSafeAreaInsets();
  const { couple, daysInLove } = useLove();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const reachedCount = milestones.filter((m) => daysInLove >= m.days).length;
  const totalCount = milestones.length;
  const progressPercent = Math.round((reachedCount / totalCount) * 100);

  const nextMilestone = milestones.find((m) => m.days > daysInLove);
  const daysToNext = nextMilestone ? nextMilestone.days - daysInLove : 0;

  if (!couple) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]} testID="milestones-screen">
        <View style={styles.noCoupleContainer}>
          <Ionicons name="heart-dislike-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.noCoupleText}>
            Hãy thiết lập thông tin cặp đôi trước
          </Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container} testID="milestones-screen">
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topInset + 16 }]}
      >
        <Text style={styles.headerTitle}>Cột Mốc Tình Yêu</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.statsRow}>
          <View style={styles.statCard}>
            <Ionicons name="checkmark-circle" size={28} color={Colors.gold} />
            <Text style={styles.statValue}>{reachedCount}</Text>
            <Text style={styles.statLabel}>Đã đạt</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="flag" size={28} color={Colors.primary} />
            <Text style={styles.statValue}>{totalCount}</Text>
            <Text style={styles.statLabel}>Tổng cột mốc</Text>
          </View>
          <View style={styles.statCard}>
            <Ionicons name="hourglass" size={28} color={Colors.primaryLight} />
            <Text style={styles.statValue}>{nextMilestone ? daysToNext : "—"}</Text>
            <Text style={styles.statLabel}>Tiếp theo</Text>
          </View>
        </View>

        <View style={styles.progressContainer}>
          <View style={styles.progressHeader}>
            <Text style={styles.progressLabel}>Tiến trình</Text>
            <Text style={styles.progressPercent}>{progressPercent}%</Text>
          </View>
          <View style={styles.progressBarBg}>
            <LinearGradient
              colors={[Colors.gold, "#FFEC80"]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={[styles.progressBarFill, { width: `${progressPercent}%` as any }]}
            />
          </View>
        </View>

        <View style={styles.timelineContainer}>
          {milestones.map((milestone, index) => {
            const isReached = daysInLove >= milestone.days;
            const isToday = daysInLove === milestone.days;
            const daysRemaining = milestone.days - daysInLove;

            return (
              <MilestoneCard
                key={milestone.days}
                milestone={milestone}
                index={index}
                isReached={isReached}
                isToday={isToday}
                daysRemaining={daysRemaining}
                isLast={index === milestones.length - 1}
              />
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  headerTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 26,
    fontWeight: "bold" as const,
    color: "#FFF",
    textAlign: "center" as const,
  },
  scrollContent: {
    padding: 16,
  },
  noCoupleContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 32,
  },
  noCoupleText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: "center" as const,
  },
  statsRow: {
    flexDirection: "row" as const,
    gap: 10,
    marginBottom: 16,
  },
  statCard: {
    flex: 1,
    backgroundColor: "rgba(255, 255, 255, 0.85)",
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center" as const,
    gap: 4,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
      android: { elevation: 3 },
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 6,
      },
    }),
  },
  statValue: {
    fontFamily: "Nunito_700Bold",
    fontSize: 22,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  progressContainer: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    padding: 14,
    marginBottom: 20,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
      android: { elevation: 2 },
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.06,
        shadowRadius: 6,
      },
    }),
  },
  progressHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  progressLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  progressPercent: {
    fontFamily: "Nunito_700Bold",
    fontSize: 14,
    fontWeight: "700" as const,
    color: Colors.gold,
  },
  progressBarBg: {
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.border,
    overflow: "hidden" as const,
  },
  progressBarFill: {
    height: 10,
    borderRadius: 5,
  },
  timelineContainer: {
    paddingLeft: 4,
  },
  timelineRow: {
    flexDirection: "row" as const,
    minHeight: 100,
  },
  timelineLeft: {
    alignItems: "center" as const,
    width: 56,
    marginRight: 12,
  },
  iconCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    borderWidth: 2,
  },
  iconCircleReached: {
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    borderColor: Colors.gold,
    ...Platform.select({
      ios: {
        shadowColor: Colors.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
      android: { elevation: 4 },
      web: {
        shadowColor: Colors.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.5,
        shadowRadius: 8,
      },
    }),
  },
  iconCircleToday: {
    backgroundColor: "rgba(255, 215, 0, 0.25)",
    borderColor: Colors.gold,
    borderWidth: 3,
    ...Platform.select({
      ios: {
        shadowColor: Colors.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 12,
      },
      android: { elevation: 8 },
      web: {
        shadowColor: Colors.gold,
        shadowOffset: { width: 0, height: 0 },
        shadowOpacity: 0.8,
        shadowRadius: 12,
      },
    }),
  },
  iconCircleUpcoming: {
    backgroundColor: Colors.background,
    borderColor: Colors.border,
  },
  connector: {
    flex: 1,
    width: 2,
    backgroundColor: Colors.border,
    marginVertical: 4,
  },
  connectorReached: {
    backgroundColor: Colors.gold,
  },
  card: {
    flex: 1,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: "transparent",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: { elevation: 3 },
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
    }),
  },
  cardReached: {
    borderLeftColor: Colors.gold,
  },
  cardToday: {
    borderLeftColor: Colors.gold,
    backgroundColor: "rgba(255, 215, 0, 0.08)",
  },
  cardUpcoming: {
    opacity: 0.5,
    borderLeftColor: Colors.border,
  },
  cardTopRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 4,
  },
  cardLabel: {
    fontFamily: "Nunito_700Bold",
    fontSize: 17,
    fontWeight: "700" as const,
    color: Colors.text,
    flexShrink: 1,
  },
  cardLabelToday: {
    fontFamily: "Nunito_800ExtraBold",
    color: Colors.gold,
    fontSize: 18,
    fontWeight: "800" as const,
  },
  cardDescription: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
    marginBottom: 4,
  },
  cardDescriptionUpcoming: {
    color: Colors.textSecondary,
  },
  todayBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: "rgba(255, 215, 0, 0.18)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    gap: 4,
  },
  todayBadgeText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.gold,
  },
  remainingText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: "italic" as const,
    marginTop: 2,
  },
});
