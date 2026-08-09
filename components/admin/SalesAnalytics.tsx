"use client";

import { useState } from "react";
import { formatPHP } from "@/types";
import { PieChart, TrendingUp, Calendar, Filter, ShieldCheck, AlertCircle, XCircle, ArrowUpRight } from "lucide-react";

interface SalesProductStat {
  id: string;
  name: string;
  category: "seed" | "rice" | "other";
  unitsSold: number;
  revenuePHP: number;
  stockQty: number;
  unitType: string;
}

const MOCK_SALES_DATA: SalesProductStat[] = [
  { id: "1", name: "RC 222 Foundation Seeds", category: "seed", unitsSold: 340, revenuePHP: 153000, stockQty: 200, unitType: "packet" },
  { id: "2", name: "RC 222 Milled Rice (25 kg Sack)", category: "rice", unitsSold: 110, revenuePHP: 137500, stockQty: 40, unitType: "sack" },
  { id: "3", name: "NSIC Rc 216 Registered Seeds", category: "seed", unitsSold: 215, revenuePHP: 81700, stockQty: 150, unitType: "packet" },
  { id: "4", name: "RC 222 Milled Rice (Loose)", category: "rice", unitsSold: 980, revenuePHP: 50960, stockQty: 500, unitType: "kg" },
  { id: "5", name: "Sweet Corn Hybrid Seeds", category: "seed", unitsSold: 140, revenuePHP: 35000, stockQty: 80, unitType: "packet" },
  { id: "6", name: "Vermicompost (5 kg bag)", category: "other", unitsSold: 190, revenuePHP: 18050, stockQty: 12, unitType: "unit" },
];

// Color palette for Pie Chart slices (designed for both Light & Dark modes)
const PIE_COLORS = [
  "oklch(55% 0.18 145)",   // CLSU Green
  "oklch(75% 0.18 85)",    // Gold Amber
  "oklch(60% 0.16 240)",   // Royal Blue
  "oklch(62% 0.17 175)",   // Teal
  "oklch(65% 0.18 310)",   // Purple
  "oklch(60% 0.18 45)",    // Orange
];

export default function SalesAnalytics() {
  const [preset, setPreset] = useState<"today" | "month" | "year" | "custom">("month");
  const [startDate, setStartDate] = useState("2026-09-01");
  const [endDate, setEndDate] = useState("2026-12-31");
  const [sortBy, setSortBy] = useState<"revenue" | "units">("revenue");
  const [hoveredSlice, setHoveredSlice] = useState<number | null>(null);
  const [hoveredTrendPoint, setHoveredTrendPoint] = useState<number | null>(null);

  // Multiplier matrix based on selected period
  const multiplier = preset === "today" ? 0.08 : preset === "month" ? 0.45 : preset === "year" ? 1.0 : 0.75;

  const processedData = MOCK_SALES_DATA.map((item) => ({
    ...item,
    calcUnits: Math.round(item.unitsSold * multiplier),
    calcRevenue: Math.round(item.revenuePHP * multiplier),
  })).sort((a, b) => (sortBy === "revenue" ? b.calcRevenue - a.calcRevenue : b.calcUnits - a.calcUnits));

  const totalPeriodRevenue = processedData.reduce((acc, curr) => acc + curr.calcRevenue, 0);

  // Stock Metrics Calculations
  const totalStockUnits = MOCK_SALES_DATA.reduce((acc, curr) => acc + curr.stockQty, 0);
  const healthyStockItems = MOCK_SALES_DATA.filter((i) => i.stockQty >= 50);
  const lowStockItems = MOCK_SALES_DATA.filter((i) => i.stockQty > 0 && i.stockQty < 50);
  const outOfStockItems = MOCK_SALES_DATA.filter((i) => i.stockQty <= 0);

  // ── Pie Chart Calculation (SVG Donut) ──────────────────────
  let cumulativeAngle = 0;
  const pieSlices = processedData.map((item, index) => {
    const value = sortBy === "revenue" ? item.calcRevenue : item.calcUnits;
    const total = processedData.reduce((acc, d) => acc + (sortBy === "revenue" ? d.calcRevenue : d.calcUnits), 0);
    const fraction = total > 0 ? value / total : 0;
    const angle = fraction * 360;
    const startAngle = cumulativeAngle;
    cumulativeAngle += angle;
    const endAngle = cumulativeAngle;
    const color = PIE_COLORS[index % PIE_COLORS.length];

    // Helper for SVG Arc path
    const getCoordinatesForAngle = (deg: number) => {
      const rad = ((deg - 90) * Math.PI) / 180;
      return [100 + 75 * Math.cos(rad), 100 + 75 * Math.sin(rad)];
    };

    const [startX, startY] = getCoordinatesForAngle(startAngle);
    const [endX, endY] = getCoordinatesForAngle(endAngle);
    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData =
      angle >= 359.9
        ? `M 100,25 A 75,75 0 1,1 99.9,25 Z`
        : `M 100,100 L ${startX},${startY} A 75,75 0 ${largeArcFlag},1 ${endX},${endY} Z`;

    return {
      ...item,
      fraction,
      percentage: Math.round(fraction * 100),
      pathData,
      color,
      index,
    };
  });

  // ── Line Graph Calculation (SVG Bezier Curve) ───────────────
  const trendLabels =
    preset === "today"
      ? ["8 AM", "10 AM", "12 PM", "2 PM", "4 PM"]
      : preset === "month"
      ? ["Week 1", "Week 2", "Week 3", "Week 4"]
      : preset === "year"
      ? ["Q1", "Q2", "Q3", "Q4"]
      : ["Sept", "Oct", "Nov", "Dec"];

  const trendFactors =
    preset === "today"
      ? [0.1, 0.25, 0.6, 0.85, 1.0]
      : preset === "month"
      ? [0.2, 0.45, 0.75, 1.0]
      : preset === "year"
      ? [0.3, 0.55, 0.8, 1.0]
      : [0.35, 0.6, 0.82, 1.0];

  const trendData = trendFactors.map((f, idx) => ({
    label: trendLabels[idx] || `P${idx + 1}`,
    value: Math.round(totalPeriodRevenue * f * (0.8 + 0.4 * Math.sin(idx))),
  }));

  const maxTrendVal = Math.max(...trendData.map((d) => d.value), 1);

  const graphWidth = 500;
  const graphHeight = 160;
  const paddingX = 40;
  const paddingY = 20;

  const points = trendData.map((d, i) => {
    const x = paddingX + (i / Math.max(trendData.length - 1, 1)) * (graphWidth - paddingX * 2);
    const y = graphHeight - paddingY - (d.value / maxTrendVal) * (graphHeight - paddingY * 2);
    return { x, y, ...d };
  });

  // Generate smooth cubic bezier SVG path
  const linePathD = points.reduce((acc, pt, i, arr) => {
    if (i === 0) return `M ${pt.x},${pt.y}`;
    const prev = arr[i - 1];
    const cx1 = prev.x + (pt.x - prev.x) / 2;
    const cy1 = prev.y;
    const cx2 = prev.x + (pt.x - prev.x) / 2;
    const cy2 = pt.y;
    return `${acc} C ${cx1},${cy1} ${cx2},${cy2} ${pt.x},${pt.y}`;
  }, "");

  const areaPathD = `${linePathD} L ${points[points.length - 1].x},${graphHeight - paddingY} L ${points[0].x},${graphHeight - paddingY} Z`;

  return (
    <div className="analytics-section">
      {/* ── Top Header Controls & Presets ───────────────────── */}
      <div className="analytics-card">
        <div className="analytics-card__header">
          <div>
            <div className="analytics-card__title-row">
              <PieChart size={22} className="analytics-icon" aria-hidden="true" />
              <h2 className="analytics-card__title">Sales Distribution &amp; Performance Trends</h2>
            </div>
            <p className="analytics-card__sub">
              Graphical breakdown of product revenue distribution and trajectory across selected periods
            </p>
          </div>

          <div className="analytics-controls">
            {/* Sort Toggle */}
            <div className="sort-toggle">
              <button
                type="button"
                className="sort-btn"
                data-active={sortBy === "revenue"}
                onClick={() => setSortBy("revenue")}
              >
                Revenue (₱)
              </button>
              <button
                type="button"
                className="sort-btn"
                data-active={sortBy === "units"}
                onClick={() => setSortBy("units")}
              >
                Units Sold
              </button>
            </div>

            {/* Time Span Filter Presets */}
            <div className="preset-pills">
              <button
                type="button"
                className="preset-btn"
                data-active={preset === "today"}
                onClick={() => setPreset("today")}
              >
                Today
              </button>
              <button
                type="button"
                className="preset-btn"
                data-active={preset === "month"}
                onClick={() => setPreset("month")}
              >
                This Month
              </button>
              <button
                type="button"
                className="preset-btn"
                data-active={preset === "year"}
                onClick={() => setPreset("year")}
              >
                This Year
              </button>
              <button
                type="button"
                className="preset-btn"
                data-active={preset === "custom"}
                onClick={() => setPreset("custom")}
              >
                Custom Range
              </button>
            </div>
          </div>
        </div>

        {/* Custom Date Range Inputs */}
        {preset === "custom" && (
          <div className="custom-range-bar">
            <div className="date-input-group">
              <Calendar size={16} aria-hidden="true" />
              <label htmlFor="start-date">From:</label>
              <input
                id="start-date"
                type="date"
                className="date-picker"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
              />
            </div>

            <div className="date-input-group">
              <label htmlFor="end-date">To:</label>
              <input
                id="end-date"
                type="date"
                className="date-picker"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <span className="range-badge">
              Active Span: Sept to Dec 2026
            </span>
          </div>
        )}

        {/* Summary KPI Banner */}
        <div className="summary-banner">
          <div>
            <span className="summary-label">Total Period Revenue</span>
            <span className="summary-value">{formatPHP(totalPeriodRevenue)}</span>
          </div>
          <div>
            <span className="summary-label">Active Products Tracked</span>
            <span className="summary-value">{processedData.length} items</span>
          </div>
          <div>
            <span className="summary-label">Top Performer</span>
            <span className="summary-value summary-value--accent">{processedData[0]?.name}</span>
          </div>
        </div>

        {/* ── Graphical Charts Row: Pie Chart & Line Graph ────── */}
        <div className="charts-grid">
          {/* 1. Pie Chart Box */}
          <div className="chart-box">
            <h3 className="chart-box__title">Revenue Share Distribution</h3>
            <div className="pie-chart-wrapper">
              <div className="pie-svg-container">
                <svg viewBox="0 0 200 200" className="pie-svg" aria-label="Sales pie chart">
                  {pieSlices.map((slice) => {
                    const isHovered = hoveredSlice === slice.index;
                    return (
                      <path
                        key={slice.id}
                        d={slice.pathData}
                        fill={slice.color}
                        className="pie-slice"
                        data-hovered={isHovered}
                        onMouseEnter={() => setHoveredSlice(slice.index)}
                        onMouseLeave={() => setHoveredSlice(null)}
                      />
                    );
                  })}
                  {/* Donut Hole Inner Cutout */}
                  <circle cx="100" cy="100" r="48" className="pie-hole" />
                  {/* Center Text displaying hover info */}
                  <text x="100" y="94" textAnchor="middle" className="pie-center-label">
                    {hoveredSlice !== null ? pieSlices[hoveredSlice]?.name.slice(0, 14) + "..." : "Total Share"}
                  </text>
                  <text x="100" y="114" textAnchor="middle" className="pie-center-val">
                    {hoveredSlice !== null
                      ? `${pieSlices[hoveredSlice]?.percentage}%`
                      : formatPHP(totalPeriodRevenue)}
                  </text>
                </svg>
              </div>

              {/* Pie Chart Legend */}
              <div className="pie-legend">
                {pieSlices.map((slice) => (
                  <div
                    key={slice.id}
                    className="legend-item"
                    data-hovered={hoveredSlice === slice.index}
                    onMouseEnter={() => setHoveredSlice(slice.index)}
                    onMouseLeave={() => setHoveredSlice(null)}
                  >
                    <span className="legend-dot" style={{ backgroundColor: slice.color }} />
                    <span className="legend-name" title={slice.name}>{slice.name}</span>
                    <span className="legend-val">{slice.percentage}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* 2. Line Graph Box */}
          <div className="chart-box">
            <div className="chart-box__header">
              <h3 className="chart-box__title">Sales Trajectory Trend</h3>
              <TrendingUp size={18} className="chart-box__icon" />
            </div>
            <div className="line-graph-wrapper">
              <svg viewBox={`0 0 ${graphWidth} ${graphHeight}`} className="line-svg" aria-label="Sales line graph">
                <defs>
                  <linearGradient id="areaGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--color-primary)" stopOpacity="0.3" />
                    <stop offset="100%" stopColor="var(--color-primary)" stopOpacity="0.0" />
                  </linearGradient>
                </defs>

                {/* Horizontal Grid lines */}
                {[0.25, 0.5, 0.75, 1.0].map((level, i) => {
                  const y = graphHeight - paddingY - level * (graphHeight - paddingY * 2);
                  return (
                    <line
                      key={i}
                      x1={paddingX}
                      y1={y}
                      x2={graphWidth - paddingX}
                      y2={y}
                      className="grid-line"
                    />
                  );
                })}

                {/* Gradient Area below curve */}
                <path d={areaPathD} fill="url(#areaGrad)" />

                {/* Curve Line */}
                <path d={linePathD} fill="none" className="trend-line" />

                {/* Points and Tooltips */}
                {points.map((pt, idx) => {
                  const isHovered = hoveredTrendPoint === idx;
                  return (
                    <g key={idx} onMouseEnter={() => setHoveredTrendPoint(idx)} onMouseLeave={() => setHoveredTrendPoint(null)}>
                      <circle
                        cx={pt.x}
                        cy={pt.y}
                        r={isHovered ? "6" : "4"}
                        className="trend-point"
                        data-hovered={isHovered}
                      />
                      {/* X-axis Label */}
                      <text x={pt.x} y={graphHeight - 4} textAnchor="middle" className="axis-label">
                        {pt.label}
                      </text>
                      {/* Tooltip on hover */}
                      {isHovered && (
                        <g>
                          <rect
                            x={pt.x - 45}
                            y={pt.y - 30}
                            width="90"
                            height="22"
                            rx="4"
                            className="tooltip-bg"
                          />
                          <text x={pt.x} y={pt.y - 15} textAnchor="middle" className="tooltip-text">
                            {formatPHP(pt.value)}
                          </text>
                        </g>
                      )}
                    </g>
                  );
                })}
              </svg>
            </div>
          </div>
        </div>
      </div>

      {/* ── Product Stock Statistics Section ─────────────────── */}
      <div className="analytics-card">
        <div className="analytics-card__header">
          <div>
            <div className="analytics-card__title-row">
              <Filter size={22} className="analytics-icon" aria-hidden="true" />
              <h2 className="analytics-card__title">Product Stock Statistics &amp; Health</h2>
            </div>
            <p className="analytics-card__sub">
              Inventory reserve volume and safety threshold analysis
            </p>
          </div>
        </div>

        {/* Stock Status Cards */}
        <div className="stock-stat-grid">
          <div className="stock-card stock-card--healthy">
            <div className="stock-card__header">
              <ShieldCheck size={20} className="stock-icon--healthy" />
              <span className="stock-card__label">Healthy Stock Items</span>
            </div>
            <span className="stock-card__value">{healthyStockItems.length}</span>
            <span className="stock-card__sub">Stock &gt;= 50 units</span>
          </div>

          <div className="stock-card stock-card--warning">
            <div className="stock-card__header">
              <AlertCircle size={20} className="stock-icon--warning" />
              <span className="stock-card__label">Low Stock Alerts</span>
            </div>
            <span className="stock-card__value">{lowStockItems.length}</span>
            <span className="stock-card__sub">Stock &lt; 50 units</span>
          </div>

          <div className="stock-card stock-card--danger">
            <div className="stock-card__header">
              <XCircle size={20} className="stock-icon--danger" />
              <span className="stock-card__label">Out of Stock</span>
            </div>
            <span className="stock-card__value">{outOfStockItems.length}</span>
            <span className="stock-card__sub">Re-order required immediately</span>
          </div>

          <div className="stock-card">
            <div className="stock-card__header">
              <ArrowUpRight size={20} className="stock-icon--info" />
              <span className="stock-card__label">Total Physical Reserves</span>
            </div>
            <span className="stock-card__value">{totalStockUnits}</span>
            <span className="stock-card__sub">Combined inventory units</span>
          </div>
        </div>

        {/* Stock Level Gauges */}
        <div className="stock-gauges">
          <h3 className="stock-gauges__title">Current Inventory Level Breakdown</h3>
          <div className="stock-gauge-list">
            {MOCK_SALES_DATA.map((prod) => {
              const maxTarget = 500;
              const percent = Math.min(100, Math.round((prod.stockQty / maxTarget) * 100));
              const isLow = prod.stockQty > 0 && prod.stockQty < 50;
              const isOut = prod.stockQty <= 0;

              return (
                <div key={prod.id} className="stock-gauge-item">
                  <div className="stock-gauge-info">
                    <span className="stock-gauge-name">{prod.name}</span>
                    <span className="stock-gauge-qty" data-low={isLow} data-out={isOut}>
                      {prod.stockQty} {prod.unitType}s in stock
                    </span>
                  </div>
                  <div className="gauge-track">
                    <div
                      className={`gauge-fill ${isOut ? "gauge-fill--out" : isLow ? "gauge-fill--low" : "gauge-fill--healthy"}`}
                      style={{ width: `${percent}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      <style>{`
        .analytics-section {
          display: flex;
          flex-direction: column;
          gap: var(--space-8);
        }

        .analytics-card {
          background-color: var(--color-paper);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-xl);
          padding: var(--space-6);
          display: flex;
          flex-direction: column;
          gap: var(--space-6);
        }

        .analytics-card__header {
          display: flex;
          justify-content: space-between;
          align-items: flex-start;
          flex-wrap: wrap;
          gap: var(--space-4);
        }

        .analytics-card__title-row {
          display: flex;
          align-items: center;
          gap: var(--space-3);
        }

        .analytics-icon {
          color: var(--color-primary);
        }

        .analytics-card__title {
          font-family: var(--font-display);
          font-size: var(--text-2xl);
          color: var(--color-heading);
          margin: 0;
        }

        .analytics-card__sub {
          font-size: var(--text-sm);
          color: var(--color-ink-2);
          margin: var(--space-1) 0 0;
        }

        .analytics-controls {
          display: flex;
          align-items: center;
          gap: var(--space-3);
          flex-wrap: wrap;
        }

        .sort-toggle, .preset-pills {
          display: inline-flex;
          background-color: var(--color-paper-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-full);
          padding: 2px;
        }

        .sort-btn, .preset-btn {
          padding: var(--space-2) var(--space-4);
          border-radius: var(--radius-full);
          border: none;
          background: transparent;
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-ink-2);
          cursor: pointer;
          transition: background-color var(--dur-fast) var(--ease-out), color var(--dur-fast) var(--ease-out);
        }

        .sort-btn[data-active="true"], .preset-btn[data-active="true"] {
          background-color: var(--color-primary);
          color: var(--color-primary-fg);
        }

        .custom-range-bar {
          display: flex;
          align-items: center;
          gap: var(--space-4);
          padding: var(--space-4);
          background-color: var(--color-paper-2);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          flex-wrap: wrap;
        }

        .date-input-group {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          color: var(--color-ink-2);
        }

        .date-picker {
          padding: var(--space-2) var(--space-3);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-md);
          background-color: var(--color-paper);
          color: var(--color-ink);
          font-size: var(--text-xs);
          font-family: var(--font-mono);
        }

        .range-badge {
          margin-left: auto;
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-primary);
          background-color: oklch(from var(--color-primary) l c h / 0.1);
          padding: 4px 10px;
          border-radius: var(--radius-full);
        }

        .summary-banner {
          display: flex;
          justify-content: space-around;
          align-items: center;
          padding: var(--space-5);
          background-color: var(--color-paper-2);
          border-radius: var(--radius-lg);
          border: 1px solid var(--color-border);
          gap: var(--space-4);
          flex-wrap: wrap;
        }

        .summary-label {
          display: block;
          font-size: var(--text-xs);
          color: var(--color-ink-3);
          text-transform: uppercase;
          letter-spacing: 0.05em;
        }

        .summary-value {
          font-family: var(--font-mono);
          font-size: var(--text-lg);
          font-weight: 700;
          color: var(--color-ink);
        }

        .summary-value--accent {
          color: var(--color-primary);
        }

        /* ── Charts Grid Layout ──────────────────────────────────── */
        .charts-grid {
          display: grid;
          grid-template-columns: 1fr 1fr;
          gap: var(--space-6);
        }

        .chart-box {
          background-color: var(--color-paper-2);
          border: 1px solid var(--color-border);
          border-radius: var(--radius-lg);
          padding: var(--space-5);
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .chart-box__header {
          display: flex;
          justify-content: space-between;
          align-items: center;
        }

        .chart-box__title {
          font-family: var(--font-display);
          font-size: var(--text-base);
          color: var(--color-heading);
          margin: 0;
        }

        .chart-box__icon {
          color: var(--color-primary);
        }

        /* Pie Chart CSS */
        .pie-chart-wrapper {
          display: flex;
          align-items: center;
          gap: var(--space-4);
        }

        .pie-svg-container {
          width: 150px;
          height: 150px;
          flex-shrink: 0;
        }

        .pie-svg {
          width: 100%;
          height: 100%;
        }

        .pie-slice {
          transition: transform var(--dur-fast) var(--ease-out), opacity var(--dur-fast) var(--ease-out);
          cursor: pointer;
          transform-origin: center;
        }

        .pie-slice[data-hovered="true"] {
          transform: scale(1.04);
          opacity: 0.9;
        }

        .pie-hole {
          fill: var(--color-paper-2);
        }

        .pie-center-label {
          font-size: 10px;
          fill: var(--color-ink-2);
          font-family: var(--font-body);
        }

        .pie-center-val {
          font-size: 12px;
          font-weight: 700;
          fill: var(--color-heading);
          font-family: var(--font-mono);
        }

        .pie-legend {
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
          flex: 1;
          min-width: 0;
        }

        .legend-item {
          display: flex;
          align-items: center;
          gap: var(--space-2);
          font-size: var(--text-xs);
          padding: 2px 4px;
          border-radius: var(--radius-sm);
          cursor: pointer;
          transition: background-color var(--dur-fast) var(--ease-out);
        }

        .legend-item:hover, .legend-item[data-hovered="true"] {
          background-color: oklch(from var(--color-ink) l c h / 0.05);
        }

        .legend-dot {
          width: 8px;
          height: 8px;
          border-radius: var(--radius-full);
          flex-shrink: 0;
        }

        .legend-name {
          color: var(--color-ink);
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: nowrap;
          flex: 1;
        }

        .legend-val {
          font-family: var(--font-mono);
          font-weight: 700;
          color: var(--color-primary);
        }

        /* Line Graph CSS */
        .line-graph-wrapper {
          width: 100%;
          height: 160px;
        }

        .line-svg {
          width: 100%;
          height: 100%;
          overflow: visible;
        }

        .grid-line {
          stroke: var(--color-border);
          stroke-dasharray: 4 4;
          stroke-width: 1;
        }

        .trend-line {
          stroke: var(--color-primary);
          stroke-width: 3;
          stroke-linecap: round;
        }

        .trend-point {
          fill: var(--color-paper);
          stroke: var(--color-primary);
          stroke-width: 3;
          cursor: pointer;
          transition: r var(--dur-fast) var(--ease-out);
        }

        .trend-point[data-hovered="true"] {
          fill: var(--color-accent);
          stroke: var(--color-primary-hover);
        }

        .axis-label {
          font-size: 10px;
          fill: var(--color-ink-3);
          font-family: var(--font-mono);
        }

        .tooltip-bg {
          fill: var(--color-heading);
        }

        .tooltip-text {
          font-size: 10px;
          font-weight: 700;
          fill: var(--color-paper);
          font-family: var(--font-mono);
        }

        /* Stock Stats */
        .stock-stat-grid {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          gap: var(--space-4);
        }

        .stock-card {
          padding: var(--space-5);
          border-radius: var(--radius-xl);
          background-color: var(--color-paper-2);
          border: 1px solid var(--color-border);
          display: flex;
          flex-direction: column;
          gap: var(--space-2);
        }

        .stock-card__header {
          display: flex;
          align-items: center;
          gap: var(--space-2);
        }

        .stock-card__label {
          font-size: var(--text-xs);
          font-weight: 600;
          color: var(--color-ink-2);
          text-transform: uppercase;
        }

        .stock-card__value {
          font-family: var(--font-mono);
          font-size: var(--text-2xl);
          font-weight: 700;
          color: var(--color-ink);
        }

        .stock-card__sub {
          font-size: var(--text-xs);
          color: var(--color-ink-3);
        }

        .stock-icon--healthy { color: var(--color-success); }
        .stock-icon--warning { color: var(--color-warning); }
        .stock-icon--danger { color: var(--color-error); }
        .stock-icon--info { color: var(--color-primary); }

        .stock-gauges {
          display: flex;
          flex-direction: column;
          gap: var(--space-4);
        }

        .stock-gauges__title {
          font-family: var(--font-display);
          font-size: var(--text-lg);
          color: var(--color-heading);
          margin: 0;
        }

        .stock-gauge-list {
          display: flex;
          flex-direction: column;
          gap: var(--space-3);
        }

        .stock-gauge-item {
          display: flex;
          flex-direction: column;
          gap: 4px;
        }

        .stock-gauge-info {
          display: flex;
          justify-content: space-between;
          font-size: var(--text-xs);
        }

        .stock-gauge-name {
          font-weight: 600;
          color: var(--color-ink);
        }

        .stock-gauge-qty {
          font-family: var(--font-mono);
          color: var(--color-ink-2);
        }
        .stock-gauge-qty[data-low="true"] { color: var(--color-warning); font-weight: 600; }
        .stock-gauge-qty[data-out="true"] { color: var(--color-error); font-weight: 600; }

        .gauge-track {
          width: 100%;
          height: 8px;
          border-radius: var(--radius-full);
          background-color: var(--color-paper-3);
          overflow: hidden;
        }

        .gauge-fill {
          height: 100%;
          border-radius: var(--radius-full);
          transition: width 300ms var(--ease-out);
        }
        .gauge-fill--healthy { background-color: var(--color-success); }
        .gauge-fill--low { background-color: var(--color-warning); }
        .gauge-fill--out { background-color: var(--color-error); }

        @media (max-width: 1100px) {
          .charts-grid { grid-template-columns: 1fr; }
        }

        @media (max-width: 900px) {
          .stock-stat-grid { grid-template-columns: repeat(2, 1fr); }
        }
        @media (max-width: 600px) {
          .stock-stat-grid { grid-template-columns: 1fr; }
          .pie-chart-wrapper { flex-direction: column; }
        }
      `}</style>
    </div>
  );
}
