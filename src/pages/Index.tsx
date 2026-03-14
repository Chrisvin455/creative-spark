import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Sparkles, ArrowRight, Feather } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Header } from "@/components/Header";
import { PromptCard } from "@/components/PromptCard";
import { CategoryCard } from "@/components/CategoryCard";
import { SearchBar } from "@/components/SearchBar";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";

interface Prompt {
  id: string;
  text: string;
  category_id: string;
  categories?: { name: string; slug: string; color_key: string; icon: string } | null;
}

interface Category {
  id: string;
  name: string;
  slug: string;
  color_key: string;
  icon: string;
}

export default function Index() {
  const { user } = useAuth();
  const [search, setSearch] = useState("");
  const [randomPrompt, setRandomPrompt] = useState<Prompt | null>(null);

  const { data: prompts = [] } = useQuery({
    queryKey: ["prompts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("prompts")
        .select("*, categories(name, slug, color_key, icon)")
        .order("created_at", { ascending: false });
      return (data || []) as Prompt[];
    },
  });

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return (data || []) as Category[];
    },
  });

  const { data: favorites = [] } = useQuery({
    queryKey: ["favorites", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase.from("favorites").select("prompt_id").eq("user_id", user!.id);
      return (data || []).map((f) => f.prompt_id);
    },
  });

  // Daily prompt - deterministic based on date
  const dailyPrompt = useMemo(() => {
    if (!prompts.length) return null;
    const today = new Date();
    const dayIndex = (today.getFullYear() * 366 + today.getMonth() * 31 + today.getDate()) % prompts.length;
    return prompts[dayIndex];
  }, [prompts]);

  const generateRandom = () => {
    if (!prompts.length) return;
    const idx = Math.floor(Math.random() * prompts.length);
    setRandomPrompt(prompts[idx]);
  };

  const toggleFavorite = async (promptId: string) => {
    if (!user) return;
    const isFav = favorites.includes(promptId);
    if (isFav) {
      await supabase.from("favorites").delete().eq("user_id", user.id).eq("prompt_id", promptId);
    } else {
      await supabase.from("favorites").insert({ user_id: user.id, prompt_id: promptId });
    }
  };

  // Search results
  const searchResults = useMemo(() => {
    if (!search.trim()) return [];
    const q = search.toLowerCase();
    return prompts.filter((p) => p.text.toLowerCase().includes(q));
  }, [search, prompts]);

  // Prompt counts per category
  const promptCounts = useMemo(() => {
    const counts: Record<string, number> = {};
    prompts.forEach((p) => {
      counts[p.category_id] = (counts[p.category_id] || 0) + 1;
    });
    return counts;
  }, [prompts]);

  return (
    <div className="min-h-screen bg-background">
      <Header />

      {/* Hero */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-primary/5 to-transparent" />
        <div className="container relative py-20 md:py-28">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="max-w-2xl mx-auto text-center"
          >
            <div className="inline-flex items-center gap-2 rounded-full border bg-card px-4 py-1.5 text-sm text-muted-foreground mb-6">
              <Feather className="h-3.5 w-3.5" />
              <span>Unlock your creativity</span>
            </div>
            <h1 className="font-display text-4xl md:text-6xl font-bold tracking-tight text-foreground mb-4">
              Break Through
              <br />
              <span className="text-primary">Writer's Block</span>
            </h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-lg mx-auto">
              Discover inspiring prompts across nine genres. Generate ideas, save favorites, and let your imagination run free.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3">
              <Button size="lg" onClick={generateRandom} className="gap-2">
                <Sparkles className="h-4 w-4" />
                Generate Random Prompt
              </Button>
              <Button variant="outline" size="lg" asChild>
                <Link to="/categories" className="gap-2">
                  Browse Categories <ArrowRight className="h-4 w-4" />
                </Link>
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      <div className="container pb-20 space-y-16">
        {/* Search */}
        <section className="flex justify-center">
          <SearchBar value={search} onChange={setSearch} />
        </section>

        {/* Search Results */}
        {search.trim() && (
          <section>
            <h2 className="font-display text-2xl font-semibold mb-6">
              Search Results ({searchResults.length})
            </h2>
            <div className="grid gap-4 md:grid-cols-2">
              {searchResults.map((p) => (
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
              {searchResults.length === 0 && (
                <p className="text-muted-foreground col-span-2 text-center py-8">
                  No prompts found matching "{search}"
                </p>
              )}
            </div>
          </section>
        )}

        {/* Random Prompt */}
        {randomPrompt && !search.trim() && (
          <section>
            <h2 className="font-display text-2xl font-semibold mb-6">Your Random Prompt</h2>
            <PromptCard
              text={randomPrompt.text}
              categoryName={randomPrompt.categories?.name}
              categoryColorKey={randomPrompt.categories?.color_key}
              categoryIcon={randomPrompt.categories?.icon}
              isFavorited={favorites.includes(randomPrompt.id)}
              onFavorite={user ? () => toggleFavorite(randomPrompt.id) : undefined}
              onSkip={generateRandom}
              showActions
            />
          </section>
        )}

        {/* Daily Prompt */}
        {dailyPrompt && !search.trim() && (
          <section>
            <h2 className="font-display text-2xl font-semibold mb-2">Daily Writing Prompt</h2>
            <p className="text-sm text-muted-foreground mb-6">Refreshes every 24 hours</p>
            <PromptCard
              text={dailyPrompt.text}
              categoryName={dailyPrompt.categories?.name}
              categoryColorKey={dailyPrompt.categories?.color_key}
              categoryIcon={dailyPrompt.categories?.icon}
              isFavorited={favorites.includes(dailyPrompt.id)}
              onFavorite={user ? () => toggleFavorite(dailyPrompt.id) : undefined}
              showActions={!!user}
            />
          </section>
        )}

        {/* Categories */}
        {!search.trim() && (
          <section>
            <div className="flex items-center justify-between mb-6">
              <h2 className="font-display text-2xl font-semibold">Writing Categories</h2>
              <Button variant="ghost" size="sm" asChild>
                <Link to="/categories">View All <ArrowRight className="h-4 w-4 ml-1" /></Link>
              </Button>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-4">
              {categories.map((cat, i) => (
                <CategoryCard
                  key={cat.id}
                  name={cat.name}
                  slug={cat.slug}
                  colorKey={cat.color_key}
                  icon={cat.icon}
                  promptCount={promptCounts[cat.id] || 0}
                  index={i}
                />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
