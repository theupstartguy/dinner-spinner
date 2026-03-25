import { Feather, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router } from "expo-router";
import React, { useCallback, useRef, useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Platform,
  Pressable,
  StyleSheet,
  Text,
  View,
  useColorScheme,
} from "react-native";
import Animated, {
  Easing,
  runOnJS,
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from "react-native-reanimated";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import Colors from "@/constants/colors";
import { useIngredients } from "@/context/IngredientsContext";
import { MealSummary, getMealsByIngredients } from "@/services/mealdb";

const { width } = Dimensions.get("window");
const WHEEL_SIZE = Math.min(width * 0.8, 320);

function SpinnerWheel({
  meals,
  spinning,
}: {
  meals: MealSummary[];
  spinning: boolean;
}) {
  const isDark = useColorScheme() === "dark";
  const segments = meals.length > 0 ? meals.slice(0, 8) : Array(8).fill(null);
  const count = segments.length;
  const anglePerSegment = 360 / count;

  return (
    <View style={styles.wheelContainer}>
      <View
        style={[
          styles.wheel,
          {
            width: WHEEL_SIZE,
            height: WHEEL_SIZE,
            borderRadius: WHEEL_SIZE / 2,
            backgroundColor: isDark ? "#2C2C2E" : Colors.backgroundDark,
          },
        ]}
      >
        {segments.map((meal, i) => {
          const angle = i * anglePerSegment;
          const midAngle = (angle + anglePerSegment / 2) * (Math.PI / 180);
          const r = WHEEL_SIZE * 0.3;
          const tx = r * Math.cos(midAngle - Math.PI / 2);
          const ty = r * Math.sin(midAngle - Math.PI / 2);
          const color = Colors.spinnerColors[i % Colors.spinnerColors.length];

          return (
            <View
              key={i}
              style={[
                styles.segment,
                {
                  width: WHEEL_SIZE,
                  height: WHEEL_SIZE,
                  borderRadius: WHEEL_SIZE / 2,
                  transform: [{ rotate: `${angle}deg` }],
                  overflow: "hidden",
                },
              ]}
            >
              <View
                style={[
                  styles.segmentHalf,
                  {
                    width: WHEEL_SIZE / 2,
                    height: WHEEL_SIZE,
                    backgroundColor: color + "CC",
                  },
                ]}
              />
            </View>
          );
        })}
        <View style={styles.wheelCenter}>
          <View
            style={[
              styles.centerCircle,
              { backgroundColor: isDark ? "#3A3A3C" : "#FFFFFF" },
            ]}
          >
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={32}
              color={Colors.primary}
            />
          </View>
        </View>
      </View>
      <View style={[styles.pointer, { borderBottomColor: Colors.primary }]} />
    </View>
  );
}

export default function SpinnerScreen() {
  const { ingredients } = useIngredients();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";

  const rotation = useSharedValue(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [meals, setMeals] = useState<MealSummary[]>([]);
  const [selectedMeal, setSelectedMeal] = useState<MealSummary | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  const mealsRef = useRef<MealSummary[]>([]);

  const loadMeals = useCallback(async () => {
    setIsLoading(true);
    try {
      const result = await getMealsByIngredients(ingredients);
      const shuffled = result.sort(() => Math.random() - 0.5).slice(0, 8);
      setMeals(shuffled);
      mealsRef.current = shuffled;
      setHasLoaded(true);
    } finally {
      setIsLoading(false);
    }
  }, [ingredients]);

  React.useEffect(() => {
    loadMeals();
  }, [loadMeals]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ rotate: `${rotation.value}deg` }],
  }));

  const spin = useCallback(() => {
    if (isSpinning || isLoading || meals.length === 0) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    setIsSpinning(true);
    setSelectedMeal(null);

    const extraSpins = 5 + Math.floor(Math.random() * 5);
    const randomAngle = Math.random() * 360;
    const totalRotation = extraSpins * 360 + randomAngle;

    rotation.value = withTiming(
      rotation.value + totalRotation,
      { duration: 3500, easing: Easing.out(Easing.cubic) },
      (finished) => {
        if (finished) {
          runOnJS(onSpinComplete)(totalRotation, randomAngle);
        }
      }
    );
  }, [isSpinning, isLoading, meals, rotation]);

  const onSpinComplete = useCallback(
    (totalRotation: number, randomAngle: number) => {
      const currentMeals = mealsRef.current;
      if (currentMeals.length === 0) {
        setIsSpinning(false);
        return;
      }
      const anglePerSegment = 360 / currentMeals.length;
      const normalizedAngle = ((randomAngle % 360) + 360) % 360;
      const segmentIndex =
        Math.floor(normalizedAngle / anglePerSegment) % currentMeals.length;
      const meal =
        currentMeals[currentMeals.length - 1 - segmentIndex] ||
        currentMeals[0];
      setSelectedMeal(meal);
      setIsSpinning(false);
      Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    },
    []
  );

  const bgColor = isDark ? "#1C1C1E" : Colors.background;
  const textColor = isDark ? "#FFFFFF" : Colors.text;
  const subtextColor = isDark ? "#AEAEB2" : Colors.textSecondary;

  const topPad = Platform.OS === "web" ? 67 : insets.top;

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <View style={[styles.header, { paddingTop: topPad + 16 }]}>
        <Text style={[styles.title, { color: textColor }]}>Dinner Spinner</Text>
        <Text style={[styles.subtitle, { color: subtextColor }]}>
          {ingredients.length > 0
            ? `Based on ${ingredients.length} ingredient${ingredients.length !== 1 ? "s" : ""}`
            : "Spin for a random meal"}
        </Text>
      </View>

      <View style={styles.wheelArea}>
        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color={Colors.primary} />
            <Text style={[styles.loadingText, { color: subtextColor }]}>
              Finding meals...
            </Text>
          </View>
        ) : (
          <Animated.View style={animatedStyle}>
            <SpinnerWheel meals={meals} spinning={isSpinning} />
          </Animated.View>
        )}
      </View>

      {selectedMeal && !isSpinning && (
        <Pressable
          style={[
            styles.resultCard,
            { backgroundColor: isDark ? "#2C2C2E" : Colors.surface },
          ]}
          onPress={() => router.push(`/recipe/${selectedMeal.idMeal}`)}
        >
          <Image
            source={{ uri: selectedMeal.strMealThumb }}
            style={styles.mealThumb}
          />
          <View style={styles.mealInfo}>
            <Text style={[styles.mealName, { color: textColor }]} numberOfLines={1}>
              {selectedMeal.strMeal}
            </Text>
            <Text style={[styles.tapHint, { color: Colors.primary }]}>
              Tap to see recipe
            </Text>
          </View>
          <Feather name="chevron-right" size={20} color={Colors.primary} />
        </Pressable>
      )}

      {!isLoading && (
        <View style={[styles.footer, { paddingBottom: Platform.OS === "web" ? 34 + 84 : insets.bottom + 84 }]}>
          <Pressable
            style={[
              styles.spinButton,
              {
                backgroundColor:
                  isSpinning || meals.length === 0
                    ? Colors.border
                    : Colors.primary,
                opacity: isSpinning || meals.length === 0 ? 0.6 : 1,
              },
            ]}
            onPress={spin}
            disabled={isSpinning || meals.length === 0}
          >
            <MaterialCommunityIcons
              name="silverware-fork-knife"
              size={22}
              color="#FFFFFF"
            />
            <Text style={styles.spinButtonText}>
              {isSpinning ? "Spinning..." : "Spin!"}
            </Text>
          </Pressable>

          <Pressable style={styles.refreshBtn} onPress={loadMeals}>
            <Feather name="refresh-cw" size={20} color={subtextColor} />
          </Pressable>
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
    paddingHorizontal: 24,
    paddingBottom: 8,
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
  wheelArea: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  loadingContainer: {
    alignItems: "center",
    gap: 12,
  },
  loadingText: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
  },
  wheelContainer: {
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
  },
  wheel: {
    position: "relative",
    overflow: "hidden",
    borderWidth: 4,
    borderColor: Colors.primary,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 12,
    elevation: 8,
  },
  segment: {
    position: "absolute",
    top: 0,
    left: 0,
  },
  segmentHalf: {
    position: "absolute",
    right: 0,
  },
  wheelCenter: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  centerCircle: {
    width: 64,
    height: 64,
    borderRadius: 32,
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 6,
    elevation: 4,
  },
  pointer: {
    position: "absolute",
    top: -12,
    width: 0,
    height: 0,
    borderLeftWidth: 12,
    borderRightWidth: 12,
    borderBottomWidth: 24,
    borderLeftColor: "transparent",
    borderRightColor: "transparent",
    borderBottomColor: Colors.primary,
    zIndex: 20,
  },
  resultCard: {
    flexDirection: "row",
    alignItems: "center",
    marginHorizontal: 24,
    marginBottom: 12,
    padding: 14,
    borderRadius: 16,
    gap: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  mealThumb: {
    width: 56,
    height: 56,
    borderRadius: 12,
    backgroundColor: Colors.backgroundDark,
  },
  mealInfo: {
    flex: 1,
    gap: 2,
  },
  mealName: {
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  tapHint: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  footer: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 24,
    gap: 12,
  },
  spinButton: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 8,
    paddingVertical: 16,
    borderRadius: 16,
    shadowColor: Colors.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 5,
  },
  spinButtonText: {
    fontSize: 17,
    fontFamily: "Inter_600SemiBold",
    color: "#FFFFFF",
  },
  refreshBtn: {
    width: 52,
    height: 52,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "transparent",
  },
});
