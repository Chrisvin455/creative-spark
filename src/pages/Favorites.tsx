import { Header } from "@/components/Header";
import { PromptCard } from "@/components/PromptCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Heart } from "lucide-react";

export default function Favorites() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: favoritePrompts = [] } = useQuery({
    queryKey: ["favorite-prompts", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("favorites")
        .select("prompt_id, prompts(*, categories(name, slug, color_key, icon))")
        .eq("user_id", user!.id)
        .order("created_at", { ascending: false });
      return (data || []).map((f: any) => ({ ...f.prompts, favorite_prompt_id: f.prompt_id }));
    },
  });

  const removeFavorite = async (promptId: string) => {
    if (!user) return;
    await supabase.from("favorites").delete().eq("user_id", user.id).eq("prompt_id", promptId);
    queryClient.invalidateQueries({ queryKey: ["favorite-prompts", user.id] });
    queryClient.invalidateQueries({ queryKey: ["favorites", user.id] });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-12 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-2">Saved Prompts</h1>
        <p className="text-muted-foreground mb-8">Your collection of favorite writing prompts</p>

        {favoritePrompts.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border p-16 text-center">
            <Heart className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-display text-xl text-muted-foreground">No saved prompts yet</p>
            <p className="text-sm text-muted-foreground mt-2">Save prompts you love to find them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {favoritePrompts.map((p: any) => (
              <PromptCard
                key={p.id}
                text={p.text}
                categoryName={p.categories?.name}
                categoryColorKey={p.categories?.color_key}
                categoryIcon={p.categories?.icon}
                isFavorited
                onFavorite={() => removeFavorite(p.id)}
                showActions
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
