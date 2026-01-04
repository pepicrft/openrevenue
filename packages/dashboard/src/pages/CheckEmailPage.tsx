import { useLocation, Link } from "react-router-dom";
import { Card } from "../components/ui/card";
import { Badge } from "../components/ui/badge";
import { Button } from "../components/ui/button";

export function CheckEmailPage() {
  const location = useLocation();
  const email = location.state?.email || "your email";

  return (
    <div className="min-h-screen bg-hero-radial text-white">
      <div className="min-h-screen bg-mesh flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8">
          <div className="flex flex-col items-center gap-6 text-center">
            <Badge>OpenRevenue</Badge>
            
            <div className="w-16 h-16 rounded-full bg-ember/20 flex items-center justify-center">
              <svg
                className="w-8 h-8 text-ember"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                />
              </svg>
            </div>

            <div>
              <h1 className="font-display text-2xl font-semibold text-white">
                Check your email
              </h1>
              <p className="mt-2 text-sm text-white/60">
                We sent a magic link to <strong className="text-white">{email}</strong>
              </p>
              <p className="mt-1 text-sm text-white/60">
                Click the link in the email to sign in.
              </p>
            </div>

            <div className="w-full pt-4 border-t border-white/10">
              <Link to="/auth/login">
                <Button variant="ghost" className="w-full">
                  Back to login
                </Button>
              </Link>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
