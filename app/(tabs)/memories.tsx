import { useState, useMemo } from "react";
import {
  View,
  Text,
  StyleSheet,
  Platform,
  Modal,
  TextInput,
  FlatList,
  Pressable,
  Alert,
  ScrollView,
  KeyboardAvoidingView,
  Dimensions,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { format, parseISO } from "date-fns";
import { vi } from "date-fns/locale/vi";
import * as ImagePicker from "expo-image-picker";
import { Image } from "expo-image";

import { useLove } from "@/lib/love-context";
import Colors from "@/constants/colors";
import type { Memory } from "@shared/schema";

const MOODS = [
  { label: "Vui", color: "#4CAF50", icon: "happy-outline" as const },
  { label: "Hạnh phúc", color: "#FF9800", icon: "heart-outline" as const },
  { label: "Lãng mạn", color: Colors.primary, icon: "rose-outline" as const },
  { label: "Nhớ nhung", color: "#9C27B0", icon: "moon-outline" as const },
  { label: "Xúc động", color: "#2196F3", icon: "water-outline" as const },
];

type ViewMode = "list" | "grid";

const SCREEN_WIDTH = Dimensions.get("window").width;
const GRID_GAP = 12;
const GRID_PADDING = 16;
const GRID_ITEM_WIDTH = (SCREEN_WIDTH - GRID_PADDING * 2 - GRID_GAP) / 2;

function getMoodInfo(mood: string | null) {
  return MOODS.find((m) => m.label === mood) ?? null;
}

function formatDateVN(dateStr: string): string {
  try {
    const date = parseISO(dateStr);
    return format(date, "d 'tháng' M, yyyy", { locale: vi });
  } catch {
    return dateStr;
  }
}

export default function MemoriesScreen() {
  const insets = useSafeAreaInsets();
  const { couple, memories, addMemory, deleteMemory } = useLove();

  const [modalVisible, setModalVisible] = useState(false);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [dateText, setDateText] = useState("");
  const [selectedMood, setSelectedMood] = useState<string | null>(null);
  const [photoUri, setPhotoUri] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [searchQuery, setSearchQuery] = useState("");

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

  const filteredMemories = useMemo(() => {
    if (!searchQuery.trim()) return memories;
    const q = searchQuery.toLowerCase().trim();
    return memories.filter((m) => m.title.toLowerCase().includes(q));
  }, [memories, searchQuery]);

  const photoMemories = useMemo(() => {
    return filteredMemories.filter((m) => !!m.photoUri);
  }, [filteredMemories]);

  const resetForm = () => {
    setTitle("");
    setContent("");
    setDateText("");
    setSelectedMood(null);
    setPhotoUri(null);
  };

  const handleOpenModal = () => {
    resetForm();
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    resetForm();
  };

  const handlePickImage = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      allowsEditing: true,
      quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      setPhotoUri(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!title.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tiêu đề");
      return;
    }
    if (!dateText.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập ngày");
      return;
    }

    const parts = dateText.split("/");
    if (parts.length !== 3) {
      Alert.alert("Lỗi", "Ngày không hợp lệ. Vui lòng nhập theo định dạng DD/MM/YYYY");
      return;
    }
    const isoDate = `${parts[2]}-${parts[1].padStart(2, "0")}-${parts[0].padStart(2, "0")}`;

    try {
      await addMemory({
        coupleId: couple!.id,
        title: title.trim(),
        content: content.trim() || null,
        date: isoDate,
        mood: selectedMood,
        photoUri: photoUri,
      });
      handleCloseModal();
    } catch {
      Alert.alert("Lỗi", "Không thể lưu kỷ niệm. Vui lòng thử lại.");
    }
  };

  const handleDeleteMemory = (memory: Memory) => {
    Alert.alert(
      "Xóa kỷ niệm",
      `Bạn có chắc muốn xóa "${memory.title}" không?`,
      [
        { text: "Hủy", style: "cancel" },
        {
          text: "Xóa",
          style: "destructive",
          onPress: () => deleteMemory(memory.id),
        },
      ]
    );
  };

  if (!couple) {
    return (
      <View style={[styles.container, { paddingTop: topInset }]} testID="memories-screen">
        <View style={styles.noCoupleContainer}>
          <Ionicons name="heart-dislike-outline" size={64} color={Colors.textSecondary} />
          <Text style={styles.noCoupleText}>
            Hãy thiết lập thông tin cặp đôi trước
          </Text>
        </View>
      </View>
    );
  }

  const renderMemoryCard = ({ item }: { item: Memory }) => {
    const moodInfo = getMoodInfo(item.mood ?? null);
    const borderColor = moodInfo ? moodInfo.color : Colors.primary;
    return (
      <Pressable
        style={[styles.card, { borderLeftWidth: 4, borderLeftColor: borderColor }]}
        onLongPress={() => handleDeleteMemory(item)}
      >
        <View style={styles.cardBody}>
          <View style={styles.cardMainContent}>
            <View style={styles.cardDateRow}>
              <Ionicons name="calendar-outline" size={14} color={Colors.textSecondary} />
              <Text style={styles.cardDate}>{formatDateVN(item.date)}</Text>
            </View>
            <Text style={styles.cardTitle}>{item.title}</Text>
            {item.content ? (
              <Text style={styles.cardText} numberOfLines={2}>
                {item.content}
              </Text>
            ) : null}
            {moodInfo && (
              <View style={[styles.moodBadge, { backgroundColor: moodInfo.color + "18", borderColor: moodInfo.color }]}>
                <Ionicons name={moodInfo.icon} size={13} color={moodInfo.color} />
                <Text style={[styles.moodBadgeText, { color: moodInfo.color }]}>{moodInfo.label}</Text>
              </View>
            )}
          </View>
          {item.photoUri && (
            <Image
              source={{ uri: item.photoUri }}
              style={styles.cardThumbnail}
              contentFit="cover"
            />
          )}
        </View>
      </Pressable>
    );
  };

  const renderGridItem = ({ item }: { item: Memory }) => (
    <Pressable
      style={styles.gridItem}
      onLongPress={() => handleDeleteMemory(item)}
    >
      <Image
        source={{ uri: item.photoUri! }}
        style={styles.gridImage}
        contentFit="cover"
      />
      <LinearGradient
        colors={["transparent", "rgba(0,0,0,0.7)"]}
        style={styles.gridOverlay}
      >
        <Text style={styles.gridTitle} numberOfLines={2}>{item.title}</Text>
      </LinearGradient>
    </Pressable>
  );

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={64} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>Chưa có kỷ niệm nào</Text>
      <Text style={styles.emptySubtitle}>Hãy thêm kỷ niệm đầu tiên của bạn</Text>
    </View>
  );

  const renderPhotoEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="camera-outline" size={64} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>Chưa có ảnh nào</Text>
      <Text style={styles.emptySubtitle}>Thêm ảnh vào kỷ niệm để xem ở đây</Text>
    </View>
  );

  const ListHeader = () => (
    <View>
      <View style={styles.tabRow}>
        <Pressable
          style={[styles.tab, viewMode === "list" && styles.tabActive]}
          onPress={() => setViewMode("list")}
        >
          <Ionicons
            name="list-outline"
            size={16}
            color={viewMode === "list" ? "#FFF" : Colors.primary}
          />
          <Text style={[styles.tabText, viewMode === "list" && styles.tabTextActive]}>
            Danh sách
          </Text>
        </Pressable>
        <Pressable
          style={[styles.tab, viewMode === "grid" && styles.tabActive]}
          onPress={() => setViewMode("grid")}
        >
          <Ionicons
            name="images-outline"
            size={16}
            color={viewMode === "grid" ? "#FFF" : Colors.primary}
          />
          <Text style={[styles.tabText, viewMode === "grid" && styles.tabTextActive]}>
            Bộ sưu tập ảnh
          </Text>
        </Pressable>
      </View>

      <View style={styles.searchContainer}>
        <Ionicons name="search-outline" size={18} color={Colors.textSecondary} />
        <TextInput
          style={styles.searchInput}
          placeholder="Tìm kiếm kỷ niệm..."
          placeholderTextColor={Colors.textSecondary}
          value={searchQuery}
          onChangeText={setSearchQuery}
        />
        {searchQuery.length > 0 && (
          <Pressable onPress={() => setSearchQuery("")}>
            <Ionicons name="close-circle" size={18} color={Colors.textSecondary} />
          </Pressable>
        )}
      </View>
    </View>
  );

  return (
    <View style={styles.container} testID="memories-screen">
      <LinearGradient
        colors={[Colors.primary, Colors.primaryLight]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[styles.header, { paddingTop: topInset + 16 }]}
      >
        <Text style={styles.headerTitle}>
          Nhật Ký Tình Yêu ({memories.length})
        </Text>
      </LinearGradient>

      {viewMode === "list" ? (
        <FlatList
          data={filteredMemories}
          keyExtractor={(item) => item.id}
          renderItem={renderMemoryCard}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomInset + 80 },
          ]}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={renderEmptyState}
          scrollEnabled={!!filteredMemories && filteredMemories.length > 0}
          showsVerticalScrollIndicator={false}
        />
      ) : (
        <FlatList
          data={photoMemories}
          keyExtractor={(item) => item.id}
          renderItem={renderGridItem}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={[
            styles.listContent,
            { paddingBottom: bottomInset + 80 },
          ]}
          ListHeaderComponent={ListHeader}
          ListEmptyComponent={renderPhotoEmptyState}
          scrollEnabled={photoMemories.length > 0}
          showsVerticalScrollIndicator={false}
        />
      )}

      <Pressable
        style={[styles.fab, { bottom: bottomInset + 24 }]}
        onPress={handleOpenModal}
      >
        <Ionicons name="add" size={28} color="#FFF" />
      </Pressable>

      <Modal
        visible={modalVisible}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={handleCloseModal}
      >
        <KeyboardAvoidingView
          style={styles.modalContainer}
          behavior={Platform.OS === "ios" ? "padding" : "height"}
        >
          <View style={[styles.modalHeader, { paddingTop: Platform.OS === "web" ? 67 : insets.top + 8 }]}>
            <Text style={styles.modalTitle}>Thêm kỷ niệm</Text>
            <Pressable onPress={handleCloseModal} style={styles.closeButton}>
              <Ionicons name="close" size={28} color={Colors.text} />
            </Pressable>
          </View>

          <ScrollView
            style={styles.modalBody}
            contentContainerStyle={{ paddingBottom: bottomInset + 24 }}
            keyboardShouldPersistTaps="handled"
          >
            <Text style={styles.inputLabel}>Tiêu đề</Text>
            <TextInput
              style={styles.input}
              value={title}
              onChangeText={setTitle}
              placeholder="Nhập tiêu đề kỷ niệm..."
              placeholderTextColor={Colors.textSecondary}
            />

            <Text style={styles.inputLabel}>Nội dung</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              value={content}
              onChangeText={setContent}
              placeholder="Viết về kỷ niệm của bạn..."
              placeholderTextColor={Colors.textSecondary}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />

            <Text style={styles.inputLabel}>Ngày</Text>
            <TextInput
              style={styles.input}
              value={dateText}
              onChangeText={setDateText}
              placeholder="DD/MM/YYYY"
              placeholderTextColor={Colors.textSecondary}
              keyboardType="numeric"
            />

            <Text style={styles.inputLabel}>Tâm trạng</Text>
            <View style={styles.moodRow}>
              {MOODS.map((mood) => (
                <Pressable
                  key={mood.label}
                  style={[
                    styles.moodChip,
                    {
                      backgroundColor:
                        selectedMood === mood.label ? mood.color : Colors.background,
                      borderColor: mood.color,
                    },
                  ]}
                  onPress={() =>
                    setSelectedMood(selectedMood === mood.label ? null : mood.label)
                  }
                >
                  <Ionicons
                    name={mood.icon}
                    size={14}
                    color={selectedMood === mood.label ? "#FFF" : mood.color}
                  />
                  <Text
                    style={[
                      styles.moodChipText,
                      {
                        color: selectedMood === mood.label ? "#FFF" : mood.color,
                      },
                    ]}
                  >
                    {mood.label}
                  </Text>
                </Pressable>
              ))}
            </View>

            <Pressable style={styles.photoButton} onPress={handlePickImage}>
              <Ionicons name="image-outline" size={20} color={Colors.primary} />
              <Text style={styles.photoButtonText}>Chọn ảnh</Text>
            </Pressable>

            {photoUri && (
              <View style={styles.photoPreviewContainer}>
                <Image
                  source={{ uri: photoUri }}
                  style={styles.photoPreview}
                  contentFit="cover"
                />
                <Pressable
                  style={styles.removePhoto}
                  onPress={() => setPhotoUri(null)}
                >
                  <Ionicons name="close-circle" size={24} color={Colors.heart} />
                </Pressable>
              </View>
            )}

            <Pressable style={styles.saveButton} onPress={handleSave}>
              <Text style={styles.saveButtonText}>Lưu kỷ niệm</Text>
            </Pressable>
          </ScrollView>
        </KeyboardAvoidingView>
      </Modal>
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
    fontFamily: "Nunito_800ExtraBold",
    fontSize: 26,
    fontWeight: "800" as const,
    color: "#FFF",
    textAlign: "center",
  },
  tabRow: {
    flexDirection: "row" as const,
    gap: 10,
    marginBottom: 12,
  },
  tab: {
    flex: 1,
    flexDirection: "row" as const,
    alignItems: "center" as const,
    justifyContent: "center" as const,
    paddingVertical: 10,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: Colors.primary,
    gap: 6,
    backgroundColor: "transparent",
  },
  tabActive: {
    backgroundColor: Colors.primary,
    borderColor: Colors.primary,
  },
  tabText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 14,
    fontWeight: "600" as const,
    color: Colors.primary,
  },
  tabTextActive: {
    color: "#FFF",
  },
  searchContainer: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    backgroundColor: Colors.card,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.border,
    paddingHorizontal: 12,
    marginBottom: 16,
    height: 44,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: Colors.text,
    height: 44,
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 14,
    marginBottom: 14,
    overflow: "hidden" as const,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
      android: {
        elevation: 3,
      },
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.08,
        shadowRadius: 8,
      },
    }),
  },
  cardBody: {
    flexDirection: "row" as const,
    padding: 14,
    gap: 12,
  },
  cardMainContent: {
    flex: 1,
    gap: 4,
  },
  cardDateRow: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 5,
    marginBottom: 2,
  },
  cardDate: {
    fontFamily: "Nunito_400Regular",
    fontSize: 12,
    color: Colors.textSecondary,
  },
  cardTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 16,
    fontWeight: "bold" as const,
    color: Colors.text,
    marginBottom: 2,
  },
  cardText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 19,
  },
  moodBadge: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    alignSelf: "flex-start" as const,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
    gap: 4,
    marginTop: 4,
  },
  moodBadgeText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 11,
    fontWeight: "600" as const,
  },
  cardThumbnail: {
    width: 60,
    height: 60,
    borderRadius: 10,
  },
  gridRow: {
    justifyContent: "space-between" as const,
    marginBottom: GRID_GAP,
  },
  gridItem: {
    width: GRID_ITEM_WIDTH,
    height: GRID_ITEM_WIDTH,
    borderRadius: 14,
    overflow: "hidden" as const,
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 6,
      },
    }),
  },
  gridImage: {
    width: "100%",
    height: "100%",
  },
  gridOverlay: {
    position: "absolute" as const,
    bottom: 0,
    left: 0,
    right: 0,
    paddingHorizontal: 10,
    paddingBottom: 10,
    paddingTop: 30,
  },
  gridTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 13,
    fontWeight: "bold" as const,
    color: "#FFF",
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    paddingTop: 80,
  },
  emptyTitle: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 20,
    fontWeight: "600" as const,
    color: Colors.text,
    marginTop: 16,
  },
  emptySubtitle: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    marginTop: 8,
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
  fab: {
    position: "absolute" as const,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center" as const,
    alignItems: "center" as const,
    ...Platform.select({
      ios: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
      android: {
        elevation: 8,
      },
      web: {
        shadowColor: Colors.primary,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.4,
        shadowRadius: 8,
      },
    }),
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "#FFF",
  },
  modalHeader: {
    flexDirection: "row" as const,
    justifyContent: "center" as const,
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
  closeButton: {
    position: "absolute" as const,
    right: 16,
    top: Platform.OS === "web" ? 67 : undefined,
    bottom: 8,
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
  textArea: {
    height: 100,
    textAlignVertical: "top" as const,
  },
  moodRow: {
    flexDirection: "row" as const,
    flexWrap: "wrap" as const,
    gap: 8,
    marginBottom: 20,
  },
  moodChip: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1.5,
    gap: 4,
  },
  moodChipText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 13,
    fontWeight: "600" as const,
  },
  photoButton: {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    borderStyle: "dashed" as const,
    marginBottom: 16,
  },
  photoButtonText: {
    fontFamily: "Nunito_600SemiBold",
    fontSize: 15,
    color: Colors.primary,
    fontWeight: "500" as const,
  },
  photoPreviewContainer: {
    marginBottom: 20,
    borderRadius: 12,
    overflow: "hidden" as const,
    position: "relative" as const,
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removePhoto: {
    position: "absolute" as const,
    top: 8,
    right: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center" as const,
    marginTop: 8,
  },
  saveButtonText: {
    fontFamily: "Nunito_700Bold",
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold" as const,
  },
});
