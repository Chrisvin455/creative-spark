import { Header } from "@/components/Header";
import { PromptCard } from "@/components/PromptCard";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery } from "@tanstack/react-query";
import { Clock } from "lucide-react";
import { format } from "date-fns";

export default function History() {
  const { user } = useAuth();

  const { data: history = [] } = useQuery({
    queryKey: ["history", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("prompt_history")
        .select("viewed_at, prompts(*, categories(name, slug, color_key, icon))")
        .eq("user_id", user!.id)
        .order("viewed_at", { ascending: false })
        .limit(50);
      return (data || []).map((h: any) => ({ ...h.prompts, viewed_at: h.viewed_at }));
    },
  });

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-12 max-w-3xl">
        <h1 className="font-display text-3xl font-bold mb-2">Prompt History</h1>
        <p className="text-muted-foreground mb-8">Prompts you've viewed recently</p>

        {history.length === 0 ? (
          <div className="rounded-xl border-2 border-dashed border-border p-16 text-center">
            <Clock className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
            <p className="font-display text-xl text-muted-foreground">No history yet</p>
            <p className="text-sm text-muted-foreground mt-2">Generate some prompts to see them here</p>
          </div>
        ) : (
          <div className="space-y-4">
            {history.map((p: any, i: number) => (
              <div key={i}>
                <p className="text-xs text-muted-foreground mb-2">
                  {format(new Date(p.viewed_at), "MMM d, yyyy 'at' h:mm a")}
                </p>
                <PromptCard
                  text={p.text}
                  categoryName={p.categories?.name}
                  categoryColorKey={p.categories?.color_key}
                  categoryIcon={p.categories?.icon}
                  showActions={false}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
