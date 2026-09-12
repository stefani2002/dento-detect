import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext";
import { Button } from "./ui/button";
import { Home, LogOut, User } from "lucide-react";

export function Header() {
  const { isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout(); // чисти локален token и user
    navigate("/login"); // редирект кон логин
  };

  return (
    <header className="w-full py-6 px-4">
      <div className="container max-w-6xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="DentoDetect Logo"
              className="w-10 h-10 object-contain"
            />
          </div>
          <div>
            <h1 className="font-display text-xl font-bold text-foreground">
              DentoDetect
            </h1>
            <p className="text-xs text-muted-foreground">Caries Detection</p>
          </div>
        </div>

        <nav className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <Link to="/">
              <Home className="w-4 h-4" />
              <span className="hidden sm:inline">Home</span>
            </Link>
          </Button>
          <Button
            variant="ghost"
            size="sm"
            asChild
            className="gap-2 text-muted-foreground hover:text-primary hover:bg-primary/10"
          >
            <Link to="/profile">
              <User className="w-4 h-4" />
              <span className="hidden sm:inline">Profile</span>
            </Link>
          </Button>

          {isAuthenticated && (
            <>
              <div className="w-px h-6 bg-border mx-1" />
              <Button
                variant="ghost"
                size="sm"
                onClick={handleLogout}
                className="gap-2 text-destructive/70 hover:text-destructive hover:bg-destructive/10"
              >
                <LogOut className="w-4 h-4" />
                <span className="hidden sm:inline">Log Out</span>
              </Button>
            </>
          )}
        </nav>
      </div>
    </header>
  );
}
