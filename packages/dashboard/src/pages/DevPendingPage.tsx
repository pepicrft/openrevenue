import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";
import { api } from "../lib/api";

interface PendingToken {
  email: string;
  token: string;
  expiresAt: string;
}

export function DevPendingPage() {
  const [pending, setPending] = useState<PendingToken[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchPending = async () => {
    try {
      const result = await api.getPendingVerifications();
      setPending(result.pending);
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to fetch");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPending();
    const interval = setInterval(fetchPending, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-hero-radial text-white">
      <div className="min-h-screen bg-mesh px-4 py-12">
        <div className="max-w-2xl mx-auto">
          <div className="flex items-center justify-between mb-8">
            <div>
              <Badge className="mb-2">Dev Mode</Badge>
              <h1 className="font-display text-2xl font-semibold text-white">
                Pending Email Verifications
              </h1>
              <p className="text-sm text-white/60">
                Click a token to verify the email locally
              </p>
            </div>
            <Button onClick={fetchPending} variant="ghost">
              Refresh
            </Button>
          </div>

          {error && (
            <Card className="p-4 mb-4 border-red-500/30 bg-red-500/10">
              <p className="text-red-400">{error}</p>
              <p className="text-sm text-red-400/70 mt-1">
                Make sure the worker is running and RESEND_API_KEY is not set.
              </p>
            </Card>
          )}

          {isLoading ? (
            <Card className="p-8 text-center">
              <p className="text-white/60">Loading...</p>
            </Card>
          ) : pending.length === 0 ? (
            <Card className="p-8 text-center">
              <p className="text-white/60">No pending verifications</p>
              <Link to="/auth/login" className="mt-4 inline-block">
                <Button variant="ghost">Go to login</Button>
              </Link>
            </Card>
          ) : (
            <div className="space-y-4">
              {pending.map((item) => (
                <Card key={item.token} className="p-4">
                  <div className="flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-white font-medium truncate">
                        {item.email}
                      </p>
                      <p className="text-xs text-white/40 font-mono truncate">
                        {item.token}
                      </p>
                      <p className="text-xs text-white/40">
                        Expires: {new Date(item.expiresAt).toLocaleString()}
                      </p>
                    </div>
                    <Link to={`/auth/verify?token=${item.token}`}>
                      <Button>Verify</Button>
                    </Link>
                  </div>
                </Card>
              ))}
            </div>
          )}

          <div className="mt-8 text-center">
            <Link to="/auth/login">
              <Button variant="ghost">Back to login</Button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
