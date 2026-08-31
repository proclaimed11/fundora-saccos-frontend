import { useState } from "react";
import type { FormEvent } from "react";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";
import { Link, useNavigate } from "react-router-dom";
import { forgotPassword } from "@/api/auth/auth";

const ForgotPasswordPage = () => {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!email) {
      setError("Enter your email to continue.");
      return;
    }
    setError("");
    setLoading(true);

    try {
      const response = await forgotPassword(email);

      if (!response.success) {
        setError(response.message);
        return;
      }

      setSent(true);
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
          <h1 className="text-xl font-medium text-foreground">Reset your password</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            Enter your email and we'll send you a code to reset your password
          </p>
        </div>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            {sent ? (
                <div className="text-center py-2">
                    <p className="text-sm text-foreground mb-1">Check your email</p>
                    <p className="text-sm text-muted-foreground mb-4">
                    We've sent a reset code to <span className="text-foreground">{email}</span>
                    </p>
                    <Button className="w-full" onClick={() => navigate("/reset-password", { state: { email } })}>
                      Enter reset code
                    </Button>
                </div>
                ) : (
              <form onSubmit={handleSubmit} noValidate>
                <div className="mb-2">
                  <Label htmlFor="email" className="mb-1.5 block">
                    Email
                  </Label>
                  <Input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@company.com"
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
                      Sending code...
                    </>
                  ) : (
                    "Send reset code"
                  )}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
        Remembered your password?{" "}
        <Link to="/login" className="text-foreground font-medium hover:underline">
            Back to sign in
        </Link>
        </p>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;