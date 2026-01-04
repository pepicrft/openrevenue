import { useEffect, useState } from "react";
import { useSearchParams, useNavigate, Link } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { useAuth } from "../hooks/useAuth";

export function VerifyPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { verify } = useAuth();
  const [status, setStatus] = useState<"verifying" | "success" | "error">("verifying");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const token = searchParams.get("token");
    
    if (!token) {
      setStatus("error");
      setError("Missing verification token");
      return;
    }

    const verifyToken = async () => {
      try {
        await verify(token);
        setStatus("success");
        // Redirect to dashboard after short delay
        setTimeout(() => navigate("/"), 1500);
      } catch (err) {
        setStatus("error");
        setError(err instanceof Error ? err.message : "Verification failed");
      }
    };

    verifyToken();
  }, [searchParams, verify, navigate]);

  return (
    <div className="min-h-screen bg-hero-radial text-white">
      <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <Badge>OpenRevenue</Badge>

            {status === "verifying" && (
              <>
                <div className="w-16 h-16 rounded-full bg-white/10 flex items-center justify-center animate-pulse">
                  <svg
                    className="w-8 h-8 text-white/50 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="font-display text-2xl font-semibold text-white">
                    Verifying...
                  </h1>
                  <p className="mt-2 text-sm text-white/60">
                    Please wait while we verify your email
                  </p>
                </div>
              </>
            )}

            {status === "success" && (
              <>
                <div className="w-16 h-16 rounded-full bg-green-500/20 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-green-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="font-display text-2xl font-semibold text-white">
                    Email verified!
                  </h1>
                  <p className="mt-2 text-sm text-white/60">
                    Redirecting you to the dashboard...
                  </p>
                </div>
              </>
            )}

            {status === "error" && (
              <>
                <div className="w-16 h-16 rounded-full bg-red-500/20 flex items-center justify-center">
                  <svg
                    className="w-8 h-8 text-red-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                </div>
                <div>
                  <h1 className="font-display text-2xl font-semibold text-white">
                    Verification failed
                  </h1>
                  <p className="mt-2 text-sm text-red-400">
                    {error}
                  </p>
                </div>
                <Link to="/auth/login" className="w-full">
                  <Button className="w-full">Try again</Button>
                </Link>
              </>
            )}
          </div>
        </Card>
      </div>
    </div>
  );
}
