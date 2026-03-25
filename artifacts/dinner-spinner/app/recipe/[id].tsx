import { Feather, Ionicons, MaterialCommunityIcons } from "@expo/vector-icons";
import * as Haptics from "expo-haptics";
import { router, useLocalSearchParams } from "expo-router";
import { useQuery } from "@tanstack/react-query";
import React, { useState } from "react";
import {
  ActivityIndicator,
  Dimensions,
  Image,
  Linking,
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
import {
  getMealById,
  getYoutubeVideoId,
  getYoutubeThumbnail,
} from "@/services/mealdb";

const { width } = Dimensions.get("window");
const IMAGE_HEIGHT = Math.min(width * 0.75, 340);

export default function RecipeScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const insets = useSafeAreaInsets();
  const isDark = useColorScheme() === "dark";
  const [showFullInstructions, setShowFullInstructions] = useState(false);

  const { data: meal, isLoading, error } = useQuery({
    queryKey: ["meal", id],
    queryFn: () => getMealById(id),
    enabled: !!id,
  });

  const bgColor = isDark ? "#1C1C1E" : Colors.background;
  const textColor = isDark ? "#FFFFFF" : Colors.text;
  const subtextColor = isDark ? "#AEAEB2" : Colors.textSecondary;
  const cardBg = isDark ? "#2C2C2E" : Colors.surface;
  const borderColor = isDark ? "#3A3A3C" : Colors.border;

  const videoId = meal?.strYoutube ? getYoutubeVideoId(meal.strYoutube) : null;

  const openYoutube = () => {
    if (!meal?.strYoutube) return;
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    Linking.openURL(meal.strYoutube);
  };

  const topPad = Platform.OS === "web" ? 67 : insets.top;
  const bottomPad = Platform.OS === "web" ? 34 : insets.bottom;

  if (isLoading) {
    return (
      <View style={[styles.centered, { backgroundColor: bgColor }]}>
        <ActivityIndicator size="large" color={Colors.primary} />
      </View>
    );
  }

  if (!meal || error) {
    return (
      <View style={[styles.centered, { backgroundColor: bgColor }]}>
        <Feather name="alert-circle" size={48} color={Colors.textLight} />
        <Text style={[styles.errorText, { color: textColor }]}>
          Recipe not found
        </Text>
        <Pressable
          style={[styles.backBtn, { backgroundColor: Colors.primary }]}
          onPress={() => router.back()}
        >
          <Text style={styles.backBtnText}>Go Back</Text>
        </Pressable>
      </View>
    );
  }

  const instructions = meal.strInstructions || "";
  const truncated = instructions.length > 400;
  const displayInstructions =
    showFullInstructions || !truncated
      ? instructions
      : instructions.slice(0, 400) + "...";

  const tags = meal.strTags ? meal.strTags.split(",").filter(Boolean) : [];

  return (
    <View style={[styles.container, { backgroundColor: bgColor }]}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: bottomPad + 24 }}
      >
        <View style={styles.imageContainer}>
          <Image source={{ uri: meal.strMealThumb }} style={[styles.image, { height: IMAGE_HEIGHT }]} />
          <View style={[styles.imageOverlay, { height: IMAGE_HEIGHT }]} />

          <Pressable
            style={[styles.backButton, { top: topPad + 12 }]}
            onPress={() => {
              Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
              router.back();
            }}
          >
            <Feather name="arrow-left" size={20} color="#FFFFFF" />
          </Pressable>

          <View style={[styles.imageFooter, { bottom: 16 }]}>
            <Text style={styles.mealTitle}>{meal.strMeal}</Text>
            <View style={styles.badgeRow}>
              {meal.strCategory ? (
                <View style={[styles.badge, { backgroundColor: Colors.primary + "CC" }]}>
                  <Text style={styles.badgeText}>{meal.strCategory}</Text>
                </View>
              ) : null}
              {meal.strArea ? (
                <View style={[styles.badge, { backgroundColor: "#00000066" }]}>
                  <Text style={styles.badgeText}>{meal.strArea}</Text>
                </View>
              ) : null}
            </View>
          </View>
        </View>

        {tags.length > 0 && (
          <View style={styles.tagsRow}>
            {tags.map((tag) => (
              <View
                key={tag}
                style={[styles.tag, { backgroundColor: cardBg, borderColor }]}
              >
                <Text style={[styles.tagText, { color: subtextColor }]}>
                  {tag.trim()}
                </Text>
              </View>
            ))}
          </View>
        )}

        {videoId && (
          <Pressable
            style={[styles.videoCard, { backgroundColor: cardBg }]}
            onPress={openYoutube}
          >
            <Image
              source={{ uri: getYoutubeThumbnail(videoId) }}
              style={styles.videoThumb}
            />
            <View style={styles.playOverlay}>
              <View style={styles.playButton}>
                <Ionicons name="play" size={28} color="#FFFFFF" />
              </View>
            </View>
            <View style={styles.videoInfo}>
              <View style={styles.videoLabel}>
                <Feather name="youtube" size={16} color="#FF0000" />
                <Text style={[styles.videoLabelText, { color: textColor }]}>
                  Watch how to make it
                </Text>
              </View>
              <Feather name="external-link" size={16} color={subtextColor} />
            </View>
          </Pressable>
        )}

        <View style={[styles.section, { borderTopColor: borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Ingredients
          </Text>
          <View style={styles.ingredientsGrid}>
            {meal.ingredients.map((ing, i) => (
              <View
                key={i}
                style={[
                  styles.ingredientItem,
                  { backgroundColor: cardBg, borderColor },
                ]}
              >
                <MaterialCommunityIcons
                  name="circle-small"
                  size={16}
                  color={Colors.primary}
                />
                <View style={styles.ingredientText}>
                  <Text style={[styles.ingName, { color: textColor }]}>
                    {ing.name}
                  </Text>
                  {ing.measure ? (
                    <Text style={[styles.ingMeasure, { color: subtextColor }]}>
                      {ing.measure}
                    </Text>
                  ) : null}
                </View>
              </View>
            ))}
          </View>
        </View>

        <View style={[styles.section, { borderTopColor: borderColor }]}>
          <Text style={[styles.sectionTitle, { color: textColor }]}>
            Instructions
          </Text>
          <Text style={[styles.instructions, { color: subtextColor }]}>
            {displayInstructions}
          </Text>
          {truncated && (
            <Pressable
              style={styles.readMore}
              onPress={() => setShowFullInstructions(!showFullInstructions)}
            >
              <Text style={[styles.readMoreText, { color: Colors.primary }]}>
                {showFullInstructions ? "Show less" : "Read more"}
              </Text>
              <Feather
                name={showFullInstructions ? "chevron-up" : "chevron-down"}
                size={14}
                color={Colors.primary}
              />
            </Pressable>
          )}
        </View>

        {meal.strSource ? (
          <Pressable
            style={styles.sourceRow}
            onPress={() => Linking.openURL(meal.strSource)}
          >
            <Feather name="link" size={14} color={subtextColor} />
            <Text style={[styles.sourceText, { color: subtextColor }]}>
              View original recipe
            </Text>
          </Pressable>
        ) : null}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  centered: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: 16,
  },
  errorText: {
    fontSize: 18,
    fontFamily: "Inter_500Medium",
  },
  backBtn: {
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: 12,
  },
  backBtnText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontFamily: "Inter_600SemiBold",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    width: "100%",
    backgroundColor: Colors.backgroundDark,
  },
  imageOverlay: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    background: "linear-gradient(transparent, rgba(0,0,0,0.75))",
    backgroundColor: "rgba(0,0,0,0)",
  },
  backButton: {
    position: "absolute",
    left: 16,
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: "rgba(0,0,0,0.45)",
    alignItems: "center",
    justifyContent: "center",
  },
  imageFooter: {
    position: "absolute",
    left: 0,
    right: 0,
    paddingHorizontal: 20,
    gap: 8,
  },
  mealTitle: {
    fontSize: 26,
    fontFamily: "Inter_700Bold",
    color: "#FFFFFF",
    letterSpacing: -0.5,
    textShadowColor: "rgba(0,0,0,0.5)",
    textShadowOffset: { width: 0, height: 1 },
    textShadowRadius: 4,
  },
  badgeRow: {
    flexDirection: "row",
    gap: 8,
  },
  badge: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
  },
  badgeText: {
    color: "#FFFFFF",
    fontSize: 12,
    fontFamily: "Inter_600SemiBold",
  },
  tagsRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  tag: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
  },
  tagText: {
    fontSize: 12,
    fontFamily: "Inter_500Medium",
  },
  videoCard: {
    marginHorizontal: 20,
    marginTop: 16,
    borderRadius: 16,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  videoThumb: {
    width: "100%",
    height: 180,
    backgroundColor: Colors.backgroundDark,
  },
  playOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 180,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  playButton: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: "rgba(0,0,0,0.65)",
    alignItems: "center",
    justifyContent: "center",
    paddingLeft: 4,
  },
  videoInfo: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: 16,
    paddingVertical: 12,
  },
  videoLabel: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  videoLabelText: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  section: {
    paddingHorizontal: 20,
    paddingTop: 20,
    marginTop: 20,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: "Inter_700Bold",
    marginBottom: 14,
    letterSpacing: -0.3,
  },
  ingredientsGrid: {
    gap: 8,
  },
  ingredientItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    gap: 4,
  },
  ingredientText: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  ingName: {
    fontSize: 15,
    fontFamily: "Inter_500Medium",
  },
  ingMeasure: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
  instructions: {
    fontSize: 15,
    fontFamily: "Inter_400Regular",
    lineHeight: 24,
  },
  readMore: {
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    marginTop: 8,
  },
  readMoreText: {
    fontSize: 14,
    fontFamily: "Inter_500Medium",
  },
  sourceRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    paddingHorizontal: 20,
    paddingTop: 16,
  },
  sourceText: {
    fontSize: 13,
    fontFamily: "Inter_400Regular",
  },
});
