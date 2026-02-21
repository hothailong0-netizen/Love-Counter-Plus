import { View, Text, StyleSheet, Platform, ScrollView } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";

import { useLove } from "@/lib/love-context";
import Colors from "@/constants/colors";
import milestones from "@/constants/milestones";

export default function MilestonesScreen() {
  const insets = useSafeAreaInsets();
  const { couple, daysInLove } = useLove();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  if (!couple) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]} testID="milestones-screen">
        <View style={styles.noCoupleContainer}>
          <Ionicons name="heart-dislike-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.noCoupleText}>
            H\u00e3y thi\u1ebft l\u1eadp th\u00f4ng tin c\u1eb7p \u0111\u00f4i tr\u01b0\u1edbc
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
        <Text style={styles.headerTitle}>C\u1ed9t M\u1ed1c T\u00ecnh Y\u00eau</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.listContent, { paddingBottom: bottomInset + 80 }]}
        showsVerticalScrollIndicator={false}
      >
        {milestones.map((milestone, index) => {
          const isReached = daysInLove >= milestone.days;
          const isToday = daysInLove === milestone.days;
          const daysRemaining = milestone.days - daysInLove;

          return (
            <View
              key={milestone.days}
              style={[
                styles.card,
                isReached && styles.cardReached,
                isToday && styles.cardToday,
                !isReached && styles.cardUpcoming,
              ]}
            >
              <View style={styles.cardLeft}>
                <View
                  style={[
                    styles.iconCircle,
                    isReached && styles.iconCircleReached,
                    isToday && styles.iconCircleToday,
                    !isReached && styles.iconCircleUpcoming,
                  ]}
                >
                  <Ionicons
                    name={milestone.icon as any}
                    size={24}
                    color={isReached ? Colors.gold : Colors.textSecondary}
                  />
                </View>
                {index < milestones.length - 1 && (
                  <View
                    style={[
                      styles.connector,
                      isReached && styles.connectorReached,
                    ]}
                  />
                )}
              </View>

              <View style={styles.cardBody}>
                <View style={styles.cardTopRow}>
                  <Text
                    style={[
                      styles.cardLabel,
                      isReached && styles.cardLabelReached,
                      isToday && styles.cardLabelToday,
                    ]}
                  >
                    {milestone.label}
                  </Text>
                  {isReached && (
                    <View style={styles.checkBadge}>
                      <Ionicons name="checkmark-circle" size={20} color={Colors.gold} />
                    </View>
                  )}
                </View>
                <Text
                  style={[
                    styles.cardDescription,
                    !isReached && styles.cardDescriptionUpcoming,
                  ]}
                >
                  {milestone.description}
                </Text>
                {isToday && (
                  <View style={styles.todayBadge}>
                    <Ionicons name="sparkles" size={14} color={Colors.gold} />
                    <Text style={styles.todayBadgeText}>H\u00f4m nay</Text>
                  </View>
                )}
                {!isReached && (
                  <Text style={styles.remainingText}>
                    C\u00f2n {daysRemaining} ng\u00e0y
                  </Text>
                )}
              </View>
            </View>
          );
        })}
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
    fontSize: 26,
    fontWeight: "bold" as const,
    color: "#FFF",
    textAlign: "center",
  },
  listContent: {
    padding: 16,
    paddingLeft: 20,
  },
  noCoupleContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  noCoupleText: {
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: "center",
  },
  card: {
    flexDirection: "row" as const,
    marginBottom: 0,
    minHeight: 90,
  },
  cardReached: {},
  cardToday: {},
  cardUpcoming: {
    opacity: 0.6,
  },
  cardLeft: {
    alignItems: "center" as const,
    width: 52,
    marginRight: 12,
  },
  iconCircle: {
    width: 48,
    height: 48,
    borderRadius: 24,
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
  cardBody: {
    flex: 1,
    paddingBottom: 20,
    paddingTop: 4,
  },
  cardTopRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 4,
  },
  cardLabel: {
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  cardLabelReached: {
    color: Colors.text,
  },
  cardLabelToday: {
    color: Colors.gold,
    fontSize: 20,
    fontWeight: "800" as const,
  },
  checkBadge: {
    marginLeft: 8,
  },
  cardDescription: {
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
    backgroundColor: "rgba(255, 215, 0, 0.15)",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: "flex-start" as const,
    gap: 4,
    marginTop: 4,
  },
  todayBadgeText: {
    fontSize: 13,
    fontWeight: "600" as const,
    color: Colors.gold,
  },
  remainingText: {
    fontSize: 13,
    color: Colors.textSecondary,
    fontStyle: "italic" as const,
    marginTop: 2,
  },
});
