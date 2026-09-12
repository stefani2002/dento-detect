import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "@/context/AuthContext"; // ✅ IMPORT THIS
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { LogIn } from "lucide-react";
import { toast } from "sonner";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const navigate = useNavigate();
  const { login } = useAuth(); // ✅ USE CONTEXT LOGIN

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      // FastAPI OAuth2PasswordRequestForm expects form data
      const formData = new URLSearchParams();
      formData.append("username", email);
      formData.append("password", password);

      const response = await fetch("http://localhost:8000/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/x-www-form-urlencoded",
        },
        body: formData.toString(),
      });

      if (!response.ok) {
        throw new Error("Invalid credentials");
      }

      const data = await response.json();

      // ✅ IMPORTANT: Update AuthContext state
      login(data.access_token, email);

      toast.success("Login successful!");
      navigate("/");
    } catch (error: any) {
      toast.error(error.message || "Login failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen gradient-hero flex items-center justify-center px-4">
      <Card className="w-full max-w-md shadow-elevated border-border/50">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-20 h-20 flex items-center justify-center">
            <img
              src="/logo.png"
              alt="DentAI Logo"
              className="w-full h-full object-contain"
            />
          </div>
          <div>
            <CardTitle className="text-2xl font-display">
              Welcome back!
            </CardTitle>
            <CardDescription>
              Sign in to your DentoDetect account
            </CardDescription>
          </div>
        </CardHeader>

        <form onSubmit={handleLogin}>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
          </CardContent>

          <CardFooter className="flex flex-col gap-4">
            <Button
              type="submit"
              variant="gradient"
              size="lg"
              className="w-full"
              disabled={loading}
            >
              <LogIn className="w-4 h-4 mr-2" />
              {loading ? "Signing in..." : "Sign In"}
            </Button>

            <p className="text-sm text-muted-foreground">
              Don't have an account?{" "}
              <Link
                to="/register"
                className="text-primary hover:underline font-medium"
              >
                Sign up
              </Link>
            </p>
          </CardFooter>
        </form>
      </Card>
    </div>
  );
}
