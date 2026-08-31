import { useState } from "react";
import type { FormEvent } from "react";
import { Link, useLocation} from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { Eye, EyeOff } from "lucide-react";
import { resetPassword } from "@/api/auth/auth";

const ResetPasswordPage = () => {
  const location = useLocation();
  const email = (location.state as { email?: string } | null)?.email ?? "";

  const [code, setCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) {
      setError("Missing email — please restart the reset process from the beginning.");
      return;
    }
    if (!code || !newPassword || !confirmPassword) {
      setError("Fill in all fields to continue.");
      return;
    }
    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await resetPassword({ email, code, newPassword });

      if (!response.success) {
        setError(response.message);
        return;
      }

      setSuccess(true);
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
          <h1 className="text-xl font-medium text-foreground">Set a new password</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            {email
              ? <>Enter the code sent to <span className="text-foreground">{email}</span> and choose a new password</>
              : "Enter the code sent to your email and choose a new password"}
          </p>
        </div>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            {success ? (
              <div className="text-center py-2">
                <p className="text-sm text-foreground mb-1">Password reset</p>
                <p className="text-sm text-muted-foreground mb-4">
                  Your password has been updated successfully
                </p>
                <Link to="/login">
                  <Button className="w-full">Back to sign in</Button>
                </Link>
              </div>
            ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-4">
                  <Label htmlFor="code" className="mb-1.5 block">
                    Reset code
                  </Label>
                  <Input
                    id="code"
                    type="text"
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    value={code}
                    onChange={(e) => setCode(e.target.value)}
                    placeholder="6-digit code"
                    maxLength={6}
                  />
                </div>

                <div className="mb-4">
                  <Label htmlFor="newPassword" className="mb-1.5 block">
                    New password
                  </Label>
                  <div className="relative">
                    <Input
                      id="newPassword"
                      type={showPassword ? "text" : "password"}
                      autoComplete="new-password"
                      value={newPassword}
                      onChange={(e) => setNewPassword(e.target.value)}
                      placeholder="Enter new password"
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

                <div className="mb-2">
                  <Label htmlFor="confirmPassword" className="mb-1.5 block">
                    Confirm password
                  </Label>
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    autoComplete="new-password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Re-enter new password"
                  />
                </div>

                {error && (
                  <p className="text-sm text-destructive mb-3" role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" disabled={loading} className="w-full mt-3">
                  {loading ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      Resetting password...
                    </>
                  ) : (
                    "Reset password"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        {!success && (
          <p className="text-center text-sm text-muted-foreground mt-6">
            Remembered your password?{" "}
            <Link to="/login" className="text-foreground font-medium hover:underline">
              Back to sign in
            </Link>
          </p>
        )}
      </div>
    </div>
  );
};

export default ResetPasswordPage;