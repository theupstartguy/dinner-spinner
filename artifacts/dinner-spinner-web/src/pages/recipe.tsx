import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, ExternalLink } from "lucide-react";
import { getMealById, getMealIngredients, getYouTubeVideoId, Meal } from "@/services/mealdb";

export default function RecipePage() {
  const { id } = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const [meal, setMeal] = useState<Meal | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!id) return;
    setLoading(true);
    getMealById(id).then((m) => {
      setMeal(m);
      setLoading(false);
    });
  }, [id]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAFAF8" }}>
        <div className="w-12 h-12 rounded-full border-4 border-orange-200 border-t-orange-500 animate-spin" />
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-4" style={{ background: "#FAFAF8" }}>
        <span className="text-5xl">😕</span>
        <p className="text-gray-500">Recipe not found</p>
        <button onClick={() => navigate("/")} className="text-orange-500 underline font-medium">Go back</button>
      </div>
    );
  }

  const recipeIngredients = getMealIngredients(meal);
  const videoId = getYouTubeVideoId(meal.strYoutube);

  return (
    <div className="min-h-screen pb-8" style={{ background: "#FAFAF8" }}>
      <div className="relative">
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/30 to-transparent" />
        <button
          onClick={() => navigate("/")}
          className="absolute top-12 left-4 p-2 rounded-full bg-white/90 shadow-md"
        >
          <ArrowLeft size={20} className="text-gray-700" />
        </button>
      </div>

      <div className="px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-2xl font-extrabold text-gray-900 flex-1">{meal.strMeal}</h1>
          {meal.strYoutube && (
            <a
              href={meal.strYoutube}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-sm font-semibold text-white flex-shrink-0"
              style={{ background: "#FF0000" }}
            >
              <ExternalLink size={14} />
              YouTube
            </a>
          )}
        </div>

        <div className="flex gap-2 mt-2 flex-wrap">
          {meal.strCategory && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-orange-100 text-orange-600">
              {meal.strCategory}
            </span>
          )}
          {meal.strArea && (
            <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-600">
              {meal.strArea}
            </span>
          )}
        </div>

        {videoId && (
          <div className="mt-5 rounded-2xl overflow-hidden shadow-md" style={{ aspectRatio: "16/9" }}>
            <iframe
              src={`https://www.youtube.com/embed/${videoId}`}
              title="Recipe Video"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full"
              style={{ border: "none" }}
            />
          </div>
        )}

        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Ingredients</h2>
          <div className="grid grid-cols-2 gap-2">
            {recipeIngredients.map(({ ingredient, measure }, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white rounded-xl px-3 py-2.5 shadow-sm border border-gray-100"
              >
                <div className="w-2 h-2 rounded-full flex-shrink-0" style={{ background: "#FF6B35" }} />
                <div className="min-w-0">
                  <p className="text-sm font-semibold text-gray-800 truncate">{ingredient}</p>
                  {measure && <p className="text-xs text-gray-400 truncate">{measure}</p>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-3">Instructions</h2>
          {meal.strInstructions.split(/\r?\n/).filter(Boolean).map((step, i) => (
            <p key={i} className="text-sm text-gray-700 leading-relaxed mb-3">
              {step}
            </p>
          ))}
        </div>
      </div>
    </div>
  );
}
