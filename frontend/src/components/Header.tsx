import { Link, useNavigate } from "react-router-dom";
import { Feather, Moon, Sun, LogIn, LogOut, User, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/hooks/useTheme";

export function Header() {
  const { user, isAdmin, signOut } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b bg-background/80 backdrop-blur-md">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-2 group">
          <Feather className="h-6 w-6 text-primary transition-transform group-hover:rotate-12" />
          <span className="font-display text-xl font-semibold text-foreground">
            Creative Writing Prompts
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-6">
          <Link to="/" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Home
          </Link>
          <Link to="/categories" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Categories
          </Link>
          <Link to="/generator" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
            Generator
          </Link>
          {user && (
            <Link to="/favorites" className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
              Favorites
            </Link>
          )}
        </nav>

        <div className="flex items-center gap-2">
          <Button variant="ghost" size="icon" onClick={toggleTheme}>
            {theme === "light" ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
          </Button>

          {user ? (
            <>
              {isAdmin && (
                <Button variant="ghost" size="icon" onClick={() => navigate("/admin")}>
                  <Shield className="h-4 w-4" />
                </Button>
              )}
              <Button variant="ghost" size="icon" onClick={() => navigate("/history")}>
                <User className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={signOut}>
                <LogOut className="h-4 w-4 mr-1" /> Sign Out
              </Button>
            </>
          ) : (
            <Button variant="default" size="sm" onClick={() => navigate("/auth")}>
              <LogIn className="h-4 w-4 mr-1" /> Sign In
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
