const BASE = "https://www.themealdb.com/api/json/v1/1";

export interface Meal {
  idMeal: string;
  strMeal: string;
  strCategory: string;
  strArea: string;
  strInstructions: string;
  strMealThumb: string;
  strYoutube: string;
  strIngredient1?: string;
  strIngredient2?: string;
  strIngredient3?: string;
  strIngredient4?: string;
  strIngredient5?: string;
  strIngredient6?: string;
  strIngredient7?: string;
  strIngredient8?: string;
  strIngredient9?: string;
  strIngredient10?: string;
  strIngredient11?: string;
  strIngredient12?: string;
  strIngredient13?: string;
  strIngredient14?: string;
  strIngredient15?: string;
  strIngredient16?: string;
  strIngredient17?: string;
  strIngredient18?: string;
  strIngredient19?: string;
  strIngredient20?: string;
  strMeasure1?: string;
  strMeasure2?: string;
  strMeasure3?: string;
  strMeasure4?: string;
  strMeasure5?: string;
  strMeasure6?: string;
  strMeasure7?: string;
  strMeasure8?: string;
  strMeasure9?: string;
  strMeasure10?: string;
  strMeasure11?: string;
  strMeasure12?: string;
  strMeasure13?: string;
  strMeasure14?: string;
  strMeasure15?: string;
  strMeasure16?: string;
  strMeasure17?: string;
  strMeasure18?: string;
  strMeasure19?: string;
  strMeasure20?: string;
}

export interface MealSummary {
  idMeal: string;
  strMeal: string;
  strMealThumb: string;
}

export function getMealIngredients(meal: Meal): { ingredient: string; measure: string }[] {
  const result: { ingredient: string; measure: string }[] = [];
  for (let i = 1; i <= 20; i++) {
    const ingredient = meal[`strIngredient${i}` as keyof Meal] as string;
    const measure = meal[`strMeasure${i}` as keyof Meal] as string;
    if (ingredient && ingredient.trim()) {
      result.push({ ingredient: ingredient.trim(), measure: measure?.trim() ?? "" });
    }
  }
  return result;
}

export function getYouTubeVideoId(url: string): string | null {
  if (!url) return null;
  const match = url.match(/(?:v=|youtu\.be\/)([^&\s]+)/);
  return match ? match[1] : null;
}

function normalizeIngredient(value: string) {
  return value.trim().toLowerCase();
}

function ingredientTokens(value: string) {
  return normalizeIngredient(value)
    .split(/[\s,/-]+/)
    .filter(Boolean);
}

function matchesFridgeIngredient(mealIngredient: string, fridgeIngredient: string) {
  const mealNorm = normalizeIngredient(mealIngredient);
  const fridgeNorm = normalizeIngredient(fridgeIngredient);
  if (!mealNorm || !fridgeNorm) return false;
  if (mealNorm === fridgeNorm) return true;
  const mealTokens = ingredientTokens(mealNorm);
  const fridgeTokens = ingredientTokens(fridgeNorm);
  return mealTokens.some((token) => fridgeTokens.includes(token)) || fridgeTokens.some((token) => mealTokens.includes(token));
}

export async function searchMealsByIngredient(ingredient: string): Promise<MealSummary[]> {
  const res = await fetch(`${BASE}/filter.php?i=${encodeURIComponent(ingredient)}`);
  const data = await res.json();
  return data.meals ?? [];
}

export async function getMealsByIngredients(ingredients: string[]): Promise<MealSummary[]> {
  if (ingredients.length === 0) {
    return getRandomMeals(8);
  }
  const results = await Promise.all(ingredients.map(searchMealsByIngredient));
  const idCounts = new Map<string, number>();
  const mealMap = new Map<string, MealSummary>();
  for (const list of results) {
    for (const meal of list) {
      idCounts.set(meal.idMeal, (idCounts.get(meal.idMeal) ?? 0) + 1);
      mealMap.set(meal.idMeal, meal);
    }
  }
  const sorted = [...mealMap.values()].sort(
    (a, b) => (idCounts.get(b.idMeal) ?? 0) - (idCounts.get(a.idMeal) ?? 0)
  );
  return sorted.slice(0, 8);
}

export async function getMealsMatchingFridgeIngredients(ingredients: string[]): Promise<MealSummary[]> {
  const candidateMeals = await getMealsByIngredients(ingredients);
  if (ingredients.length === 0) return candidateMeals;

  const detailedMeals = await Promise.all(candidateMeals.map((meal) => getMealById(meal.idMeal)));
  return detailedMeals
    .filter((meal): meal is Meal => !!meal)
    .filter((meal) => {
      const mealIngredients = getMealIngredients(meal).map(({ ingredient }) => ingredient);
      return mealIngredients.every((mealIngredient) =>
        ingredients.some((fridgeIngredient) => matchesFridgeIngredient(mealIngredient, fridgeIngredient))
      );
    })
    .map((meal) => ({ idMeal: meal.idMeal, strMeal: meal.strMeal, strMealThumb: meal.strMealThumb }));
}

export async function getRandomMeals(count: number): Promise<MealSummary[]> {
  const results = await Promise.all(
    Array.from({ length: count }, () =>
      fetch(`${BASE}/random.php`).then((r) => r.json()).then((d) => d.meals?.[0] as Meal | undefined)
    )
  );
  const seen = new Set<string>();
  return results
    .filter((m): m is Meal => !!m && !seen.has(m.idMeal) && seen.add(m.idMeal) === undefined)
    .map((m) => ({ idMeal: m.idMeal, strMeal: m.strMeal, strMealThumb: m.strMealThumb }));
}

export async function getMealById(id: string): Promise<Meal | null> {
  const res = await fetch(`${BASE}/lookup.php?i=${id}`);
  const data = await res.json();
  return data.meals?.[0] ?? null;
}
