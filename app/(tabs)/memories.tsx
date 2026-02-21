import { useState } from "react";
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

  const topInset = Platform.OS === "web" ? 67 : insets.top;
  const bottomInset = Platform.OS === "web" ? 34 : insets.bottom;

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
    return (
      <Pressable
        style={styles.card}
        onLongPress={() => handleDeleteMemory(item)}
      >
        {item.photoUri && (
          <Image
            source={{ uri: item.photoUri }}
            style={styles.cardPhoto}
            contentFit="cover"
          />
        )}
        <View style={styles.cardContent}>
          <View style={styles.cardHeader}>
            <Text style={styles.cardDate}>{formatDateVN(item.date)}</Text>
            {moodInfo && (
              <View style={[styles.moodDot, { backgroundColor: moodInfo.color }]}>
                <Ionicons name={moodInfo.icon} size={12} color="#FFF" />
              </View>
            )}
          </View>
          <Text style={styles.cardTitle}>{item.title}</Text>
          {item.content ? (
            <Text style={styles.cardText} numberOfLines={3}>
              {item.content}
            </Text>
          ) : null}
        </View>
      </Pressable>
    );
  };

  const renderEmptyState = () => (
    <View style={styles.emptyContainer}>
      <Ionicons name="book-outline" size={64} color={Colors.textSecondary} />
      <Text style={styles.emptyTitle}>Chưa có kỷ niệm nào</Text>
      <Text style={styles.emptySubtitle}>Hãy thêm kỷ niệm đầu tiên của bạn</Text>
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
        <Text style={styles.headerTitle}>Nhật Ký Tình Yêu</Text>
      </LinearGradient>

      <FlatList
        data={memories}
        keyExtractor={(item) => item.id}
        renderItem={renderMemoryCard}
        contentContainerStyle={[
          styles.listContent,
          { paddingBottom: bottomInset + 80 },
        ]}
        ListEmptyComponent={renderEmptyState}
        scrollEnabled={!!memories && memories.length > 0}
        showsVerticalScrollIndicator={false}
      />

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
    fontFamily: "Nunito_700Bold",
    fontSize: 26,
    fontWeight: "bold" as const,
    color: "#FFF",
    textAlign: "center",
  },
  listContent: {
    padding: 16,
  },
  card: {
    backgroundColor: Colors.card,
    borderRadius: 16,
    marginBottom: 16,
    overflow: "hidden",
    ...Platform.select({
      ios: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 4,
      },
      web: {
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
    }),
  },
  cardPhoto: {
    width: "100%",
    height: 180,
  },
  cardContent: {
    padding: 16,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 6,
  },
  cardDate: {
    fontFamily: "Nunito_400Regular",
    fontSize: 13,
    color: Colors.textSecondary,
  },
  moodDot: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
  },
  cardTitle: {
    fontFamily: "Nunito_700Bold",
    fontSize: 18,
    fontWeight: "bold" as const,
    color: Colors.text,
    marginBottom: 6,
  },
  cardText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 14,
    color: Colors.textSecondary,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
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
    justifyContent: "center",
    alignItems: "center",
    padding: 32,
  },
  noCoupleText: {
    fontFamily: "Nunito_400Regular",
    fontSize: 18,
    color: Colors.textSecondary,
    marginTop: 16,
    textAlign: "center",
  },
  fab: {
    position: "absolute",
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: Colors.primary,
    justifyContent: "center",
    alignItems: "center",
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
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
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
    position: "absolute",
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
    textAlignVertical: "top",
  },
  moodRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  moodChip: {
    flexDirection: "row",
    alignItems: "center",
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
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: Colors.primary,
    borderRadius: 12,
    borderStyle: "dashed",
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
    overflow: "hidden",
    position: "relative",
  },
  photoPreview: {
    width: "100%",
    height: 200,
    borderRadius: 12,
  },
  removePhoto: {
    position: "absolute",
    top: 8,
    right: 8,
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonText: {
    fontFamily: "Nunito_700Bold",
    color: "#FFF",
    fontSize: 16,
    fontWeight: "bold" as const,
  },
});
