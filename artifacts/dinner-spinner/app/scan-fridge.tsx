import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import * as ImagePicker from "expo-image-picker";
import { router } from "expo-router";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Alert,
  Image,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useIngredients } from "@/context/IngredientsContext";

type Step = "capture" | "analyzing" | "review";

export default function ScanFridgeScreen() {
  const { addIngredient } = useIngredients();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const [step, setStep] = useState<Step>("capture");
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [detectedIngredients, setDetectedIngredients] = useState<string[]>([]);
  const [selectedIngredients, setSelectedIngredients] = useState<Set<string>>(new Set());
  const [error, setError] = useState<string | null>(null);

  const bgColor = isDark ? "#1C1C1E" : Colors.background;
  const textColor = isDark ? "#FFFFFF" : Colors.text;
  const subtextColor = isDark ? "#AEAEB2" : Colors.textSecondary;
  const cardBg = isDark ? "#2C2C2E" : Colors.surface;
  const borderColor = isDark ? "#3A3A3C" : Colors.border;

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  const analyzeImage = async (uri: string, base64: string, mimeType: string) => {
    setStep("analyzing");
    setError(null);

    try {
      const domain = process.env.EXPO_PUBLIC_DOMAIN;
      const baseUrl = domain ? `https://${domain}` : "";
      const response = await fetch(`${baseUrl}/api/analyze-fridge`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ imageBase64: base64, mimeType }),
      });

      if (!response.ok) {
        throw new Error("Analysis failed");
      }

      const data = await response.json();
      const ingredients: string[] = data.ingredients || [];

      setDetectedIngredients(ingredients);
      setSelectedIngredients(new Set(ingredients));
      setStep("review");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch (err) {
      setError("Could not analyze the image. Please try again.");
      setStep("capture");
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
    }
  };

  const pickImage = async (useCamera: boolean) => {
    try {
      let result: ImagePicker.ImagePickerResult;

      if (useCamera) {
        const { status } = await ImagePicker.requestCameraPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Camera Access", "Please allow camera access to take photos of your fridge.");
          return;
        }
        result = await ImagePicker.launchCameraAsync({
          mediaTypes: "images",
          quality: 0.6,
          base64: true,
          allowsEditing: false,
        });
      } else {
        const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
        if (status !== "granted") {
          Alert.alert("Gallery Access", "Please allow gallery access to pick a photo.");
          return;
        }
        result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: "images",
          quality: 0.6,
          base64: true,
          allowsEditing: false,
        });
      }

      if (!result.canceled && result.assets[0]) {
        const asset = result.assets[0];
        if (!asset.base64) {
          Alert.alert("Error", "Could not read image data.");
          return;
        }
        setImageUri(asset.uri);
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        const mimeType = asset.mimeType || "image/jpeg";
        await analyzeImage(asset.uri, asset.base64, mimeType);
      }
    } catch (err) {
      Alert.alert("Error", "Failed to open camera or gallery.");
    }
  };

  const toggleIngredient = (ingredient: string) => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setSelectedIngredients((prev) => {
      const next = new Set(prev);
      if (next.has(ingredient)) {
        next.delete(ingredient);
      } else {
        next.add(ingredient);
      }
      return next;
    });
  };

  const addSelected = () => {
    if (selectedIngredients.size === 0) {
      router.back();
      return;
    }
    selectedIngredients.forEach((ing) => addIngredient(ing));
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    router.back();
  };

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { paddingTop: topPad + 12 }]}>
        <Pressable
          onPress={() => {
            Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
            router.back();
          }}
          style={styles.closeBtn}
        >
          <Feather name="x" size={22} color={textColor} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: textColor }]}>Scan Fridge</Text>
        <View style={{ width: 40 }} />
      </View>

      {step === "capture" && (
        <View style={[styles.content, { paddingBottom: bottomPad + 24 }]}>
          <View style={[styles.previewBox, { backgroundColor: isDark ? "#2C2C2E" : Colors.backgroundDark, borderColor }]}>
            {imageUri ? (
              <Image source={{ uri: imageUri }} style={styles.previewImage} resizeMode="cover" />
            ) : (
              <View style={styles.previewPlaceholder}>
                <Feather name="camera" size={48} color={Colors.border} />
                <Text style={[styles.placeholderText, { color: subtextColor }]}>
                  Take a photo of your fridge or pantry
                </Text>
              </View>
            )}
          </View>

          {error && (
            <View style={[styles.errorBanner, { backgroundColor: Colors.accent + "22", borderColor: Colors.accent + "44" }]}>
              <Feather name="alert-circle" size={16} color={Colors.accent} />
              <Text style={[styles.errorText, { color: Colors.accent }]}>{error}</Text>
            </View>
          )}

          <Text style={[styles.hint, { color: subtextColor }]}>
            AI will detect ingredients from your photo
          </Text>

          <View style={styles.buttonRow}>
            <Pressable
              style={[styles.actionBtn, { backgroundColor: Colors.primary }]}
              onPress={() => pickImage(true)}
            >
              <Feather name="camera" size={20} color="#FFFFFF" />
              <Text style={styles.actionBtnText}>Camera</Text>
            </Pressable>

            <Pressable
              style={[styles.actionBtn, { backgroundColor: cardBg, borderColor, borderWidth: 1 }]}
              onPress={() => pickImage(false)}
            >
              <Feather name="image" size={20} color={textColor} />
              <Text style={[styles.actionBtnText, { color: textColor }]}>Gallery</Text>
            </Pressable>
          </View>
        </View>
      )}

      {step === "analyzing" && (
        <View style={styles.analyzingContainer}>
          {imageUri && (
            <Image source={{ uri: imageUri }} style={styles.analyzingImage} resizeMode="cover" />
          )}
          <View style={[styles.analyzingOverlay, { backgroundColor: isDark ? "rgba(28,28,30,0.85)" : "rgba(250,250,248,0.9)" }]}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.analyzingTitle, { color: textColor }]}>Analyzing...</Text>
            <Text style={[styles.analyzingSubtitle, { color: subtextColor }]}>
              AI is identifying ingredients in your photo
            </Text>
          </View>
        </View>
      )}

      {step === "review" && (
        <View style={[styles.reviewContainer, { paddingBottom: bottomPad + 24 }]}>
          <View style={styles.reviewHeader}>
            {imageUri && (
              <Image source={{ uri: imageUri }} style={styles.reviewThumb} />
            )}
            <View style={styles.reviewHeaderText}>
              <Text style={[styles.reviewTitle, { color: textColor }]}>
                {detectedIngredients.length} ingredients found
              </Text>
              <Text style={[styles.reviewSubtitle, { color: subtextColor }]}>
                Tap to deselect any you don't want
              </Text>
            </View>
          </View>

          <ScrollView
            style={styles.reviewScroll}
            showsVerticalScrollIndicator={false}
            contentContainerStyle={styles.reviewScrollContent}
          >
            {detectedIngredients.length === 0 ? (
              <View style={styles.emptyResult}>
                <Feather name="search" size={40} color={Colors.border} />
                <Text style={[styles.emptyResultText, { color: subtextColor }]}>
                  No ingredients detected. Try a clearer photo.
                </Text>
                <Pressable
                  style={[styles.retryBtn, { borderColor: Colors.primary }]}
                  onPress={() => {
                    setStep("capture");
                    setImageUri(null);
                  }}
                >
                  <Text style={[styles.retryBtnText, { color: Colors.primary }]}>Try Again</Text>
                </Pressable>
              </View>
            ) : (
              <View style={styles.ingredientGrid}>
                {detectedIngredients.map((ing) => {
                  const selected = selectedIngredients.has(ing);
                  return (
                    <Pressable
                      key={ing}
                      onPress={() => toggleIngredient(ing)}
                      style={[
                        styles.reviewChip,
                        {
                          backgroundColor: selected ? Colors.primary : cardBg,
                          borderColor: selected ? Colors.primary : borderColor,
                        },
                      ]}
                    >
                      <Text
                        style={[
                          styles.reviewChipText,
                          { color: selected ? "#FFFFFF" : textColor },
                        ]}
                      >
                        {ing}
                      </Text>
                      {selected && (
                        <Feather name="check" size={14} color="#FFFFFF" />
                      )}
                    </Pressable>
                  );
                })}
              </View>
            )}
          </ScrollView>

          <View style={styles.reviewFooter}>
            <Pressable
              style={[styles.scanAgainBtn, { borderColor: Colors.primary }]}
              onPress={() => {
                setStep("capture");
                setImageUri(null);
                setDetectedIngredients([]);
              }}
            >
              <Ionicons name="camera-outline" size={18} color={Colors.primary} />
              <Text style={[styles.scanAgainText, { color: Colors.primary }]}>Scan Again</Text>
            </Pressable>

            <Pressable
              style={[
                styles.addBtn,
                {
                  backgroundColor: selectedIngredients.size > 0 ? Colors.primary : Colors.border,
                },
              ]}
              onPress={addSelected}
              disabled={selectedIngredients.size === 0 && detectedIngredients.length > 0}
            >
              <Feather name="plus" size={18} color="#FFFFFF" />
              <Text style={styles.addBtnText}>
                Add {selectedIngredients.size > 0 ? `${selectedIngredients.size} ` : ""}Ingredients
              </Text>
            </Pressable>
          </View>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 20,
    paddingBottom: 12,
  },
  headerTitle: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
  },
  closeBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    gap: 20,
  },
  previewBox: {
    flex: 1,
    borderRadius: 20,
    borderWidth: 1.5,
    borderStyle: "dashed",
    overflow: "hidden",
    minHeight: 280,
  },
  previewImage: {
    flex: 1,
    width: "100%",
    height: "100%",
  },
  previewPlaceholder: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
    padding: 32,
  },
  placeholderText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
  errorBanner: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  errorText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
    flex: 1,
  },
  hint: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
  },
  buttonRow: {
    flexDirection: "row",
    gap: 12,
  },
  actionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  actionBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  analyzingContainer: {
    flex: 1,
    position: "relative",
  },
  analyzingImage: {
    flex: 1,
    width: "100%",
  },
  analyzingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  analyzingTitle: {
    fontSize: 22,
    fontFamily: "Inter_700Bold",
  },
  analyzingSubtitle: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 40,
  },
  reviewContainer: {
    flex: 1,
    paddingHorizontal: 20,
  },
  reviewHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
    marginBottom: 16,
  },
  reviewThumb: {
    width: 60,
    height: 60,
    borderRadius: 12,
    backgroundColor: Colors.backgroundDark,
  },
  reviewHeaderText: {
    flex: 1,
    gap: 4,
  },
  reviewTitle: {
    fontSize: 18,
    fontFamily: "Inter_700Bold",
  },
  reviewSubtitle: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  reviewScroll: {
    flex: 1,
  },
  reviewScrollContent: {
    paddingBottom: 12,
  },
  emptyResult: {
    alignItems: "center",
    paddingVertical: 48,
    gap: 12,
  },
  emptyResultText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    paddingHorizontal: 24,
  },
  retryBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    marginTop: 8,
  },
  retryBtnText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  ingredientGrid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 10,
  },
  reviewChip: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 24,
    borderWidth: 1.5,
  },
  reviewChipText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  reviewFooter: {
    flexDirection: "row",
    gap: 12,
    paddingTop: 16,
  },
  scanAgainBtn: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 16,
    borderWidth: 1.5,
  },
  scanAgainText: {
    fontSize: 15,
    fontFamily: "Inter_600SemiBold",
  },
  addBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
  },
  addBtnText: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
});
