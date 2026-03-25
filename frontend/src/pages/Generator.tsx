import { useState, useCallback } from "react";
import { Sparkles, RefreshCw } from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { PromptCard } from "@/components/PromptCard";
import { fetchApi } from "@/lib/api";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface Prompt {
  id: string;
  text: string;
  category_id: string;
  categories?: { name: string; slug: string; color_key: string; icon: string } | null;
}

export default function Generator() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [currentPrompt, setCurrentPrompt] = useState<Prompt | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [key, setKey] = useState(0);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const data = await fetchApi("/categories");
      return data || [];
    },
  });

  const { data: prompts = [] } = useQuery({
    queryKey: ["prompts"],
    queryFn: async () => {
      const data = await fetchApi("/prompts");
      return (data || []) as Prompt[];
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

  const generate = useCallback(() => {
    const filtered = selectedCategory === "all"
      ? prompts
      : prompts.filter((p) => p.category_id === selectedCategory);
    if (!filtered.length) return;
    const idx = Math.floor(Math.random() * filtered.length);
    setCurrentPrompt(filtered[idx]);
    setKey((k) => k + 1);

    // Track history
    if (user && filtered[idx]) {
      fetchApi("/history", {
        method: "POST",
        body: JSON.stringify({ prompt_id: filtered[idx].id })
      }).catch(err => console.error(err));
    }
  }, [prompts, selectedCategory, user]);

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
      <div className="container py-12 max-w-2xl">
        <div className="text-center mb-10">
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Prompt Generator</h1>
          <p className="text-muted-foreground">Click generate to discover your next writing adventure</p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 mb-10">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="All Categories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button size="lg" onClick={generate} className="gap-2">
            {currentPrompt ? <RefreshCw className="h-4 w-4" /> : <Sparkles className="h-4 w-4" />}
            {currentPrompt ? "Generate Another" : "Generate Prompt"}
          </Button>
        </div>

        <AnimatePresence mode="wait">
          {currentPrompt ? (
            <PromptCard
              key={key}
              text={currentPrompt.text}
              categoryName={currentPrompt.categories?.name}
              categoryColorKey={currentPrompt.categories?.color_key}
              categoryIcon={currentPrompt.categories?.icon}
              isFavorited={favorites.includes(currentPrompt.id)}
              onFavorite={user ? () => toggleFavorite(currentPrompt.id) : undefined}
              onSkip={generate}
              showActions
            />
          ) : (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="rounded-xl border-2 border-dashed border-border p-16 text-center"
            >
              <Sparkles className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="font-display text-xl text-muted-foreground">
                Your next great story starts here
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
