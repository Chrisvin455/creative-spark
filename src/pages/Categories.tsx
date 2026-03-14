import { Header } from "@/components/Header";
import { CategoryCard } from "@/components/CategoryCard";
import { supabase } from "@/integrations/supabase/client";
import { useQuery } from "@tanstack/react-query";

export default function Categories() {
  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data || [];
    },
  });

  const { data: promptCounts = {} } = useQuery({
    queryKey: ["prompt-counts"],
    queryFn: async () => {
      const { data } = await supabase.from("prompts").select("category_id");
      const counts: Record<string, number> = {};
      (data || []).forEach((p) => {
        counts[p.category_id] = (counts[p.category_id] || 0) + 1;
      });
      return counts;
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-12">
        <h1 className="font-display text-3xl md:text-4xl font-bold mb-2">Writing Categories</h1>
        <p className="text-muted-foreground mb-8">Explore prompts by genre and style</p>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
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
      </div>
    </div>
  );
}
