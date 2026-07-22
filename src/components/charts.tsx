"use client";

import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Line,
  LineChart,
  ReferenceLine,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { formatINRFull, formatMonth } from "@/lib/format";

/**
 * Chart layer. Single-series charts with one hue each, recessive grid,
 * rounded data-ends and hover tooltips. Colors validated ≥3:1 on white.
 */

const GRID = "#e7e5e4";
const AXIS = "#a8a29e";
const AMBER = "#d97706";
const BLUE = "#2563eb";
const GREEN = "#16a34a";
const RED = "#dc2626";

const axisProps = {
  stroke: AXIS,
  fontSize: 12,
  tickLine: false,
  axisLine: false,
} as const;

const tooltipStyle = {
  borderRadius: 12,
  border: "1px solid #e7e5e4",
  boxShadow: "0 4px 12px rgb(28 25 23 / 0.08)",
  fontSize: 13,
} as const;

export function BillTrendChart({
  data,
}: {
  data: { month: string; amount: number; flagged: boolean }[];
}) {
  const chartData = data.map((d) => ({ ...d, label: formatMonth(d.month) }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" />
        <YAxis
          {...axisProps}
          width={44}
          tickFormatter={(v: number) => `${(v / 100000).toFixed(0)}L`}
        />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [formatINRFull(Number(v)), "Bill amount"]}
          cursor={{ fill: "#f5f5f4" }}
        />
        <Bar dataKey="amount" radius={[4, 4, 0, 0]} maxBarSize={28}>
          {chartData.map((d) => (
            <Cell key={d.month} fill={d.flagged ? RED : AMBER} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function PfTrendChart({
  data,
  target = 0.9,
}: {
  data: { month: string; avgPf: number; penalty: number }[];
  target?: number;
}) {
  const chartData = data.map((d) => ({ ...d, label: formatMonth(d.month) }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <LineChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" />
        <YAxis {...axisProps} width={36} domain={[0.8, 1]} tickFormatter={(v: number) => v.toFixed(2)} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v, _n, entry) => {
            const penalty = (entry?.payload as { penalty?: number })?.penalty ?? 0;
            return [
              `${Number(v).toFixed(2)}${penalty > 0 ? ` · penalty ${formatINRFull(penalty)}` : ""}`,
              "Power factor",
            ];
          }}
        />
        <ReferenceLine
          y={target}
          stroke={AXIS}
          strokeDasharray="4 4"
          label={{ value: `Target ${target.toFixed(2)}`, fill: AXIS, fontSize: 11, position: "insideTopRight" }}
        />
        <Line
          type="monotone"
          dataKey="avgPf"
          stroke={BLUE}
          strokeWidth={2}
          dot={(props) => {
            const { cx, cy, payload, index } = props as {
              cx: number;
              cy: number;
              payload: { penalty: number };
              index: number;
            };
            return (
              <circle
                key={index}
                cx={cx}
                cy={cy}
                r={payload.penalty > 0 ? 5 : 3}
                fill={payload.penalty > 0 ? RED : BLUE}
                stroke="#fff"
                strokeWidth={2}
              />
            );
          }}
        />
      </LineChart>
    </ResponsiveContainer>
  );
}

export function DemandTrendChart({
  data,
  contracted,
  sanctioned,
}: {
  data: { month: string; recordedMdKva: number }[];
  contracted: number;
  sanctioned: number;
}) {
  const chartData = data.map((d) => ({ ...d, label: formatMonth(d.month) }));
  return (
    <ResponsiveContainer width="100%" height={240}>
      <BarChart data={chartData} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="label" {...axisProps} interval="preserveStartEnd" />
        <YAxis {...axisProps} width={40} domain={[0, Math.ceil(sanctioned * 1.1)]} />
        <Tooltip
          contentStyle={tooltipStyle}
          formatter={(v) => [`${v} kVA`, "Recorded maximum demand"]}
          cursor={{ fill: "#f5f5f4" }}
        />
        <ReferenceLine
          y={contracted}
          stroke={RED}
          strokeDasharray="4 4"
          label={{ value: `Contracted ${contracted} kVA`, fill: RED, fontSize: 11, position: "insideTopRight" }}
        />
        <Bar dataKey="recordedMdKva" radius={[4, 4, 0, 0]} maxBarSize={28}>
          {chartData.map((d) => (
            <Cell key={d.month} fill={d.recordedMdKva > contracted ? RED : AMBER} />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

export function TodProfileChart({ data }: { data: { hour: string; kva: number }[] }) {
  return (
    <ResponsiveContainer width="100%" height={220}>
      <AreaChart data={data} margin={{ top: 8, right: 8, left: 8, bottom: 0 }}>
        <defs>
          <linearGradient id="todFill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={GREEN} stopOpacity={0.25} />
            <stop offset="100%" stopColor={GREEN} stopOpacity={0.02} />
          </linearGradient>
        </defs>
        <CartesianGrid vertical={false} stroke={GRID} />
        <XAxis dataKey="hour" {...axisProps} interval="preserveStartEnd" />
        <YAxis {...axisProps} width={40} />
        <Tooltip contentStyle={tooltipStyle} formatter={(v) => [`${v} kVA`, "Typical demand"]} />
        <Area type="monotone" dataKey="kva" stroke={GREEN} strokeWidth={2} fill="url(#todFill)" />
      </AreaChart>
    </ResponsiveContainer>
  );
}
