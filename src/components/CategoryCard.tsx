import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { BookOpen } from "lucide-react";
import { CATEGORY_ICONS, CATEGORY_COLORS } from "@/lib/constants";

interface CategoryCardProps {
  name: string;
  slug: string;
  colorKey: string;
  icon: string;
  promptCount?: number;
  index?: number;
}

export function CategoryCard({ name, slug, colorKey, icon, promptCount, index = 0 }: CategoryCardProps) {
  const Icon = CATEGORY_ICONS[icon] || BookOpen;
  const bgClass = CATEGORY_COLORS[colorKey] || "bg-primary";

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: index * 0.05 }}
    >
      <Link
        to={`/categories/${slug}`}
        className="group block rounded-xl border bg-card p-6 shadow-card hover:shadow-elevated transition-all duration-300 hover:-translate-y-1"
      >
        <div className={`inline-flex items-center justify-center w-12 h-12 rounded-lg ${bgClass} text-primary-foreground mb-4 group-hover:scale-110 transition-transform`}>
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-display text-lg font-semibold text-card-foreground mb-1">{name}</h3>
        {promptCount !== undefined && (
          <p className="text-sm text-muted-foreground">{promptCount} prompts</p>
        )}
      </Link>
    </motion.div>
  );
}
