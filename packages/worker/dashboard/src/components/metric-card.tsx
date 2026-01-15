import { Card } from "./ui/card";

type MetricCardProps = {
  label: string;
  value: string;
  footnote: string;
};

export function MetricCard({ label, value, footnote }: MetricCardProps) {
  return (
    <Card className="flex flex-col gap-4">
      <p className="text-xs uppercase tracking-[0.3em] text-white/60">{label}</p>
      <p className="font-display text-3xl font-semibold text-white">{value}</p>
      <p className="text-sm text-white/50">{footnote}</p>
    </Card>
  );
}
