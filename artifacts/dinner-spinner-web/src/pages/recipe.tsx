import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { ArrowLeft, ExternalLink, Clock3, Utensils } from "lucide-react";
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
      <div className="min-h-screen flex items-center justify-center" style={{ background: "#FAF8F5" }}>
        <div
          className="w-12 h-12 rounded-full border-4 animate-spin"
          style={{ borderColor: "#EEF6F1", borderTopColor: "hsl(145 30% 42%)" }}
        />
      </div>
    );
  }

  if (!meal) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-5 px-5" style={{ background: "#FAF8F5" }}>
        <span className="text-5xl">😕</span>
        <p className="text-sm" style={{ color: "#9E9790" }}>We couldn't find that recipe.</p>
        <button
          onClick={() => navigate("/")}
          className="h-12 px-6 rounded-xl font-semibold text-sm text-white"
          style={{ background: "hsl(145 30% 42%)" }}
        >
          Back to home
        </button>
      </div>
    );
  }

  const recipeIngredients = getMealIngredients(meal);
  const videoId = getYouTubeVideoId(meal.strYoutube);

  return (
    <div className="min-h-screen pb-24" style={{ background: "#FAF8F5" }}>
      <div className="relative">
        <img
          src={meal.strMealThumb}
          alt={meal.strMeal}
          className="w-full h-64 object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-transparent to-transparent" />
        <button
          onClick={() => navigate("/")}
          className="absolute top-12 left-4 p-2 rounded-full bg-white/90 shadow-sm backdrop-blur-sm transition-transform active:scale-[0.97]"
        >
          <ArrowLeft size={20} color="#332F2B" />
        </button>
      </div>

      <div className="mx-auto max-w-[480px] px-5 pt-5">
        <div className="flex items-start justify-between gap-3">
          <h1 className="text-[28px] font-bold leading-[1.3] tracking-[-0.015em] flex-1" style={{ color: "#332F2B" }}>
            {meal.strMeal}
          </h1>
          {meal.strYoutube && (
            <a
              href={meal.strYoutube}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-sm font-semibold text-white flex-shrink-0 transition-transform active:scale-[0.97]"
              style={{ background: "hsl(145 30% 42%)" }}
            >
              <ExternalLink size={14} />
              Watch
            </a>
          )}
        </div>

        <div className="flex gap-2 mt-3 flex-wrap">
          {meal.strCategory && (
            <span
              className="h-7 px-3 rounded-full text-[13px] font-medium flex items-center"
              style={{ background: "#EEF6F1", color: "hsl(145 30% 42%)" }}
            >
              {meal.strCategory}
            </span>
          )}
          {meal.strArea && (
            <span
              className="h-7 px-3 rounded-full text-[13px] font-medium flex items-center"
              style={{ background: "#FAEEE8", color: "#CC7A55" }}
            >
              {meal.strArea}
            </span>
          )}
          <span
            className="h-7 px-3 rounded-full text-[13px] font-medium flex items-center gap-1"
            style={{ background: "#EDEBE8", color: "#9E9790" }}
          >
            <Clock3 size={12} />
            ~30 min
          </span>
          <span
            className="h-7 px-3 rounded-full text-[13px] font-medium flex items-center gap-1"
            style={{ background: "#EDEBE8", color: "#9E9790" }}
          >
            <Utensils size={12} />
            {recipeIngredients.length} ingredients
          </span>
        </div>

        {videoId && (
          <div className="mt-5 rounded-2xl overflow-hidden shadow-sm" style={{ aspectRatio: "16/9" }}>
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
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] mb-3" style={{ color: "#332F2B" }}>
            Ingredients
          </h2>
          <div className="grid grid-cols-2 gap-2">
            {recipeIngredients.map(({ ingredient, measure }, i) => (
              <div
                key={i}
                className="flex items-center gap-2 bg-white rounded-2xl px-3 py-3 shadow-sm"
              >
                <div
                  className="w-2 h-2 rounded-full flex-shrink-0"
                  style={{ background: "hsl(145 30% 42%)" }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium truncate" style={{ color: "#332F2B" }}>{ingredient}</p>
                  {measure && (
                    <p className="text-xs truncate" style={{ color: "#9E9790" }}>{measure}</p>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-[22px] font-semibold tracking-[-0.01em] mb-3" style={{ color: "#332F2B" }}>
            Instructions
          </h2>
          <div className="space-y-4">
            {meal.strInstructions.split(/\r?\n/).filter(Boolean).map((step, i) => (
              <p key={i} className="text-sm leading-relaxed" style={{ color: "#332F2B", lineHeight: "1.6" }}>
                {step}
              </p>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
