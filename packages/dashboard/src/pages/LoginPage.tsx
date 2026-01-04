import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "../components/ui/button";
import { Card } from "../components/ui/card";
import { Input } from "../components/ui/input";
import { Badge } from "../components/ui/badge";
import { useAuth } from "../hooks/useAuth";

export function LoginPage() {
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [devToken, setDevToken] = useState<string | null>(null);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      const result = await login(email);
      
      if (result.token) {
        // Dev mode: show token for local testing
        setDevToken(result.token);
      } else {
        // Production: email was sent
        navigate("/auth/check-email", { state: { email } });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to send verification email");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDevVerify = () => {
    if (devToken) {
      navigate(`/auth/verify?token=${devToken}`);
    }
  };

  return (
    <div className="min-h-screen bg-hero-radial text-white">
      <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-6">
            <Badge>OpenRevenue</Badge>
            
            <div className="text-center">
              <h1 className="font-display text-2xl font-semibold text-white">
                Sign in to your account
              </h1>
              <p className="mt-2 text-sm text-white/60">
                Enter your email to receive a magic link
              </p>
            </div>

            <form onSubmit={handleSubmit} className="w-full space-y-4">
              <div>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isSubmitting}
                />
              </div>

              {error && (
                <p className="text-sm text-red-400">{error}</p>
              )}

              <Button
                type="submit"
                className="w-full"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Sending..." : "Send magic link"}
              </Button>
            </form>

            {devToken && (
              <div className="w-full rounded-xl border border-amber-500/30 bg-amber-500/10 p-4">
                <p className="text-sm text-amber-200 mb-2">
                  <strong>Dev Mode:</strong> No email service configured.
                </p>
                <p className="text-xs text-amber-200/70 mb-3 font-mono break-all">
                  Token: {devToken}
                </p>
                <Button
                  onClick={handleDevVerify}
                  variant="ghost"
                  className="w-full border border-amber-500/30"
                >
                  Verify Now (Dev)
                </Button>
              </div>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
