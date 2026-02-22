import { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Modal,
  TextInput,
  ScrollView,
  Pressable,
  Alert,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { format, parseISO, differenceInDays } from "date-fns";
import { vi } from "date-fns/locale/vi";

import { useLove } from "@/lib/love-context";
import Colors from "@/constants/colors";
import type { ImportantDate } from "@shared/schema";
import milestones from "@/constants/milestones";

const DATE_TYPES = [
  { label: "Sinh nhật", value: "birthday", color: Colors.primary },
  { label: "Kỷ niệm", value: "anniversary", color: Colors.gold },
  { label: "Đặc biệt", value: "special", color: Colors.success },
  { label: "Khác", value: "other", color: Colors.textSecondary },
];

const DATE_TYPE_ICONS: Record<string, keyof typeof Ionicons.glyphMap> = {
  birthday: "gift-outline",
  anniversary: "heart-circle-outline",
  special: "star-outline",
  other: "ellipsis-horizontal-circle-outline",
};

function getTypeBadge(type: string) {
  return DATE_TYPES.find((t) => t.value === type) ?? DATE_TYPES[3];
}

function formatDateVN(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, "d 'tháng' M, yyyy", { locale: vi });
  } catch {
    return dateStr;
  }
}

function getDateCountdown(dateStr: string): { text: string; isPast: boolean } {
  try {
    const date = parseISO(dateStr);
    const now = new Date();
    const thisYear = new Date(now.getFullYear(), date.getMonth(), date.getDate());
    let target = thisYear;
    if (thisYear < now) {
      target = new Date(now.getFullYear() + 1, date.getMonth(), date.getDate());
    }
    const diff = differenceInDays(target, now);
    if (diff === 0) return { text: "Hôm nay", isPast: false };
    if (diff > 0) return { text: `Còn ${diff} ngày`, isPast: false };
    return { text: "Đã qua", isPast: true };
  } catch {
    return { text: "Đã qua", isPast: true };
  }
}

export default function SettingsScreen() {
  const insets = useSafeAreaInsets();
  const {
    couple,
    memories,
    importantDates,
    daysInLove,
    updateCouple,
    addImportantDate,
    deleteImportantDate,
  } = useLove();

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editPartner1, setEditPartner1] = useState("");
  const [editPartner2, setEditPartner2] = useState("");
  const [editDateText, setEditDateText] = useState("");

  const [addDateModalVisible, setAddDateModalVisible] = useState(false);
  const [newDateTitle, setNewDateTitle] = useState("");
  const [newDateText, setNewDateText] = useState("");
  const [newDateType, setNewDateType] = useState("birthday");

  const openEditModal = () => {
    if (!couple) return;
    setEditPartner1(couple.partner1Name);
    setEditPartner2(couple.partner2Name);
    const d = parseISO(couple.startDate);
    setEditDateText(format(d, "dd/MM/yyyy"));
    setEditModalVisible(true);
  };

  const handleSaveCouple = async () => {
    if (!editPartner1.trim() || !editPartner2.trim() || !editDateText.trim()) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin");
      return;
    }
    const parts = editDateText.split("/");
    if (parts.length !== 3) {
      Alert.alert("Lỗi", "Ngày không hợp lệ. Vui lòng nhập theo định dạng DD/MM/YYYY");
      return;
    }
    const isoDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    try {
      await updateCouple({
        partner1Name: editPartner1.trim(),
        partner2Name: editPartner2.trim(),
        startDate: isoDate,
      });
      setEditModalVisible(false);
    } catch {
      Alert.alert("Lỗi", "Không thể cập nhật. Vui lòng thử lại.");
    }
  };

  const openAddDateModal = () => {
    setNewDateTitle("");
    setNewDateText("");
    setNewDateType("birthday");
    setAddDateModalVisible(true);
  };

  const handleAddDate = async () => {
    if (!newDateTitle.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên sự kiện");
      return;
    }
    if (!newDateText.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập ngày");
      return;
    }
    const parts = newDateText.split("/");
    if (parts.length !== 3) {
      Alert.alert("Lỗi", "Ngày không hợp lệ. Vui lòng nhập theo định dạng DD/MM/YYYY");
      return;
    }
    const isoDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;
    try {
      await addImportantDate({
        coupleId: couple!.id,
        title: newDateTitle.trim(),
        date: isoDate,
        type: newDateType,
      });
      setAddDateModalVisible(false);
    } catch {
      Alert.alert("Lỗi", "Không thể thêm ngày. Vui lòng thử lại.");
    }
  };

  const handleDeleteDate = (item: ImportantDate) => {
    Alert.alert(
      "Xóa ngày quan trọng",
      `Bạn có chắc muốn xóa "${item.title}" không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => deleteImportantDate(item.id),
        },
      ]
    );
  };

  if (!couple) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]} testID="settings-screen">
        <View style={styles.noCoupleContainer}>
          <View style={styles.noCoupleIconCircle}>
            <Ionicons name="heart-dislike-outline" size={48} color={Colors.primary} />
          </View>
          <Text style={styles.noCoupleTitle}>Chưa có thông tin</Text>
          <Text style={styles.noCoupleText}>
            Hãy thiết lập thông tin cặp đôi ở màn hình chính trước
          </Text>
        </View>
      </View>
    );
  }

  const photosCount = memories.filter((m) => m.photoUri).length;
  const milestonesReached = milestones.filter((m) => daysInLove >= m.days).length;

  const statsData = [
    { icon: "heart" as const, value: daysInLove, label: "Ngày yêu", color: Colors.heart, bg: Colors.heart + "18" },
    { icon: "book" as const, value: memories.length, label: "Kỷ niệm", color: Colors.primary, bg: Colors.primary + "18" },
    { icon: "images" as const, value: photosCount, label: "Ảnh", color: Colors.success, bg: Colors.success + "18" },
    { icon: "calendar" as const, value: importantDates.length, label: "Ngày quan trọng", color: Colors.gold, bg: Colors.gold + "30" },
    { icon: "trophy" as const, value: milestonesReached, label: "Cột mốc đạt được", color: "#9C27B0", bg: "#9C27B018" },
  ];

  return (
    <View style={styles.container} testID="settings-screen">
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topInset + 16 }]}
      >
        <Text style={styles.headerTitle}>Cài Đặt</Text>
      </LinearGradient>

      <ScrollView
        contentContainerStyle={[styles.scrollContent, { paddingBottom: bottomInset + 80 }]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View style={styles.loveSummaryCard}>
          <View style={styles.loveSummaryNames}>
            <Text style={styles.loveSummaryName}>{couple.partner1Name}</Text>
            <View style={styles.loveSummaryHeartCircle}>
              <Ionicons name="heart" size={18} color="#FFF" />
            </View>
            <Text style={styles.loveSummaryName}>{couple.partner2Name}</Text>
          </View>
          <Text style={styles.loveSummaryDate}>
            {formatDateVN(couple.startDate)}
          </Text>
          <Text style={styles.loveSummaryDays}>
            {daysInLove} ngày yêu nhau
          </Text>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconCircle, { backgroundColor: Colors.primary + "18" }]}>
                <Ionicons name="people" size={16} color={Colors.primary} />
              </View>
              <Text style={styles.sectionTitle}>Thông tin cặp đôi</Text>
            </View>
            <Pressable onPress={openEditModal} style={styles.editButton} hitSlop={8}>
              <Ionicons name="create-outline" size={20} color={Colors.primary} />
            </Pressable>
          </View>
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.infoLabel}>Người 1</Text>
              <Text style={styles.infoValue}>{couple.partner1Name}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="person-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.infoLabel}>Người 2</Text>
              <Text style={styles.infoValue}>{couple.partner2Name}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.infoRow}>
              <Ionicons name="calendar-outline" size={18} color={Colors.textSecondary} />
              <Text style={styles.infoLabel}>Ngày bắt đầu</Text>
              <Text style={styles.infoValue}>{formatDateVN(couple.startDate)}</Text>
            </View>
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconCircle, { backgroundColor: Colors.gold + "30" }]}>
                <Ionicons name="stats-chart" size={16} color={Colors.gold} />
              </View>
              <Text style={styles.sectionTitle}>Thống kê tình yêu</Text>
            </View>
          </View>
          <View style={styles.statsGrid}>
            {statsData.map((stat, index) => (
              <View key={index} style={styles.statCard}>
                <View style={[styles.statIconCircle, { backgroundColor: stat.bg }]}>
                  <Ionicons name={stat.icon} size={22} color={stat.color} />
                </View>
                <Text style={[styles.statNumber, { color: stat.color }]}>{stat.value}</Text>
                <Text style={styles.statLabel}>{stat.label}</Text>
              </View>
            ))}
          </View>
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <View style={styles.sectionHeaderLeft}>
              <View style={[styles.sectionIconCircle, { backgroundColor: Colors.heart + "18" }]}>
                <Ionicons name="calendar" size={16} color={Colors.heart} />
              </View>
              <Text style={styles.sectionTitle}>Ngày Quan Trọng</Text>
            </View>
            <Pressable onPress={openAddDateModal} style={styles.editButton} hitSlop={8}>
              <Ionicons name="add-circle-outline" size={22} color={Colors.primary} />
            </Pressable>
          </View>

          {importantDates.length === 0 ? (
            <View style={styles.emptyDates}>
              <View style={styles.emptyDatesIconCircle}>
                <Ionicons name="calendar-outline" size={32} color={Colors.textSecondary} />
              </View>
              <Text style={styles.emptyDatesText}>Chưa có ngày quan trọng nào</Text>
            </View>
          ) : (
            importantDates.map((item) => {
              const badge = getTypeBadge(item.type);
              const iconName = DATE_TYPE_ICONS[item.type] || "ellipsis-horizontal-circle-outline";
              const countdown = getDateCountdown(item.date);
              return (
                <View key={item.id} style={styles.dateCard}>
                  <View style={[styles.dateCardIconCircle, { backgroundColor: badge.color + "18" }]}>
                    <Ionicons name={iconName} size={22} color={badge.color} />
                  </View>
                  <View style={styles.dateCardCenter}>
                    <Text style={styles.dateCardTitle}>{item.title}</Text>
                    <Text style={styles.dateCardDate}>{formatDateVN(item.date)}</Text>
                    <View style={styles.dateCardBottom}>
                      <View style={[styles.typeBadge, { backgroundColor: badge.color + "15", borderColor: badge.color }]}>
                        <Text style={[styles.typeBadgeText, { color: badge.color }]}>{badge.label}</Text>
                      </View>
                      <Text style={[styles.countdownText, { color: countdown.isPast ? Colors.textSecondary : Colors.success }]}>
                        {countdown.text}
                      </Text>
                    </View>
                  </View>
                  <Pressable onPress={() => handleDeleteDate(item)} hitSlop={8} style={styles.deleteButton}>
                    <Ionicons name="trash-outline" size={20} color={Colors.heart} />
                  </Pressable>
                </View>
              );
            })
          )}
        </View>

        <View style={styles.sectionDivider} />

        <View style={styles.aboutSection}>
          <Ionicons name="heart" size={24} color={Colors.primary} />
          <Text style={styles.aboutAppName}>Đếm Ngày Yêu</Text>
          <Text style={styles.aboutVersion}>v1.0</Text>
          <Text style={styles.aboutTagline}>Được tạo với tình yêu</Text>
        </View>
      </ScrollView>

      <Modal
        visible={editModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setEditModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Chỉnh sửa thông tin</Text>
            <Pressable onPress={() => setEditModalVisible(false)}>
              <Ionicons name="close" size={28} color={Colors.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={{ paddingBottom: bottomInset + 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.inputLabel}>Tên người 1</Text>
            <TextInput
              style={styles.input}
              value={editPartner1}
              onChangeText={setEditPartner1}
              placeholder="Nhập tên..."
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.inputLabel}>Tên người 2</Text>
            <TextInput
              style={styles.input}
              value={editPartner2}
              onChangeText={setEditPartner2}
              placeholder="Nhập tên..."
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.inputLabel}>Ngày bắt đầu</Text>
            <TextInput
              style={styles.input}
              value={editDateText}
              onChangeText={setEditDateText}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
            />

            <Pressable style={styles.saveButton} onPress={handleSaveCouple}>
              <Ionicons name="checkmark" size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>Lưu thay đổi</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>

      <Modal
        visible={addDateModalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setAddDateModalVisible(false)}
      >
        <View style={[styles.modalContainer, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 }]}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Thêm ngày quan trọng</Text>
            <Pressable onPress={() => setAddDateModalVisible(false)}>
              <Ionicons name="close" size={28} color={Colors.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={{ paddingBottom: bottomInset + 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.inputLabel}>Tên sự kiện</Text>
            <TextInput
              style={styles.input}
              value={newDateTitle}
              onChangeText={setNewDateTitle}
              placeholder="Ví dụ: Sinh nhật anh..."
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.inputLabel}>Ngày</Text>
            <TextInput
              style={styles.input}
              value={newDateText}
              onChangeText={setNewDateText}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Loại sự kiện</Text>
            <View style={styles.typeRow}>
              {DATE_TYPES.map((type) => (
                <Pressable
                  key={type.value}
                  style={[
                    styles.typeChip,
                    {
                      backgroundColor: newDateType === type.value ? type.color : Colors.background,
                      borderColor: type.color,
                    },
                  ]}
                  onPress={() => setNewDateType(type.value)}
                >
                  <Text
                    style={[
                      styles.typeChipText,
                      { color: newDateType === type.value ? "#FFF" : type.color },
                    ]}
                  >
                    {type.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.saveButton} onPress={handleAddDate}>
              <Ionicons name="add" size={20} color="#FFF" />
              <Text style={styles.saveButtonText}>Thêm ngày</Text>
            </Pressable>
          </ScrollView>
        </View>
      </Modal>
    </View>
  );
}

const cardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
  android: { elevation: 4 },
  web: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
  },
});

const lightCardShadow = Platform.select({
  ios: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
  android: { elevation: 2 },
  web: {
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.06,
    shadowRadius: 6,
  },
});

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
    gap: 0,
  },
  noCoupleContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    padding: 32,
    gap: 12,
  },
  noCoupleIconCircle: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: Colors.primary + "12",
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 8,
  },
  noCoupleTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 20,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  noCoupleText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 16,
    color: Colors.textSecondary,
    textAlign: "center" as const,
    lineHeight: 24,
  },
  loveSummaryCard: {
    backgroundColor: Colors.primary + "0D",
    borderRadius: 16,
    padding: 20,
    alignItems: "center" as const,
    gap: 8,
    borderWidth: 1,
    borderColor: Colors.primary + "20",
    ...cardShadow,
  },
  loveSummaryNames: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 12,
  },
  loveSummaryName: {
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  loveSummaryHeartCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.heart,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  loveSummaryDate: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  loveSummaryDays: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 28,
    fontWeight: "800" as const,
    color: Colors.primary,
    marginTop: 4,
  },
  sectionDivider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 16,
    marginHorizontal: 4,
  },
  section: {
    marginBottom: 0,
  },
  sectionHeader: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "space-between" as const,
    marginBottom: 14,
  },
  sectionHeaderLeft: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    flex: 1,
  },
  sectionIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  sectionTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
  },
  editButton: {
    padding: 4,
  },
  infoCard: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 16,
    ...cardShadow,
  },
  infoRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 10,
    paddingVertical: 10,
  },
  infoLabel: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    width: 80,
  },
  infoValue: {
    fontFamily: "Nunito_600SemiBold",
    flex: 1,
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    textAlign: "right" as const,
  },
  divider: {
    height: 1,
    backgroundColor: Colors.border,
    marginVertical: 2,
  },
  statsGrid: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 12,
  },
  statCard: {
    flex: 1,
    minWidth: "28%" as any,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    alignItems: "center" as const,
    gap: 6,
    ...lightCardShadow,
  },
  statIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    marginBottom: 2,
  },
  statNumber: {
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 24,
    fontWeight: "800" as const,
    color: Colors.text,
  },
  statLabel: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
    textAlign: "center" as const,
  },
  dateCard: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.card,
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    gap: 12,
    ...lightCardShadow,
  },
  dateCardIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  dateCardCenter: {
    flex: 1,
    gap: 3,
  },
  dateCardTitle: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 16,
    fontWeight: "600" as const,
    color: Colors.text,
  },
  dateCardDate: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  dateCardBottom: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    marginTop: 4,
  },
  typeBadge: {
    alignSelf: "flex-start" as const,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 10,
    borderWidth: 1,
  },
  typeBadgeText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 11,
    fontWeight: "600" as const,
  },
  countdownText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 12,
    fontWeight: "600" as const,
  },
  deleteButton: {
    padding: 6,
  },
  emptyDates: {
    alignItems: "center" as const,
    paddingVertical: 32,
    gap: 10,
  },
  emptyDatesIconCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: Colors.border + "80",
    justifyContent: "center" as const,
    alignItems: "center" as const,
  },
  emptyDatesText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 15,
    color: Colors.textSecondary,
  },
  aboutSection: {
    alignItems: "center" as const,
    paddingVertical: 24,
    gap: 6,
  },
  aboutAppName: {
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    fontWeight: "700" as const,
    color: Colors.text,
    marginTop: 4,
  },
  aboutVersion: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  aboutTagline: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    fontStyle: "italic" as const,
    marginTop: 2,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "space-between" as const,
    alignItems: "center" as const,
    paddingHorizontal: 20,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  modalTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 20,
    fontWeight: "bold" as const,
    color: Colors.text,
  },
  modalBody: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  inputLabel: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
    fontWeight: "600" as const,
    color: Colors.text,
    marginBottom: 8,
  },
  input: {
    fontFamily: "Nunito_400Regular",
    borderWidth: 1,
    borderColor: Colors.border,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    color: Colors.text,
    backgroundColor: Colors.background,
    marginBottom: 16,
  },
  typeRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    marginBottom: 24,
  },
  typeChip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
  },
  typeChipText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    fontWeight: "600" as const,
  },
  saveButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    gap: 6,
    marginTop: 8,
  },
  saveButtonText: {
    fontFamily: "Nunito_700Bold",
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold" as const,
  },
});
