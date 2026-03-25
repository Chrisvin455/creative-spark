import { useParams, Link } from "react-router-dom";
import { ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { PromptCard } from "@/components/PromptCard";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export default function CategoryDetail() {
  const { slug } = useParams<{ slug: string }>();
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: category } = useQuery({
    queryKey: ["category", slug],
    queryFn: async () => {
      const categories = await fetchApi("/categories");
      return categories.find((c: any) => c.slug === slug);
    },
  });

  const { data: prompts = [] } = useQuery({
    queryKey: ["category-prompts", category?.id],
    enabled: !!category,
    queryFn: async () => {
      const allPrompts = await fetchApi("/prompts");
      return allPrompts.filter((p: any) => p.category_id === category!.id);
    },
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const data = await fetchApi("/favorites");
      return data || [];
    },
  });

  const toggleFavorite = async (promptId: string) => {
    if (!user) return;
    const isFav = favorites.includes(promptId);
    if (isFav) {
      await fetchApi(`/favorites/${promptId}`, { method: 'DELETE' });
    } else {
      await fetchApi('/favorites', {
        method: 'POST',
        body: JSON.stringify({ prompt_id: promptId })
      });
    }
    queryClient.invalidateQueries({ queryKey: ["favorites", user.id] });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-12 max-w-3xl">
        <Button variant="ghost" size="sm" asChild className="mb-6">
          <Link to="/categories"><ArrowLeft className="h-4 w-4 mr-1" /> Back to Categories</Link>
        </Button>

        <h1 className="font-display text-3xl font-bold mb-2">{category?.name}</h1>
        <p className="text-muted-foreground mb-8">{prompts.length} prompts available</p>

        <div className="space-y-4">
          {prompts.map((p: any) => (
            <PromptCard
              key={p.id}
              text={p.text}
              categoryName={p.categories?.name}
              categoryColorKey={p.categories?.color_key}
              categoryIcon={p.categories?.icon}
              isFavorited={favorites.includes(p.id)}
              onFavorite={user ? () => toggleFavorite(p.id) : undefined}
              showActions={!!user}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
