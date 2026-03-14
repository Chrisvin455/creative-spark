import { motion } from "framer-motion";
import { Heart, SkipForward, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { CATEGORY_ICONS, CATEGORY_TEXT_COLORS } from "@/lib/constants";

interface PromptCardProps {
  text: string;
  categoryName?: string;
  categoryColorKey?: string;
  categoryIcon?: string;
  isFavorited?: boolean;
  onFavorite?: () => void;
  onSkip?: () => void;
  showActions?: boolean;
}

export function PromptCard({
  text,
  categoryName,
  categoryColorKey,
  categoryIcon,
  isFavorited,
  onFavorite,
  onSkip,
  showActions = true,
}: PromptCardProps) {
  const Icon = categoryIcon ? CATEGORY_ICONS[categoryIcon] || BookOpen : BookOpen;
  const colorClass = categoryColorKey ? CATEGORY_TEXT_COLORS[categoryColorKey] || "text-primary" : "text-primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -12 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      className="rounded-xl border bg-card p-8 shadow-card hover:shadow-elevated transition-shadow duration-300"
    >
      {categoryName && (
        <div className={`flex items-center gap-2 mb-4 ${colorClass}`}>
          <Icon className="h-4 w-4" />
          <span className="text-xs font-semibold uppercase tracking-wider">{categoryName}</span>
        </div>
      )}

      <p className="font-display text-xl md:text-2xl leading-relaxed text-card-foreground">
        "{text}"
      </p>

      {showActions && (
        <div className="flex items-center gap-3 mt-6 pt-4 border-t">
          {onFavorite && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onFavorite}
              className={isFavorited ? "text-cat-romance" : "text-muted-foreground"}
            >
              <Heart className={`h-4 w-4 mr-1 ${isFavorited ? "fill-current" : ""}`} />
              {isFavorited ? "Saved" : "Save"}
            </Button>
          )}
          {onSkip && (
            <Button variant="ghost" size="sm" onClick={onSkip} className="text-muted-foreground">
              <SkipForward className="h-4 w-4 mr-1" />
              Next Prompt
            </Button>
          )}
        </div>
      )}
    </motion.div>
  );
}
