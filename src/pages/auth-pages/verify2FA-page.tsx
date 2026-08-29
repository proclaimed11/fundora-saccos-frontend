import { useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { Card, CardContent } from "../../components/ui/card";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from "../../components/ui/button";
import { Spinner } from "../../components/ui/spinner";

interface Verify2FAPageProps {
  email?: string;
  onVerifySuccess?: () => void;
}

const Verify2FAPage = ({ email, onVerifySuccess }: Verify2FAPageProps) => {
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [resent, setResent] = useState(false);

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!code) {
      setError("Enter the 6-digit code to continue.");
      return;
    }
    if (code.length !== 6) {
      setError("Code must be 6 digits.");
      return;
    }
    setError("");
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      onVerifySuccess?.();
    }, 900);
  }

  function handleResend() {
    setResending(true);
    setResent(false);
    setTimeout(() => {
      setResending(false);
      setResent(true);
    }, 900);
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background px-4">
      <div className="w-full max-w-sm">
        <div className="flex flex-col items-center mb-8">
          <div className="h-10 w-10 rounded-lg bg-primary flex items-center justify-center mb-4">
            <span className="text-primary-foreground text-sm font-medium">F</span>
          </div>
          <h1 className="text-xl font-medium text-foreground">Two-factor verification</h1>
          <p className="text-sm text-muted-foreground mt-1 text-center">
            {email
              ? <>Enter the 6-digit code sent to <span className="text-foreground">{email}</span></>
              : "Enter the 6-digit code sent to your email"}
          </p>
        </div>

        <Card className="shadow-sm">
          <CardContent className="pt-6">
            <form onSubmit={handleSubmit} noValidate>
              <div className="mb-2">
                <Label htmlFor="code" className="mb-1.5 block">
                  Verification code
                </Label>
                <Input
                  id="code"
                  type="text"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ""))}
                  placeholder="000000"
                  maxLength={6}
                  className="tracking-widest text-center text-lg"
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
                    Verifying...
                  </>
                ) : (
                  "Verify"
                )}
              </Button>
            </form>

            <div className="text-center mt-4">
              {resent ? (
                <p className="text-sm text-muted-foreground">Code resent. Check your email.</p>
              ) : (
                <button
                  type="button"
                  onClick={handleResend}
                  disabled={resending}
                  className="text-sm text-muted-foreground hover:text-foreground transition inline-flex items-center gap-2"
                >
                  {resending ? (
                    <>
                      <Spinner data-icon="inline-start" />
                      Resending...
                    </>
                  ) : (
                    "Didn't get a code? Resend"
                  )}
                </button>
              )}
            </div>
          </CardContent>
        </Card>

        <p className="text-center text-sm text-muted-foreground mt-6">
          <Link to="/login" className="text-foreground font-medium hover:underline">
            Back to sign in
          </Link>
        </p>
      </div>
    </div>
  );
};

export default Verify2FAPage;