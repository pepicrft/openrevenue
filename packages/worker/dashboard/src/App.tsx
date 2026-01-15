import { useEffect, useMemo, useState } from "react";
import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { MetricCard } from "./components/metric-card";

const API_BASE_URL =
  import.meta.env.VITE_API_BASE_URL ??
  (import.meta.env.DEV
    ? "http://127.0.0.1:8787"
    : typeof window !== "undefined"
      ? window.location.origin
      : "http://127.0.0.1:8787");
const ADMIN_USER = import.meta.env.VITE_ADMIN_USER ?? "admin";
const ADMIN_PASSWORD = import.meta.env.VITE_ADMIN_PASSWORD ?? "";
const APP_ID = import.meta.env.VITE_APP_ID ?? "";

type OverviewResponse = {
  app_id: string;
  metrics: {
    active_subscribers: number;
    mrr_cents: number;
    churn_events_7d: number;
    offerings: number;
    products: number;
  };
  revenue_series: Array<{ day: string; total: number }>;
  activity: Array<{ type: string; app_user_id: string | null; product_id: string | null; created_at: string }>;
};

const seedFallback: OverviewResponse = {
  app_id: "",
  metrics: {
    active_subscribers: 0,
    mrr_cents: 0,
    churn_events_7d: 0,
    offerings: 0,
    products: 0,
  },
  revenue_series: [],
  activity: [],
};

export default function App() {
  const [overview, setOverview] = useState<OverviewResponse>(seedFallback);
  const [status, setStatus] = useState<"idle" | "loading" | "ready" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    const fetchOverview = async () => {
      setStatus("loading");
      setError(null);
      try {
        const authHeader = ADMIN_PASSWORD
          ? `Basic ${btoa(`${ADMIN_USER}:${ADMIN_PASSWORD}`)}`
          : undefined;
        const url = new URL(`${API_BASE_URL}/admin/overview`);
        if (APP_ID) {
          url.searchParams.set("app_id", APP_ID);
        }
        const response = await fetch(url.toString(), {
          headers: authHeader ? { Authorization: authHeader } : undefined,
        });
        if (!response.ok) {
          throw new Error(`Failed to load overview (${response.status})`);
        }
        const data = (await response.json()) as OverviewResponse;
        if (active) {
          setOverview(data);
          setStatus("ready");
        }
      } catch (fetchError) {
        if (active) {
          setStatus("error");
          setError(fetchError instanceof Error ? fetchError.message : "Failed to load overview");
        }
      }
    };

    fetchOverview();
    return () => {
      active = false;
    };
  }, []);

  const revenueSeries = useMemo(() => {
    if (overview.revenue_series.length === 0) {
      return Array.from({ length: 14 }, (_, index) => ({
        day: `Day ${index + 1}`,
        total: 0,
      }));
    }
    return overview.revenue_series;
  }, [overview.revenue_series]);

  const mrrDisplay = formatCurrency(overview.metrics.mrr_cents / 100);
  const churnRate = overview.metrics.active_subscribers
    ? ((overview.metrics.churn_events_7d / overview.metrics.active_subscribers) * 100).toFixed(1)
    : "0.0";

  return (
    <div className="min-h-screen bg-hero-radial text-white">
      <div className="min-h-screen bg-mesh">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-10 px-6 py-12">
          <header className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-col gap-4">
              <Badge>OpenRevenue Console</Badge>
              <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
                Subscription intelligence
                <span className="text-ember"> for your edge stack.</span>
              </h1>
              <p className="max-w-2xl text-base text-white/70">
                Monitor receipts, subscriptions, and entitlements with a worker-native backend.
                Everything below is backed by D1 + KV, so the data you see matches production.
              </p>
              {status === "error" && (
                <p className="text-sm text-ember">
                  {error ?? "Could not load overview. Check admin access or backend status."}
                </p>
              )}
            </div>
            <div className="flex items-center gap-3">
              <Button>Deploy Worker</Button>
              <Button variant="ghost">API reference</Button>
            </div>
          </header>

          <section className="grid gap-6 md:grid-cols-3">
            <MetricCard
              label="Active Subscribers"
              value={formatNumber(overview.metrics.active_subscribers)}
              footnote="Entitlements currently active"
            />
            <MetricCard
              label="Monthly Recurring"
              value={mrrDisplay}
              footnote="Last 30 days validated"
            />
            <MetricCard
              label="Churn Watch"
              value={`${churnRate}%`}
              footnote="Cancellations in 7 days"
            />
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <Card className="flex flex-col gap-6">
              <div className="flex flex-wrap items-center justify-between gap-4">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                    Revenue pulse
                  </p>
                  <h2 className="font-display text-2xl text-white">Validated receipts</h2>
                </div>
                <Button variant="ghost">View receipts</Button>
              </div>
              <Sparkline data={revenueSeries.map((point) => point.total)} />
              <div className="grid gap-4 sm:grid-cols-2">
                <Card className="border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Offerings</p>
                  <p className="mt-2 font-display text-2xl text-white">
                    {formatNumber(overview.metrics.offerings)}
                  </p>
                </Card>
                <Card className="border border-white/10 bg-white/5 p-4">
                  <p className="text-xs uppercase tracking-[0.3em] text-white/50">Products</p>
                  <p className="mt-2 font-display text-2xl text-white">
                    {formatNumber(overview.metrics.products)}
                  </p>
                </Card>
              </div>
            </Card>

            <Card className="flex flex-col gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/50">Live feed</p>
                <h2 className="font-display text-2xl text-white">Recent activity</h2>
              </div>
              <div className="flex flex-col gap-4">
                {overview.activity.length === 0 && status !== "loading" ? (
                  <div className="rounded-2xl border border-white/10 bg-white/5 px-4 py-6 text-sm text-white/60">
                    Seed data to see real receipt and webhook activity.
                  </div>
                ) : (
                  overview.activity.map((item) => (
                    <div
                      key={`${item.type}-${item.created_at}`}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                    >
                      <div>
                        <p className="text-base text-white">{formatEventLabel(item.type)}</p>
                        <p className="text-sm text-white/50">
                          {item.product_id ?? "N/A"} · {item.app_user_id ?? ""}
                        </p>
                      </div>
                      <p className="text-sm text-white/40">{formatRelativeTime(item.created_at)}</p>
                    </div>
                  ))
                )}
              </div>
            </Card>
          </section>

          <section className="grid gap-6 md:grid-cols-[1.2fr_0.8fr]">
            <Card className="flex flex-col gap-4">
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">Key paths</p>
              <h2 className="font-display text-2xl text-white">API flow snapshot</h2>
              <div className="grid gap-4 md:grid-cols-3">
                {[
                  "POST /v1/receipts",
                  "GET /v1/subscribers/:id",
                  "POST /v1/webhooks",
                ].map((endpoint) => (
                  <div
                    key={endpoint}
                    className="rounded-2xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-white/80"
                  >
                    {endpoint}
                  </div>
                ))}
              </div>
            </Card>

            <Card className="flex flex-col gap-4">
              <p className="text-sm uppercase tracking-[0.3em] text-white/50">Connection</p>
              <h2 className="font-display text-2xl text-white">Admin API</h2>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-sm">
                <p className="text-white/70">BASE URL</p>
                <p className="text-ember">{API_BASE_URL}</p>
                <div className="mt-4">
                  <p className="text-white/70">APP ID</p>
                  <p className="text-white">{overview.app_id || "set VITE_APP_ID"}</p>
                </div>
              </div>
              <p className="text-sm text-white/60">
                Use the admin password to unlock the overview endpoint and manage apps.
              </p>
              <Button variant="ghost">Manage apps</Button>
            </Card>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/50">
            <p>OpenRevenue Console UI · Worker-native analytics</p>
            <p>Cloudflare-first, D1 + KV backed.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) {
    return "$0";
  }
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    maximumFractionDigits: 0,
  }).format(value);
}

function formatNumber(value: number) {
  return new Intl.NumberFormat("en-US").format(value);
}

function formatEventLabel(type: string) {
  switch (type) {
    case "receipt_validated":
      return "Receipt validated";
    case "webhook_cancellation":
      return "Cancellation webhook";
    case "webhook_renewal":
      return "Renewal webhook";
    default:
      return type.replace(/_/g, " ");
  }
}

function formatRelativeTime(value: string) {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return "";
  }
  const diffMs = Date.now() - date.getTime();
  const diffMins = Math.round(diffMs / 60000);
  if (diffMins < 60) {
    return `${diffMins}m ago`;
  }
  const diffHours = Math.round(diffMins / 60);
  if (diffHours < 24) {
    return `${diffHours}h ago`;
  }
  const diffDays = Math.round(diffHours / 24);
  return `${diffDays}d ago`;
}

function Sparkline({ data }: { data: number[] }) {
  const width = 240;
  const height = 80;
  const max = Math.max(...data, 1);
  const points = data
    .map((value, index) => {
      const x = (index / Math.max(data.length - 1, 1)) * width;
      const y = height - (value / max) * height;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="rounded-2xl border border-white/10 bg-white/5 p-4">
      <svg viewBox={`0 0 ${width} ${height}`} className="h-24 w-full">
        <polyline
          fill="none"
          stroke="rgba(243, 111, 62, 0.9)"
          strokeWidth="3"
          points={points}
        />
        <polyline
          fill="rgba(243, 111, 62, 0.2)"
          stroke="none"
          points={`0,${height} ${points} ${width},${height}`}
        />
      </svg>
    </div>
  );
}
