import { Badge } from "./components/ui/badge";
import { Button } from "./components/ui/button";
import { Card } from "./components/ui/card";
import { MetricCard } from "./components/metric-card";

const metrics = [
  {
    label: "Active Subscribers",
    value: "2,481",
    footnote: "30-day rolling window",
  },
  {
    label: "Monthly Recurring",
    value: "$38,120",
    footnote: "D1 + KV synced",
  },
  {
    label: "Churn Watch",
    value: "1.8%",
    footnote: "Past 7 days",
  },
];

const activity = [
  {
    label: "Receipt validation",
    detail: "Apple App Store",
    time: "2m ago",
  },
  {
    label: "Entitlement refresh",
    detail: "pro_monthly",
    time: "12m ago",
  },
  {
    label: "Webhook relay",
    detail: "Slack alerts",
    time: "28m ago",
  },
];

export default function App() {
  return (
    <div className="min-h-screen bg-hero-radial text-white">
      <div className="min-h-screen bg-mesh">
        <div className="mx-auto flex min-h-screen max-w-6xl flex-col gap-12 px-6 py-12">
          <header className="flex flex-wrap items-center justify-between gap-6">
            <div className="flex flex-col gap-4">
              <Badge>OpenRevenue</Badge>
              <h1 className="font-display text-4xl font-semibold text-white md:text-5xl">
                RevenueCat-compatible backend
                <span className="text-ember"> for Cloudflare Workers.</span>
              </h1>
              <p className="max-w-2xl text-base text-white/70">
                Track subscriptions, map entitlements, and ship receipts through a
                single edge worker. Designed to go from local to production with
                one click.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Button>Deploy Worker</Button>
              <Button variant="ghost">Open API docs</Button>
            </div>
          </header>

          <section className="grid gap-6 md:grid-cols-3">
            {metrics.map((metric) => (
              <MetricCard key={metric.label} {...metric} />
            ))}
          </section>

          <section className="grid gap-6 lg:grid-cols-[1.5fr_1fr]">
            <Card className="flex flex-col gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                    Live traffic
                  </p>
                  <h2 className="font-display text-2xl text-white">
                    Recent verification stream
                  </h2>
                </div>
                <Button variant="ghost">View logs</Button>
              </div>
              <div className="flex flex-col gap-4">
                {activity.map((item) => (
                  <div
                    key={item.label}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3"
                  >
                    <div>
                      <p className="text-base text-white">{item.label}</p>
                      <p className="text-sm text-white/50">{item.detail}</p>
                    </div>
                    <p className="text-sm text-white/40">{item.time}</p>
                  </div>
                ))}
              </div>
            </Card>

            <Card className="flex flex-col gap-6">
              <div>
                <p className="text-sm uppercase tracking-[0.3em] text-white/50">
                  Quick start
                </p>
                <h2 className="font-display text-2xl text-white">
                  Keys & environment
                </h2>
              </div>
              <div className="rounded-2xl border border-white/10 bg-black/30 p-4 font-mono text-sm">
                <p className="text-white/70">PUBLIC API KEY</p>
                <p className="text-ember">rc_test_3f64a1b2</p>
                <div className="mt-4">
                  <p className="text-white/70">WORKER URL</p>
                  <p className="text-white">https://openrevenue.example.workers.dev</p>
                </div>
              </div>
              <p className="text-sm text-white/60">
                Replace the sample keys with the API key you seed in D1. RevenueCat
                SDKs can point directly at your worker URL.
              </p>
              <Button>Generate API key</Button>
            </Card>
          </section>

          <footer className="flex flex-wrap items-center justify-between gap-4 border-t border-white/10 pt-6 text-sm text-white/50">
            <p>OpenRevenue Console UI · React + shadcn/ui styling</p>
            <p>Edge-ready, worker-first, deployable in minutes.</p>
          </footer>
        </div>
      </div>
    </div>
  );
}
