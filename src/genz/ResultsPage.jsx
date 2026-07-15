import { useState, useEffect, useMemo } from "react";
import {
  Check, TrendingUp, TrendingDown, Download, ArrowLeft, RotateCcw,
  SlidersHorizontal, ArrowUpNarrowWide, ArrowDownWideNarrow, X
} from "lucide-react";
import { MONTH_FULL } from "./theme";
import { CountUp, Select, Field } from "./ui";
import { computeResult, fmtInr } from "./data";

/* ── animated equity curve (dark terminal panel) ───────── */

function EquityCurve({ equity, totalPnl }) {
  const [drawn, setDrawn] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setDrawn(true), 150);
    return () => clearTimeout(id);
  }, []);

  const W = 340, H = 170, PAD = 10;
  const min = Math.min(...equity, 0);
  const max = Math.max(...equity);
  const range = max - min || 1;
  const px = (i) => PAD + (i / Math.max(equity.length - 1, 1)) * (W - PAD * 2);
  const py = (v) => H - PAD - ((v - min) / range) * (H - PAD * 2);
  const line = equity.map((v, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const area = line + ` L${px(equity.length - 1).toFixed(1)},${H - PAD} L${PAD},${H - PAD} Z`;

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <p className="text-sm font-semibold text-slate-200">Equity curve · cumulative PnL</p>
        <span className={"text-sm font-semibold " + (totalPnl >= 0 ? "text-emerald-400" : "text-rose-400")}>
          {fmtInr(totalPnl)}
        </span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full">
        <defs>
          <linearGradient id="eqfill" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#34d399" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#34d399" stopOpacity="0" />
          </linearGradient>
        </defs>
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PAD} x2={W - PAD} y1={PAD + f * (H - PAD * 2)} y2={PAD + f * (H - PAD * 2)}
            stroke="#334155" strokeWidth="0.5" strokeDasharray="3 4" />
        ))}
        <line x1={PAD} x2={W - PAD} y1={py(0)} y2={py(0)} stroke="#64748b" strokeWidth="0.7" strokeDasharray="2 3" />
        <path d={area} fill="url(#eqfill)"
          style={{ opacity: drawn ? 1 : 0, transition: "opacity 700ms ease 900ms" }} />
        <path d={line} fill="none" stroke="#34d399" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" pathLength="1"
          strokeDasharray="1" strokeDashoffset={drawn ? 0 : 1}
          style={{ transition: "stroke-dashoffset 1400ms ease-out" }} />
        <circle cx={px(equity.length - 1)} cy={py(equity[equity.length - 1])} r="3.5"
          fill="#34d399" style={{ opacity: drawn ? 1 : 0, transition: "opacity 300ms ease 1300ms" }} />
      </svg>
      <p className="text-[11px] text-slate-500 mt-1">
        {equity.length - 1} trades · final {fmtInr(equity[equity.length - 1])}
      </p>
    </div>
  );
}

/* ── date filter (Year → Month → Day drill-down) ───────── */

const emptyDateFilter = { y: "All", m: "All", d: "All" };

function DateFilterRow({ t, label, value, onChange, years, months, days }) {
  const set = (k, v) => {
    const next = { ...value, [k]: v };
    if (k === "y" && v === "All") { next.m = "All"; next.d = "All"; }
    if (k === "m" && v === "All") { next.d = "All"; }
    onChange(next);
  };
  return (
    <div>
      <p className={t.fieldLabel}>{label}</p>
      <div className="grid grid-cols-3 gap-2">
        <Select t={t} value={value.y} onChange={(v) => set("y", v)} options={["All", ...years]} />
        <div className={value.y === "All" ? "opacity-40 pointer-events-none" : ""}>
          <Select t={t} value={value.m} onChange={(v) => set("m", v)} options={["All", ...months]} />
        </div>
        <div className={value.m === "All" ? "opacity-40 pointer-events-none" : ""}>
          <Select t={t} value={value.d} onChange={(v) => set("d", v)} options={["All", ...days]} />
        </div>
      </div>
    </div>
  );
}

const matchDate = (dateStr, f) => {
  // dateStr: "2024-01-05"
  const [y, m, d] = dateStr.split("-");
  if (f.y !== "All" && y !== f.y) return false;
  if (f.m !== "All" && m !== f.m.split(" ")[0]) return false;
  if (f.d !== "All" && d !== f.d) return false;
  return true;
};

const SORT_FIELDS = [
  ["instrument", "Instrument name"],
  ["entryDate", "Entry date"],
  ["entryTime", "Entry time"],
  ["exitDate", "Exit date"],
  ["pnl", "PnL"],
];

/* ── results page ──────────────────────────────────────── */

export default function ResultsPage({ t, name, trades, globals, onBack, onRerun, showRerun }) {
  const [mounted, setMounted] = useState(false);
  const [showFilters, setShowFilters] = useState(false);
  const [fEntry, setFEntry] = useState(emptyDateFilter);
  const [fExit, setFExit] = useState(emptyDateFilter);
  const [sortField, setSortField] = useState("entryDate");
  const [sortDir, setSortDir] = useState("asc");

  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(id);
  }, []);

  /* option lists derived from the data */
  const years = useMemo(() => [...new Set(trades.map((x) => x.entryDate.slice(0, 4)))], [trades]);
  const months = useMemo(() => {
    const ms = [...new Set(trades.map((x) => x.entryDate.slice(5, 7)))].sort();
    return ms.map((m) => `${m} ${MONTH_FULL[+m - 1].slice(0, 3)}`);
  }, [trades]);
  const days = useMemo(
    () => [...new Set(trades.map((x) => x.entryDate.slice(8, 10)))].sort(), [trades]);

  /* filter + sort */
  const filtered = useMemo(() => {
    let out = trades.filter((x) => matchDate(x.entryDate, fEntry) && matchDate(x.exitDate, fExit));
    const dir = sortDir === "asc" ? 1 : -1;
    out = [...out].sort((a, b) => {
      if (sortField === "pnl") return (a.pnl - b.pnl) * dir;
      if (sortField === "instrument") return a.instrument.localeCompare(b.instrument) * dir;
      const av = a[sortField] + (sortField === "entryDate" ? a.entryTime : "");
      const bv = b[sortField] + (sortField === "entryDate" ? b.entryTime : "");
      return av.localeCompare(bv) * dir;
    });
    return out;
  }, [trades, fEntry, fExit, sortField, sortDir]);

  /* summary always reflects what's filtered — filter to a month and
     the numbers, curve and drawdown recompute for that slice */
  const result = useMemo(() => computeResult(filtered), [filtered]);
  const filterActive =
    fEntry.y !== "All" || fExit.y !== "All";

  const downloadCsv = () => {
    const head = "b/s,qty,order_id,instrument_name,strike,entry_date,entry_time,exit_date,exit_time,entry_price,exit_price,pnl,exit_reason";
    const rows = filtered.map((x) =>
      [x.side, x.qty, x.orderId, x.instrument, x.strike, x.entryDate, x.entryTime,
       x.exitDate, x.exitTime, x.entryPrice, x.exitPrice, x.pnl, x.exitReason].join(","));
    const blob = new Blob([head + "\n" + rows.join("\n")], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `${name.replace(/\s+/g, "_")}_trades.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const maxAbsMonthly = Math.max(...result.monthly.map((m) => Math.abs(m.pnl)), 1);
  const reveal = (i) => ({
    opacity: mounted ? 1 : 0,
    transform: mounted ? "translateY(0)" : "translateY(14px)",
    transition: `opacity 500ms ease ${i * 110}ms, transform 500ms ease ${i * 110}ms`,
  });

  const stats = [
    ["No. of trades", result.nTrades, ""],
    ["Winning trades", result.nWins, "pos"],
    ["Winning %", result.winPct + "%", "pos"],
    ["Losing trades", result.nLosses, "neg"],
    ["Losing %", result.lossPct + "%", "neg"],
    ["Best trade", fmtInr(result.maxProfit), "pos"],
    ["Worst trade", fmtInr(result.maxLoss), "neg"],
  ];

  return (
    <main className="flex-1 overflow-y-auto p-4 pb-10 space-y-4">
      <div className={"px-4 py-3 rounded-xl text-sm flex items-center gap-2 " + t.banner} style={reveal(0)}>
        <Check size={16} /> Backtest completed
        <span className="ml-auto text-[11px] opacity-70">
          {globals.startDate} → {globals.endDate}
        </span>
      </div>

      <div className={"p-4 " + t.card} style={reveal(1)}>
        <p className={t.sectionLabel}>
          Total PnL · {globals.index}{filterActive && " · filtered"}
        </p>
        <div className="flex items-end gap-2 mt-1">
          <span className={"text-4xl font-bold tracking-tight " +
            (result.totalPnl >= 0 ? "text-emerald-600" : "text-rose-600")}>
            <CountUp value={result.totalPnl} prefix="₹" />
          </span>
          {result.totalPnl >= 0
            ? <TrendingUp size={22} className="text-emerald-500 mb-1.5" />
            : <TrendingDown size={22} className="text-rose-500 mb-1.5" />}
        </div>
        <p className={"text-xs mt-1 " + t.muted}>
          {name} · {globals.startTime}–{globals.endTime} · {result.nTrades} trades
        </p>
      </div>

      {filtered.length > 0 && (
        <div style={reveal(2)}>
          <EquityCurve equity={result.equity} totalPnl={result.totalPnl} />
        </div>
      )}

      <div className={"p-4 " + t.card} style={reveal(3)}>
        <p className={t.sectionLabel + " mb-2"}>Summary</p>
        <div className="grid grid-cols-2 gap-x-5">
          {stats.map(([label, val, tone]) => (
            <div key={label} className={"flex items-center justify-between py-2.5 " + t.tableRow}>
              <span className={"text-sm " + t.body}>{label}</span>
              <span className={"text-sm font-semibold " +
                (tone === "pos" ? "text-emerald-600" : tone === "neg" ? "text-rose-500" : "")}>
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={"p-4 " + t.card} style={reveal(4)}>
        <p className={t.sectionLabel + " mb-3"}>Monthly report · 2024</p>
        <div className="space-y-2.5">
          {result.monthly.map((m, i) => (
            <div key={m.name} className="flex items-center gap-2">
              <span className={"w-9 text-xs " + t.muted}>{m.name}</span>
              <div className="flex-1 h-4 rounded-full bg-gray-200/40 overflow-hidden">
                <div className={"h-full rounded-full " + (m.pnl >= 0 ? "bg-emerald-500" : "bg-rose-500")}
                  style={{
                    width: mounted ? `${Math.max((Math.abs(m.pnl) / maxAbsMonthly) * 100, m.pnl === 0 ? 0 : 4)}%` : "0%",
                    transition: `width 800ms cubic-bezier(.2,.8,.2,1) ${450 + i * 100}ms`,
                  }} />
              </div>
              <span className={"w-24 text-right text-xs font-semibold " +
                (m.pnl >= 0 ? "text-emerald-600" : "text-rose-500")}>
                {fmtInr(m.pnl)}
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className={"p-4 " + t.card} style={reveal(5)}>
        <p className={t.sectionLabel + " mb-2"}>Drawdown matrix</p>
        {[
          ["Max drawdown", fmtInr(-result.maxDrawdown), "neg"],
          ["Drawdown period", result.ddPeriod, ""],
          ["Trades in drawdown", result.tradesInDd, ""],
        ].map(([label, val, tone]) => (
          <div key={label} className={"flex items-center justify-between py-2.5 " + t.tableRow}>
            <span className={"text-sm " + t.body}>{label}</span>
            <span className={"text-sm font-semibold " + (tone === "neg" ? "text-rose-500" : "")}>{val}</span>
          </div>
        ))}
      </div>

      {/* trades + filters + sorting */}
      <div className={"p-4 " + t.card} style={reveal(6)}>
        <div className="flex items-center justify-between mb-3 gap-2">
          <p className={t.sectionLabel}>
            Trades <span className={t.muted}>({filtered.length}{filtered.length !== trades.length && ` of ${trades.length}`})</span>
          </p>
          <div className="flex gap-1.5">
            <button onClick={() => setShowFilters((s) => !s)}
              className={"flex items-center gap-1.5 text-xs px-3 py-2 " +
                (showFilters || filterActive ? t.primaryBtn : t.ghostBtn)}>
              <SlidersHorizontal size={13} /> Filters
            </button>
            <button onClick={downloadCsv}
              className={"flex items-center gap-1.5 text-xs px-3 py-2 " + t.primaryBtn}>
              <Download size={13} /> CSV
            </button>
          </div>
        </div>

        {showFilters && (
          <div className={"p-3 mb-3 space-y-3 " + t.innerCard}>
            <DateFilterRow t={t} label="Entry date — year / month / day"
              value={fEntry} onChange={setFEntry} years={years} months={months} days={days} />
            <DateFilterRow t={t} label="Exit date — year / month / day"
              value={fExit} onChange={setFExit} years={years} months={months} days={days} />

            <div>
              <p className={t.fieldLabel}>Sort by</p>
              <div className="flex gap-2">
                <div className="flex-1">
                  <Select t={t} value={sortField}
                    onChange={setSortField}
                    options={SORT_FIELDS.map(([v]) => v)} />
                </div>
                <button onClick={() => setSortDir((d) => (d === "asc" ? "desc" : "asc"))}
                  className={"flex items-center gap-1.5 text-xs px-3 " + t.ghostBtn}>
                  {sortDir === "asc"
                    ? <><ArrowUpNarrowWide size={14} /> A→Z / Asc</>
                    : <><ArrowDownWideNarrow size={14} /> Z→A / Desc</>}
                </button>
              </div>
              <p className={"text-[11px] mt-1 " + t.muted}>
                {SORT_FIELDS.find(([v]) => v === sortField)?.[1]} · {sortDir === "asc" ? "ascending" : "descending"}
              </p>
            </div>

            {(filterActive || sortField !== "entryDate" || sortDir !== "asc") && (
              <button
                onClick={() => { setFEntry(emptyDateFilter); setFExit(emptyDateFilter); setSortField("entryDate"); setSortDir("asc"); }}
                className={"w-full py-2 text-xs flex items-center justify-center gap-1 " + t.ghostBtn}>
                <X size={12} /> Reset filters & sorting
              </button>
            )}
          </div>
        )}

        {filtered.length === 0 ? (
          <p className={"text-sm text-center py-6 " + t.muted}>No trades match these filters.</p>
        ) : (
          <div className="overflow-x-auto -mx-4 px-4">
            <table className="w-full text-xs whitespace-nowrap">
              <thead>
                <tr className={t.tableHead}>
                  {["B/S", "Instrument", "Entry", "Exit", "PnL", "Reason"].map((h) => (
                    <th key={h} className="text-left font-medium px-2 py-2.5">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map((x) => (
                  <tr key={x.id} className={t.tableRow}>
                    <td className="px-2 py-2.5">
                      <span className={"px-1.5 py-0.5 rounded text-[11px] font-medium " +
                        (x.side === "BUY" ? t.chipBuy : t.chipSell)}>{x.side}</span>
                    </td>
                    <td className={"px-2 py-2.5 " + t.body}>{x.instrument}</td>
                    <td className={"px-2 py-2.5 " + t.muted}>{x.entryDate.slice(5)} {x.entryTime.slice(0, 5)} @ {x.entryPrice}</td>
                    <td className={"px-2 py-2.5 " + t.muted}>{x.exitTime.slice(0, 5)} @ {x.exitPrice}</td>
                    <td className={"px-2 py-2.5 font-semibold " +
                      (x.pnl >= 0 ? "text-emerald-600" : "text-rose-500")}>
                      {x.pnl >= 0 ? "+" : ""}{x.pnl.toFixed(2)}
                    </td>
                    <td className={"px-2 py-2.5 text-[11px] " + t.muted}>{x.exitReason}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="flex gap-2" style={reveal(7)}>
        <button onClick={onBack}
          className={"flex-1 py-3 text-sm flex items-center justify-center gap-1.5 " + t.ghostBtn}>
          <ArrowLeft size={15} /> Back
        </button>
        {showRerun && (
          <button onClick={onRerun}
            className={"flex-1 py-3 text-sm flex items-center justify-center gap-1.5 " + t.primaryBtn}>
            <RotateCcw size={15} /> Run again
          </button>
        )}
      </div>
    </main>
  );
}
