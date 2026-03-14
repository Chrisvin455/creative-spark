import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Plus, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Header } from "@/components/Header";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";

export default function Admin() {
  const { isAdmin, loading } = useAuth();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const [promptText, setPromptText] = useState("");
  const [promptCategory, setPromptCategory] = useState("");
  const [editingPrompt, setEditingPrompt] = useState<any>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  // Category form
  const [catName, setCatName] = useState("");
  const [catSlug, setCatSlug] = useState("");
  const [catDialogOpen, setCatDialogOpen] = useState(false);

  const { data: categories = [] } = useQuery({
    queryKey: ["categories"],
    queryFn: async () => {
      const { data } = await supabase.from("categories").select("*").order("name");
      return data || [];
    },
  });

  const { data: prompts = [] } = useQuery({
    queryKey: ["admin-prompts"],
    queryFn: async () => {
      const { data } = await supabase
        .from("prompts")
        .select("*, categories(name)")
        .order("created_at", { ascending: false });
      return data || [];
    },
  });

  if (!loading && !isAdmin) {
    navigate("/");
    return null;
  }

  const savePrompt = async () => {
    if (!promptText || !promptCategory) return;
    if (editingPrompt) {
      await supabase.from("prompts").update({ text: promptText, category_id: promptCategory }).eq("id", editingPrompt.id);
      toast({ title: "Prompt updated" });
    } else {
      await supabase.from("prompts").insert({ text: promptText, category_id: promptCategory });
      toast({ title: "Prompt added" });
    }
    setPromptText("");
    setPromptCategory("");
    setEditingPrompt(null);
    setDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["admin-prompts"] });
    queryClient.invalidateQueries({ queryKey: ["prompts"] });
  };

  const deletePrompt = async (id: string) => {
    await supabase.from("prompts").delete().eq("id", id);
    toast({ title: "Prompt deleted" });
    queryClient.invalidateQueries({ queryKey: ["admin-prompts"] });
  };

  const addCategory = async () => {
    if (!catName || !catSlug) return;
    await supabase.from("categories").insert({ name: catName, slug: catSlug, color_key: "fiction", icon: "BookOpen" });
    toast({ title: "Category added" });
    setCatName("");
    setCatSlug("");
    setCatDialogOpen(false);
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  const deleteCategory = async (id: string) => {
    await supabase.from("categories").delete().eq("id", id);
    toast({ title: "Category deleted" });
    queryClient.invalidateQueries({ queryKey: ["categories"] });
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      <div className="container py-12">
        <h1 className="font-display text-3xl font-bold mb-8">Admin Dashboard</h1>

        <Tabs defaultValue="prompts">
          <TabsList>
            <TabsTrigger value="prompts">Prompts</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
          </TabsList>

          <TabsContent value="prompts" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl font-semibold">
                Manage Prompts ({prompts.length})
              </h2>
              <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
                <DialogTrigger asChild>
                  <Button onClick={() => { setEditingPrompt(null); setPromptText(""); setPromptCategory(""); }}>
                    <Plus className="h-4 w-4 mr-1" /> Add Prompt
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>{editingPrompt ? "Edit Prompt" : "Add Prompt"}</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Category</Label>
                      <Select value={promptCategory} onValueChange={setPromptCategory}>
                        <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
                        <SelectContent>
                          {categories.map((c) => (
                            <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label>Prompt Text</Label>
                      <Textarea
                        value={promptText}
                        onChange={(e) => setPromptText(e.target.value)}
                        placeholder="Write your prompt..."
                        rows={4}
                      />
                    </div>
                    <Button onClick={savePrompt} className="w-full">
                      {editingPrompt ? "Update" : "Add"} Prompt
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {prompts.map((p: any) => (
                <div key={p.id} className="flex items-start gap-3 rounded-lg border bg-card p-4">
                  <div className="flex-1 min-w-0">
                    <p className="text-sm text-card-foreground line-clamp-2">{p.text}</p>
                    <p className="text-xs text-muted-foreground mt-1">{p.categories?.name}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingPrompt(p);
                        setPromptText(p.text);
                        setPromptCategory(p.category_id);
                        setDialogOpen(true);
                      }}
                    >
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => deletePrompt(p.id)}>
                      <Trash2 className="h-4 w-4 text-destructive" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </TabsContent>

          <TabsContent value="categories" className="mt-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="font-display text-xl font-semibold">Manage Categories</h2>
              <Dialog open={catDialogOpen} onOpenChange={setCatDialogOpen}>
                <DialogTrigger asChild>
                  <Button><Plus className="h-4 w-4 mr-1" /> Add Category</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Add Category</DialogTitle></DialogHeader>
                  <div className="space-y-4 mt-4">
                    <div>
                      <Label>Name</Label>
                      <Input value={catName} onChange={(e) => { setCatName(e.target.value); setCatSlug(e.target.value.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")); }} placeholder="Category name" />
                    </div>
                    <div>
                      <Label>Slug</Label>
                      <Input value={catSlug} onChange={(e) => setCatSlug(e.target.value)} placeholder="category-slug" />
                    </div>
                    <Button onClick={addCategory} className="w-full">Add Category</Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>

            <div className="space-y-2">
              {categories.map((c) => (
                <div key={c.id} className="flex items-center gap-3 rounded-lg border bg-card p-4">
                  <div className="flex-1">
                    <p className="text-sm font-medium text-card-foreground">{c.name}</p>
                    <p className="text-xs text-muted-foreground">/{c.slug}</p>
                  </div>
                  <Button variant="ghost" size="icon" onClick={() => deleteCategory(c.id)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </div>
              ))}
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
