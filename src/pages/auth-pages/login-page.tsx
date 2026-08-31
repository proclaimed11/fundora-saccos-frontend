import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Checkbox } from "../../components/ui/checkbox";
import { Spinner } from "../../components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";
import { login } from "@/api/auth/auth";
import { saveSession } from "@/lib/auth/auth";
import { toast } from "@/components/ui/toast";

interface LoginPageProps {
  onLoginSuccess: () => void;
}

const LoginPage = ({ onLoginSuccess }: LoginPageProps) => {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!username || !password) {
      setError("Enter your username and password to continue.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await login({ username, password });

      if (!response.success) {
        setError(response.message);
        return;
      }

      if (!response.token) {
        setError("This account requires additional verification, which isn't supported yet.");
        return;
      }

      saveSession(response.token, {
        userId: response.userId,
        username: response.username,
        role: response.role,
      });

      saveSession(response.token, {
        userId: response.userId,
        username: response.username,
        role: response.role,
      });

      toast.add({
        title: "Login successful",
        description: `Welcome back, ${response.username}.`,
        type: "success",
      })

      onLoginSuccess();
    } catch (err) {
      setError("Unable to reach the server. Please try again.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground text-sm font-medium">F</span>
          </div>
          <h1 className="text-xl font-medium text-foreground">Sign in to Fundora</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Enter your credentials to access your account
          </p>
        </div>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-4">
                <Label htmlFor="username" className="mb-1.5 block">
                  Username
                </Label>
                <Input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="admin"
                />
              </div>

              <div className="mb-2">
                <div className="flex items-center justify-between mb-1.5">
                  <Label htmlFor="password">Password</Label>
                  <Link
                    to="/forgot-password"
                    className="text-xs text-muted-foreground hover:text-foreground transition"
                  >
                    Forgot password?
                  </Link>
                </div>
                <div className="relative">
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter your password"
                    className="pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((v) => !v)}
                    className="absolute right-0 top-0 h-9 w-9 flex items-center justify-center text-muted-foreground hover:text-foreground transition"
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              {error && (
                <p className="text-sm text-destructive mb-3" role="alert">
                  {error}
                </p>
              )}

              <div className="flex items-center gap-2 mb-5 mt-3">
                <Checkbox
                  id="remember"
                  checked={rememberMe}
                  onCheckedChange={(checked) => setRememberMe(checked === true)}
                />
                <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground cursor-pointer">
                  Keep me signed in
                </Label>
              </div>

              <Button type="submit" disabled={loading} className="w-full">
                {loading ? (
                  <>
                    <Spinner data-icon="inline-start" />
                    Signing in...
                  </>
                ) : (
                  "Sign in"
                )}
              </Button>
            </form>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{" "}
          <a href="#" className="text-foreground font-medium hover:underline">
            Contact your admin
          </a>
        </p>
      </div>
    </div>
  );
};

export default LoginPage;