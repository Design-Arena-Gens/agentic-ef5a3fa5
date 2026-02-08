"use client";

import Link from "next/link";
import { useMemo, useState } from "react";

type CalculatorMode = "markup" | "margin" | "price";

type CalculatorInputs = {
  baseCost: number;
  extraCost: number;
  overhead: number;
  freight: number;
  units: number;
  markupPercent: number;
  marginPercent: number;
  priceOverride: number;
  discountPercent: number;
  taxPercent: number;
  targetProfit: number;
};

const defaultInputs: CalculatorInputs = {
  baseCost: 120,
  extraCost: 18,
  overhead: 12,
  freight: 6,
  units: 150,
  markupPercent: 38,
  marginPercent: 24,
  priceOverride: 0,
  discountPercent: 5,
  taxPercent: 8.75,
  targetProfit: 25000,
};

const currency = new Intl.NumberFormat("en-US", {
  style: "currency",
  currency: "USD",
  maximumFractionDigits: 2,
});

const percent = new Intl.NumberFormat("en-US", {
  style: "percent",
  minimumFractionDigits: 1,
  maximumFractionDigits: 1,
});

const scenarioBlueprints = [
  {
    name: "Value Anchor",
    delta: -10,
    description:
      "Lower entry price to create a gateway offer while remaining contribution-positive.",
  },
  {
    name: "Core",
    delta: 0,
    description:
      "Precisely matches your configured markup or margin assumptions.",
  },
  {
    name: "Premium",
    delta: 8,
    description:
      "Elevated positioning that captures additional profit for high-trust segments.",
  },
  {
    name: "Executive",
    delta: 16,
    description:
      "Board-level pricing used for urgent orders, white-glove service, or limited capacity.",
  },
];

function formatCurrency(value: number) {
  if (!Number.isFinite(value)) return "—";
  return currency.format(value);
}

function formatPercent(value: number) {
  if (!Number.isFinite(value)) return "—";
  return percent.format(value);
}

export default function Home() {
  const [mode, setMode] = useState<CalculatorMode>("markup");
  const [inputs, setInputs] = useState<CalculatorInputs>(defaultInputs);

  const metrics = useMemo(() => {
    const effectiveCost =
      inputs.baseCost + inputs.extraCost + inputs.overhead + inputs.freight;
    const markupPrice =
      inputs.markupPercent > 0
        ? effectiveCost * (1 + inputs.markupPercent / 100)
        : undefined;
    const marginPrice =
      inputs.marginPercent >= 100
        ? undefined
        : effectiveCost / (1 - inputs.marginPercent / 100);

    const selectedPrice = (() => {
      if (inputs.priceOverride > 0) return inputs.priceOverride;
      if (mode === "margin" && marginPrice) return marginPrice;
      if (mode === "markup" && markupPrice) return markupPrice;
      if (mode === "price" && inputs.priceOverride > 0)
        return inputs.priceOverride;
      if (markupPrice) return markupPrice;
      if (marginPrice) return marginPrice;
      return effectiveCost;
    })();

    const discountedPrice = selectedPrice * (1 - inputs.discountPercent / 100);
    const taxAmount = discountedPrice * (inputs.taxPercent / 100);
    const finalCustomerPrice = discountedPrice + taxAmount;
    const profitPerUnit = discountedPrice - effectiveCost;
    const achievedMargin =
      discountedPrice === 0 ? 0 : profitPerUnit / discountedPrice;
    const achievedMarkup =
      effectiveCost === 0 ? 0 : profitPerUnit / effectiveCost;
    const totalRevenue = finalCustomerPrice * inputs.units;
    const totalCost = effectiveCost * inputs.units;
    const totalProfit = profitPerUnit * inputs.units;
    const contributionPerUnit =
      selectedPrice > effectiveCost ? selectedPrice - effectiveCost : 0;
    const breakevenUnits =
      contributionPerUnit <= 0
        ? undefined
        : Math.ceil(inputs.targetProfit / contributionPerUnit);

    const scenarioDetails = scenarioBlueprints.map((scenario) => {
      const markup = (inputs.markupPercent + scenario.delta) / 100;
      const price = effectiveCost * (1 + markup);
      const discountAdjustedPrice = price * (1 - inputs.discountPercent / 100);
      const profit = discountAdjustedPrice - effectiveCost;
      return {
        ...scenario,
        markupValue: markup,
        price,
        profit,
        margin: discountAdjustedPrice === 0 ? 0 : profit / discountAdjustedPrice,
        totalProfit: profit * inputs.units,
      };
    });

    const pricingToHitTarget =
      inputs.targetProfit <= 0 || inputs.units <= 0
        ? undefined
        : effectiveCost + inputs.targetProfit / inputs.units;

    const markupToHitTarget =
      pricingToHitTarget && effectiveCost > 0
        ? pricingToHitTarget / effectiveCost - 1
        : undefined;

    return {
      effectiveCost,
      markupPrice,
      marginPrice,
      selectedPrice,
      discountedPrice,
      taxAmount,
      finalCustomerPrice,
      profitPerUnit,
      achievedMargin,
      achievedMarkup,
      totalRevenue,
      totalCost,
      totalProfit,
      breakevenUnits,
      scenarioDetails,
      pricingToHitTarget,
      markupToHitTarget,
    };
  }, [inputs, mode]);

  const handleChange = (key: keyof CalculatorInputs) => (value: number) => {
    setInputs((prev) => ({
      ...prev,
      [key]: Number.isFinite(value) ? value : prev[key],
    }));
  };

  return (
    <div className="relative min-h-screen">
      <GradientHalo />
      <main className="relative z-10 mx-auto flex w-full max-w-7xl flex-col gap-12 px-6 py-12 lg:px-12 lg:py-16">
        <header className="flex flex-col gap-6">
          <span className="inline-flex w-fit items-center gap-2 rounded-full border border-white/10 bg-white/5 px-3 py-1 text-xs uppercase tracking-[0.3em] text-slate-200">
            Apex Markup Studio
          </span>
          <h1 className="max-w-3xl text-4xl font-semibold leading-tight text-slate-50 sm:text-5xl">
            Premium, investor-grade markup intelligence for confident pricing.
          </h1>
          <p className="max-w-3xl text-lg text-slate-300 sm:text-xl">
            Engineer precise sell prices in seconds—factor overhead, logistics,
            discounts, tax, and profit ambitions, then share via web, Google
            Sheets, or Excel. Perfect for finance, revenue, and operations
            executives who demand clarity.
          </p>
          <div className="flex flex-wrap gap-3 text-sm text-slate-300">
            <Tag>P&L safe</Tag>
            <Tag>Scenario aware</Tag>
            <Tag>Global ready</Tag>
            <Tag>Enterprise friendly</Tag>
          </div>
        </header>

        <section className="grid gap-8 lg:grid-cols-[360px,1fr]">
          <div className="flex flex-col gap-6 rounded-3xl border border-white/10 bg-white/5 p-6 shadow-[0_15px_40px_rgba(15,23,42,0.35)] backdrop-blur-xl">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-medium text-slate-100">
                Configure assumptions
              </h2>
              <ModeSwitch mode={mode} onModeChange={setMode} />
            </div>
            <div className="space-y-4">
              <SectionLabel>Core economics</SectionLabel>
              <InputField
                label="Base product cost"
                prefix="$"
                value={inputs.baseCost}
                min={0}
                step={0.5}
                onChange={handleChange("baseCost")}
              />
              <InputField
                label="Variable extras (packaging, handling)"
                prefix="$"
                value={inputs.extraCost}
                min={0}
                step={0.5}
                onChange={handleChange("extraCost")}
              />
              <InputField
                label="Overhead allocation per unit"
                prefix="$"
                value={inputs.overhead}
                min={0}
                step={0.5}
                onChange={handleChange("overhead")}
              />
              <InputField
                label="Freight / logistics per unit"
                prefix="$"
                value={inputs.freight}
                min={0}
                step={0.5}
                onChange={handleChange("freight")}
              />
              <InputField
                label="Units in deal or forecast"
                value={inputs.units}
                min={1}
                step={1}
                onChange={handleChange("units")}
              />
            </div>
            <div className="space-y-4">
              <SectionLabel>Pricing strategy</SectionLabel>
              <InputField
                label="Markup %"
                suffix="%"
                value={inputs.markupPercent}
                min={0}
                step={0.5}
                onChange={handleChange("markupPercent")}
                highlight={mode === "markup"}
              />
              <InputField
                label="Margin %"
                suffix="%"
                value={inputs.marginPercent}
                min={0}
                max={99.5}
                step={0.5}
                onChange={handleChange("marginPercent")}
                highlight={mode === "margin"}
              />
              <InputField
                label="Sell price override"
                prefix="$"
                value={inputs.priceOverride}
                min={0}
                step={0.5}
                onChange={handleChange("priceOverride")}
                highlight={mode === "price"}
              />
            </div>
            <div className="space-y-4">
              <SectionLabel>Commercial policy</SectionLabel>
              <InputField
                label="Promotional discount"
                suffix="%"
                value={inputs.discountPercent}
                min={0}
                max={90}
                step={0.5}
                onChange={handleChange("discountPercent")}
              />
              <InputField
                label="Taxes on sale"
                suffix="%"
                value={inputs.taxPercent}
                min={0}
                max={60}
                step={0.25}
                onChange={handleChange("taxPercent")}
              />
              <InputField
                label="Target profit (total)"
                prefix="$"
                value={inputs.targetProfit}
                min={0}
                step={100}
                onChange={handleChange("targetProfit")}
              />
            </div>
          </div>
          <div className="grid gap-8">
            <div className="rounded-3xl border border-white/10 bg-[rgba(12,20,38,0.85)] p-8 shadow-[0_25px_50px_rgba(8,15,28,0.55)] backdrop-blur-xl">
              <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                <div>
                  <h2 className="text-xl font-semibold text-slate-100">
                    Executive dashboard
                  </h2>
                  <p className="max-w-xl text-sm text-slate-300">
                    Real-time economics, currency adjusted, margin aware. Built
                    for pricing committees and revenue leadership.
                  </p>
                </div>
                <div className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200">
                  Live
                </div>
              </div>
              <div className="mt-6 grid gap-6 lg:grid-cols-4">
                <MetricCard
                  label="Final customer price"
                  value={formatCurrency(metrics.finalCustomerPrice)}
                  subValue={`Net of ${
                    inputs.discountPercent
                  }% discount & ${inputs.taxPercent}% tax`}
                />
                <MetricCard
                  label="Profit per unit"
                  value={formatCurrency(metrics.profitPerUnit)}
                  subValue={`Margin ${formatPercent(metrics.achievedMargin)}`}
                />
                <MetricCard
                  label="Total profit"
                  value={formatCurrency(metrics.totalProfit)}
                  subValue={`${inputs.units.toLocaleString()} units`}
                />
                <MetricCard
                  label="Achieved markup"
                  value={formatPercent(metrics.achievedMarkup)}
                  subValue={`Effective cost ${formatCurrency(
                    metrics.effectiveCost,
                  )}`}
                />
              </div>
              <div className="mt-8 grid gap-4 lg:grid-cols-2">
                <InsightPanel
                  title="Strategy guidance"
                  headline={
                    metrics.pricingToHitTarget
                      ? `Need ${formatCurrency(
                          metrics.pricingToHitTarget,
                        )} (${formatPercent(
                          metrics.markupToHitTarget ?? 0,
                        )} markup) to unlock your ${formatCurrency(
                          inputs.targetProfit,
                        )} target.`
                      : "Set a target profit to unlock guidance."
                  }
                  bullets={[
                    `Markup method price: ${formatCurrency(
                      metrics.markupPrice ?? 0,
                    )}`,
                    `Margin method price: ${formatCurrency(
                      metrics.marginPrice ?? 0,
                    )}`,
                    metrics.breakevenUnits
                      ? `Breakeven at ${metrics.breakevenUnits.toLocaleString()} units.`
                      : "Increase price or reduce cost to reach breakeven.",
                  ]}
                />
                <InsightPanel
                  title="Implementation kit"
                  headline="Deploy across every workflow in seconds."
                  bullets={[
                    "Web app: export PDFs or share read-only dashboards.",
                    "Excel & Google Sheets: identical logic with executive rollups.",
                    "Scenario modeller: aligns commercial & finance stakeholders.",
                  ]}
                  cta={
                    <div className="flex flex-wrap items-center gap-3 pt-4 text-sm">
                      <DownloadLink
                        href="/downloads/markup-calculator-excel.xlsx"
                        label="Excel Template"
                      />
                      <DownloadLink
                        href="/downloads/markup-calculator-google-sheets.xlsx"
                        label="Google Sheet Template"
                      />
                    </div>
                  }
                />
              </div>
            </div>
            <div className="rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
              <div className="flex flex-col gap-2">
                <h3 className="text-lg font-semibold text-slate-100">
                  Scenario modeller
                </h3>
                <p className="text-sm text-slate-300">
                  Stress-test markup approaches instantly. Each scenario keeps
                  your cost and policy assumptions constant.
                </p>
              </div>
              <div className="mt-6 overflow-x-auto">
                <table className="w-full min-w-[640px] table-fixed border-separate border-spacing-y-3">
                  <thead>
                    <tr className="text-left text-xs uppercase tracking-[0.25em] text-slate-300">
                      <th className="rounded-l-xl bg-white/5 px-4 py-2">
                        Playbook
                      </th>
                      <th className="bg-white/5 px-4 py-2">Markup</th>
                      <th className="bg-white/5 px-4 py-2">Price</th>
                      <th className="bg-white/5 px-4 py-2">Profit/unit</th>
                      <th className="rounded-r-xl bg-white/5 px-4 py-2">
                        Profit (all units)
                      </th>
                    </tr>
                  </thead>
                  <tbody className="text-sm text-slate-200">
                    {metrics.scenarioDetails.map((scenario) => (
                      <tr
                        key={scenario.name}
                        className="transition-colors hover:bg-white/6"
                      >
                        <td className="rounded-l-xl bg-white/5 px-4 py-3 align-top">
                          <div className="font-medium text-slate-100">
                            {scenario.name}
                          </div>
                          <div className="text-xs text-slate-300">
                            {scenario.description}
                          </div>
                        </td>
                        <td className="bg-white/5 px-4 py-3 align-top">
                          {formatPercent(scenario.markupValue)}
                        </td>
                        <td className="bg-white/5 px-4 py-3 align-top">
                          {formatCurrency(scenario.price)}
                        </td>
                        <td className="bg-white/5 px-4 py-3 align-top">
                          {formatCurrency(scenario.profit)}
                        </td>
                        <td className="rounded-r-xl bg-white/5 px-4 py-3 align-top">
                          {formatCurrency(scenario.totalProfit)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="grid gap-6 rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl lg:grid-cols-3">
              <GuidelineCard
                title="Precision guardrails"
                description="Lock in pricing governance with markup vs. margin validation, breakeven signals, and automated profitability warnings."
              />
              <GuidelineCard
                title="Forecast integration"
                description="Plug metrics into CRM, ERP, or FP&A models—export JSON, CSV, or sync via API using the same calculation engine."
              />
              <GuidelineCard
                title="Executive-ready reports"
                description="One-click export to Excel, Google Sheets, or PDF, keeping the same premium layout and arithmetic integrity."
              />
            </div>
          </div>
        </section>
      </main>
      <footer className="relative z-10 border-t border-white/10 bg-[#040b17]/80 px-6 py-6 text-sm text-slate-400 backdrop-blur-xl lg:px-12">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <span>© {new Date().getFullYear()} Apex Markup Studio.</span>
          <div className="flex flex-wrap gap-3">
            <Link
              href="/downloads/markup-calculator-excel.xlsx"
              className="font-medium text-slate-200 underline-offset-4 hover:underline"
            >
              Excel template
            </Link>
            <Link
              href="/downloads/markup-calculator-google-sheets.xlsx"
              className="font-medium text-slate-200 underline-offset-4 hover:underline"
            >
              Google Sheet template
            </Link>
            <a
              href="mailto:pricing@apexmarkupstudio.com"
              className="font-medium text-slate-200 underline-offset-4 hover:underline"
            >
              pricing@apexmarkupstudio.com
            </a>
          </div>
        </div>
      </footer>
    </div>
  );
}

function GradientHalo() {
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      <div className="absolute left-1/3 top-12 h-64 w-64 rounded-full bg-cyan-400/30 blur-[120px]" />
      <div className="absolute right-1/4 top-40 h-80 w-80 rounded-full bg-blue-500/25 blur-[140px]" />
      <div className="absolute bottom-0 right-1/3 h-72 w-72 rounded-full bg-purple-500/15 blur-[160px]" />
    </div>
  );
}

function InputField(props: {
  label: string;
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  step?: number;
  prefix?: string;
  suffix?: string;
  highlight?: boolean;
}) {
  const { label, value, onChange, min, max, step, prefix, suffix, highlight } =
    props;

  return (
    <label
      className={`group block space-y-2 rounded-2xl border px-5 py-4 transition-all ${
        highlight
          ? "border-cyan-400/60 bg-white/10 shadow-[0_0_35px_rgba(56,189,248,0.35)]"
          : "border-white/10 bg-white/5 hover:border-cyan-300/40 hover:bg-white/10"
      }`}
    >
      <span className="text-xs uppercase tracking-[0.2em] text-slate-300">
        {label}
      </span>
      <div className="flex items-baseline gap-2 text-slate-100">
        {prefix ? (
          <span className="text-lg text-slate-300">{prefix}</span>
        ) : null}
        <input
          type="number"
          inputMode="decimal"
          className="w-full bg-transparent text-lg font-semibold tracking-tight text-slate-50 placeholder:text-slate-400 focus:outline-none"
          value={Number.isFinite(value) ? value : ""}
          min={min}
          max={max}
          step={step ?? 0.01}
          onChange={(event) =>
            onChange(event.target.value === "" ? 0 : Number(event.target.value))
          }
        />
        {suffix ? (
          <span className="text-lg text-slate-300">{suffix}</span>
        ) : null}
      </div>
    </label>
  );
}

function ModeSwitch(props: {
  mode: CalculatorMode;
  onModeChange: (mode: CalculatorMode) => void;
}) {
  const modes: { id: CalculatorMode; label: string }[] = [
    { id: "markup", label: "Markup" },
    { id: "margin", label: "Margin" },
    { id: "price", label: "Price" },
  ];

  return (
    <div className="flex rounded-full border border-white/10 bg-white/5 p-1 text-xs text-slate-200">
      {modes.map((item) => (
        <button
          key={item.id}
          type="button"
          onClick={() => props.onModeChange(item.id)}
          className={`rounded-full px-3 py-1 font-medium transition-all ${
            props.mode === item.id
              ? "bg-cyan-400/90 text-slate-900"
              : "text-slate-200 hover:bg-cyan-300/20"
          }`}
        >
          {item.label}
        </button>
      ))}
    </div>
  );
}

function SectionLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="text-xs font-medium uppercase tracking-[0.3em] text-slate-300">
      {children}
    </p>
  );
}

function MetricCard(props: {
  label: string;
  value: string;
  subValue?: string;
}) {
  return (
    <div className="rounded-3xl border border-white/5 bg-white/5 p-4 backdrop-blur">
      <p className="text-xs uppercase tracking-[0.4em] text-slate-400">
        {props.label}
      </p>
      <p className="mt-3 text-2xl font-semibold text-slate-50">
        {props.value}
      </p>
      {props.subValue ? (
        <p className="mt-2 text-xs text-slate-300">{props.subValue}</p>
      ) : null}
    </div>
  );
}

function InsightPanel(props: {
  title: string;
  headline: string;
  bullets: string[];
  cta?: React.ReactNode;
}) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6">
      <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-slate-300">
        {props.title}
      </h4>
      <p className="mt-3 text-lg font-medium text-slate-100">
        {props.headline}
      </p>
      <ul className="mt-4 space-y-2 text-sm text-slate-300">
        {props.bullets.map((bullet) => (
          <li key={bullet} className="flex items-start gap-2">
            <span className="mt-1 h-1.5 w-1.5 rounded-full bg-cyan-400" />
            <span>{bullet}</span>
          </li>
        ))}
      </ul>
      {props.cta ? <div className="mt-auto">{props.cta}</div> : null}
    </div>
  );
}

function DownloadLink(props: { href: string; label: string }) {
  return (
    <Link
      href={props.href}
      className="group inline-flex items-center gap-2 rounded-full border border-cyan-300/50 bg-cyan-300/10 px-4 py-2 font-medium text-cyan-200 transition-colors hover:border-cyan-300 hover:bg-cyan-300/20 hover:text-slate-900"
      prefetch={false}
    >
      <span className="inline-flex h-2 w-2 rounded-full bg-cyan-300 group-hover:bg-slate-900" />
      {props.label}
    </Link>
  );
}

function GuidelineCard(props: { title: string; description: string }) {
  return (
    <div className="flex h-full flex-col rounded-3xl border border-white/10 bg-white/5 p-6">
      <h4 className="text-base font-semibold text-slate-100">{props.title}</h4>
      <p className="mt-3 text-sm text-slate-300">{props.description}</p>
    </div>
  );
}

function Tag({ children }: { children: React.ReactNode }) {
  return (
    <span className="rounded-full border border-cyan-300/30 bg-cyan-300/10 px-3 py-1 text-xs font-medium tracking-[0.2em] text-cyan-200">
      {children}
    </span>
  );
}
