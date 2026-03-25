import { Feather, Ionicons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useRef, useState } from "react";
import {
  Alert,
  FlatList,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  TextInput,
  View,
  useColorScheme,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useIngredients } from "@/context/IngredientsContext";

const SUGGESTED = [
  "Chicken", "Beef", "Pasta", "Rice", "Salmon",
  "Eggs", "Tomato", "Garlic", "Onion", "Potato",
  "Mushroom", "Cheese", "Spinach", "Shrimp", "Tofu",
  "Broccoli", "Lemon", "Ginger", "Carrot", "Butter",
];

function IngredientChip({
  label,
  onRemove,
  color,
}: {
  label: string;
  onRemove: () => void;
  color?: string;
}) {
  const isDark = useColorScheme() === "dark";
  return (
    <View
      style={[
        styles.chip,
        {
          backgroundColor: color
            ? color + "22"
            : isDark
            ? "#3A3A3C"
            : Colors.backgroundDark,
          borderColor: color ? color + "44" : Colors.border,
        },
      ]}
    >
      <Text
        style={[
          styles.chipText,
          { color: color || (isDark ? "#FFFFFF" : Colors.text) },
        ]}
      >
        {label}
      </Text>
      <Pressable
        onPress={() => {
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          onRemove();
        }}
        hitSlop={8}
      >
        <Feather
          name="x"
          size={14}
          color={color ? color : isDark ? "#AEAEB2" : Colors.textSecondary}
        />
      </Pressable>
    </View>
  );
}

function SuggestedChip({
  label,
  onAdd,
  disabled,
}: {
  label: string;
  onAdd: () => void;
  disabled: boolean;
}) {
  const isDark = useColorScheme() === "dark";
  return (
    <Pressable
      onPress={() => {
        if (disabled) return;
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        onAdd();
      }}
      style={[
        styles.suggestChip,
        {
          backgroundColor: disabled
            ? isDark
              ? "#2C2C2E"
              : Colors.surfaceDark
            : isDark
            ? "#3A3A3C"
            : Colors.surface,
          borderColor: disabled ? Colors.border : Colors.primary + "44",
          opacity: disabled ? 0.5 : 1,
        },
      ]}
    >
      {!disabled && (
        <Feather name="plus" size={12} color={Colors.primary} />
      )}
      <Text
        style={[
          styles.suggestChipText,
          { color: disabled ? Colors.textLight : Colors.primary },
        ]}
      >
        {label}
      </Text>
    </Pressable>
  );
}

export default function IngredientsScreen() {
  const { ingredients, addIngredient, removeIngredient, clearIngredients } =
    useIngredients();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const [inputText, setInputText] = useState("");
  const inputRef = useRef<TextInput>(null);

  const bgColor = isDark ? "#1C1C1E" : Colors.background;
  const textColor = isDark ? "#FFFFFF" : Colors.text;
  const subtextColor = isDark ? "#AEAEB2" : Colors.textSecondary;
  const inputBg = isDark ? "#2C2C2E" : Colors.surface;
  const inputBorder = isDark ? "#3A3A3C" : Colors.border;

  const topPad = Platform.OS === "web" ? 16 : insets.top;
  const bottomPad = Platform.OS === "web" ? 84 : insets.bottom + 84;

  const handleAdd = () => {
    const val = inputText.trim();
    if (!val) return;
    addIngredient(val);
    setInputText("");
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
  };

  const handleClear = () => {
    if (ingredients.length === 0) return;
    Alert.alert("Clear All", "Remove all ingredients?", [
      { text: "Cancel", style: "cancel" },
      {
        text: "Clear",
        style: "destructive",
        onPress: () => {
          clearIngredients();
          Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
        },
      },
    ]);
  };

  const chipColors = Colors.spinnerColors;

  return (
    <KeyboardAvoidingView
      style={[styles.container, { backgroundColor: bgColor }]}
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      keyboardVerticalOffset={0}
    >
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <View>
          <Text style={[styles.title, { color: textColor }]}>Ingredients</Text>
          <Text style={[styles.subtitle, { color: subtextColor }]}>
            {ingredients.length > 0
              ? `${ingredients.length} added`
              : "Add what's in your fridge"}
          </Text>
        </View>
        <View style={styles.headerActions}>
          <Pressable
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
              router.push("/scan-fridge");
            }}
            style={[styles.scanBtn, { backgroundColor: Colors.primary + "18", borderColor: Colors.primary + "44" }]}
          >
            <Feather name="camera" size={18} color={Colors.primary} />
            <Text style={[styles.scanBtnText, { color: Colors.primary }]}>Scan</Text>
          </Pressable>
          {ingredients.length > 0 && (
            <Pressable onPress={handleClear} style={styles.clearBtn}>
              <Feather name="trash-2" size={20} color={Colors.accent} />
            </Pressable>
          )}
        </View>
      </View>

      <View
        style={[
          styles.inputContainer,
          { backgroundColor: inputBg, borderColor: inputBorder },
        ]}
      >
        <Ionicons name="search" size={18} color={subtextColor} />
        <TextInput
          ref={inputRef}
          style={[styles.input, { color: textColor }]}
          placeholder="Add an ingredient..."
          placeholderTextColor={subtextColor}
          value={inputText}
          onChangeText={setInputText}
          onSubmitEditing={handleAdd}
          returnKeyType="done"
          autoCapitalize="words"
          autoCorrect={false}
          accessibilityLabel="Ingredient input"
        />
        {inputText.length > 0 && (
          <Pressable
            style={[styles.addBtn, { backgroundColor: Colors.primary }]}
            onPress={handleAdd}
          >
            <Feather name="plus" size={18} color="#FFFFFF" />
          </Pressable>
        )}
      </View>

      <FlatList
        data={[0]}
        keyExtractor={() => "main"}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad }}
        keyboardShouldPersistTaps="handled"
        scrollEnabled
        renderItem={() => (
          <View>
            {ingredients.length > 0 && (
              <View style={styles.section}>
                <Text style={[styles.sectionTitle, { color: subtextColor }]}>
                  YOUR INGREDIENTS
                </Text>
                <View style={styles.chipsRow}>
                  {ingredients.map((ing, i) => (
                    <IngredientChip
                      key={ing}
                      label={ing}
                      color={chipColors[i % chipColors.length]}
                      onRemove={() => removeIngredient(ing)}
                    />
                  ))}
                </View>
              </View>
            )}

            {ingredients.length === 0 && (
              <View style={styles.emptyState}>
                <Feather name="shopping-bag" size={48} color={Colors.border} />
                <Text style={[styles.emptyTitle, { color: textColor }]}>
                  No ingredients yet
                </Text>
                <Text style={[styles.emptyText, { color: subtextColor }]}>
                  Add ingredients from your fridge and we'll find matching recipes
                </Text>
              </View>
            )}

            <View style={styles.section}>
              <Text style={[styles.sectionTitle, { color: subtextColor }]}>
                SUGGESTIONS
              </Text>
              <View style={styles.chipsRow}>
                {SUGGESTED.map((s) => (
                  <SuggestedChip
                    key={s}
                    label={s}
                    disabled={ingredients.includes(s)}
                    onAdd={() => addIngredient(s)}
                  />
                ))}
              </View>
            </View>
          </View>
        )}
      />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: "row",
    alignItems: "flex-start",
    justifyContent: "space-between",
    paddingHorizontal: 24,
    paddingBottom: 16,
  },
  title: {
    fontSize: 28,
    fontFamily: "Inter_700Bold",
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    marginTop: 2,
  },
  headerActions: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginTop: 4,
  },
  scanBtn: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  scanBtnText: {
    fontSize: 14,
    fontFamily: "Inter_600SemiBold",
  },
  clearBtn: {
    width: 40,
    height: 40,
    alignItems: "center",
    justifyContent: "center",
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 16,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderRadius: 14,
    borderWidth: 1,
    gap: 10,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: "Inter_400Regular",
  },
  addBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
  },
  section: {
    paddingHorizontal: 24,
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Inter_600SemiBold",
    letterSpacing: 1,
    marginBottom: 12,
  },
  chipsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  chip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 6,
  },
  chipText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  suggestChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
    borderWidth: 1,
    gap: 4,
  },
  suggestChipText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  emptyState: {
    alignItems: "center",
    paddingVertical: 48,
    paddingHorizontal: 40,
    gap: 12,
  },
  emptyTitle: {
    fontSize: 20,
    fontFamily: "Inter_600SemiBold",
    marginTop: 4,
  },
  emptyText: {
    fontSize: 14,
    fontFamily: "Inter_400Regular",
    textAlign: "center",
    lineHeight: 22,
  },
});
