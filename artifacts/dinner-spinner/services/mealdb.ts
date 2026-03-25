const BASE_URL = "https://www.themealdb.com/api/json/v1/1";

export interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

export interface MealDetail {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strYoutube: string;
  strSource: string;
  strTags: string | null;
  ingredients: { name: string; measure: string }[];
}

function extractIngredients(meal: Record<string, string | null>): { name: string; measure: string }[] {
  const result: { name: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const name = meal[`strIngredient${i}`];
    const measure = meal[`strMeasure${i}`];
    if (name && name.trim()) {
      result.push({ name: name.trim(), measure: (measure || "").trim() });
    }
  }
  return result;
}

export async function getMealsByIngredient(ingredient: string): Promise<MealSummary[]> {
  try {
    const res = await fetch(`${BASE_URL}/filter.php?i=${encodeURIComponent(ingredient)}`);
    const data = await res.json();
    return data.meals || [];
  } catch {
    return [];
  }
}

export async function getMealsByIngredients(ingredients: string[]): Promise<MealSummary[]> {
  if (ingredients.length === 0) {
    return getRandomMeals(8);
  }

  const results = await Promise.all(ingredients.map((i) => getMealsByIngredient(i)));
  const allMeals = results.flat();
  
  const seen = new Set<string>();
  const unique: MealSummary[] = [];
  for (const meal of allMeals) {
    if (!seen.has(meal.idMeal)) {
      seen.add(meal.idMeal);
      unique.push(meal);
    }
  }
  return unique;
}

export async function getMealById(id: string): Promise<MealDetail | null> {
  try {
    const res = await fetch(`${BASE_URL}/lookup.php?i=${id}`);
    const data = await res.json();
    if (!data.meals || data.meals.length === 0) return null;
    const meal = data.meals[0];
    return {
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strCategory: meal.strCategory,
      strArea: meal.strArea,
      strInstructions: meal.strInstructions,
      strMealThumb: meal.strMealThumb,
      strYoutube: meal.strYoutube,
      strSource: meal.strSource,
      strTags: meal.strTags,
      ingredients: extractIngredients(meal),
    };
  } catch {
    return null;
  }
}

export async function getRandomMeal(): Promise<MealSummary | null> {
  try {
    const res = await fetch(`${BASE_URL}/random.php`);
    const data = await res.json();
    if (!data.meals || data.meals.length === 0) return null;
    const meal = data.meals[0];
    return {
      idMeal: meal.idMeal,
      strMeal: meal.strMeal,
      strMealThumb: meal.strMealThumb,
    };
  } catch {
    return null;
  }
}

export async function getRandomMeals(count: number): Promise<MealSummary[]> {
  const results = await Promise.all(
    Array.from({ length: count }, () => getRandomMeal())
  );
  return results.filter((m): m is MealSummary => m !== null);
}

export function getYoutubeVideoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
}

export function getYoutubeThumbnail(videoId: string): string {
  return `https://img.youtube.com/vi/${videoId}/hqdefault.jpg`;
}
