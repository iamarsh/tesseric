"use client";

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface SeverityChartProps {
  data: {
    CRITICAL: number;
    HIGH: number;
    MEDIUM: number;
    LOW: number;
  };
  loading?: boolean;
}

const COLORS = {
  CRITICAL: "#ef4444", // red-500
  HIGH: "#f97316", // orange-500
  MEDIUM: "#f59e0b", // amber-500
  LOW: "#3b82f6", // blue-500
};

export function SeverityChart({ data, loading = false }: SeverityChartProps) {
  if (loading) {
    return (
      <div className="relative overflow-hidden rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm">
        <div className="animate-pulse space-y-4">
          <div className="h-6 w-48 bg-muted/50 rounded" />
          <div className="h-64 flex items-center justify-center">
            <div className="h-48 w-48 rounded-full bg-muted/50" />
          </div>
        </div>
      </div>
    );
  }

  // Transform data for Recharts
  const chartData = Object.entries(data).map(([name, value]) => ({
    name,
    value,
  }));

  const totalFindings = Object.values(data).reduce((sum, val) => sum + val, 0);

  return (
    <div className="relative overflow-hidden rounded-xl border border-border bg-card/50 p-6 backdrop-blur-sm">
      <div className="space-y-4">
        {/* Header */}
        <div>
          <h3 className="text-lg font-semibold">Severity Distribution</h3>
          <p className="text-sm text-muted-foreground">
            Total findings: {totalFindings.toLocaleString()}
          </p>
        </div>

        {/* Chart */}
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={chartData}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) =>
                percent ? `${name}: ${(percent * 100).toFixed(0)}%` : name
              }
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {chartData.map((entry, index) => (
                <Cell
                  key={`cell-${index}`}
                  fill={COLORS[entry.name as keyof typeof COLORS]}
                  className="stroke-background stroke-2"
                />
              ))}
            </Pie>
            <Tooltip
              contentStyle={{
                backgroundColor: "hsl(var(--card))",
                border: "1px solid hsl(var(--border))",
                borderRadius: "8px",
              }}
              formatter={(value: number | undefined) =>
                value !== undefined ? [value.toLocaleString(), "Findings"] : ["0", "Findings"]
              }
            />
            <Legend
              verticalAlign="bottom"
              height={36}
              formatter={(value) => (
                <span className="text-sm text-foreground">{value}</span>
              )}
            />
          </PieChart>
        </ResponsiveContainer>

        {/* Legend with counts */}
        <div className="grid grid-cols-2 gap-3 border-t border-border pt-4">
          {Object.entries(data).map(([severity, count]) => (
            <div key={severity} className="flex items-center gap-2">
              <div
                className="h-3 w-3 rounded-full"
                style={{
                  backgroundColor: COLORS[severity as keyof typeof COLORS],
                }}
              />
              <div className="flex-1">
                <p className="text-xs font-medium">{severity}</p>
                <p className="text-sm text-muted-foreground">
                  {count.toLocaleString()} issues
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
