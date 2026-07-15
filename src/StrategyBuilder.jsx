import { useState, useEffect, useRef } from "react";
import {
  Plus, Copy, X, ChevronDown, ChevronRight, Play, Save,
  Settings2, Boxes, Pencil, Check, Clock, Zap, Palette,
  ArrowLeft, Download, TrendingUp, TrendingDown, Calendar, RotateCcw
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   GenZ Backtesting — Mobile Strategy Builder + Results
   • 6 switchable themes (palette pills, top right)
   • Dates & times are asked just before running (Run sheet)
   • Animated results: summary, equity curve, monthly report,
     drawdown matrix, trades table + CSV download
   ───────────────────────────────────────────────────────── */

const THEMES = {
  kite: {
    label: "Kite",
    app: "bg-white text-gray-800",
    shell: "bg-white",
    header: "bg-white/95 border-b border-gray-200",
    brand: "text-blue-600",
    card: "bg-white border border-gray-200 rounded-md",
    innerCard: "bg-white border border-gray-200 rounded-md",
    rowItem: "bg-gray-50 border border-gray-200 rounded-md",
    sectionLabel: "text-[10px] uppercase tracking-widest text-gray-400 font-medium",
    input:
      "w-full bg-white border border-gray-300 rounded px-3 py-2 text-sm text-gray-800 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-200 placeholder-gray-400",
    fieldLabel: "text-[11px] text-gray-500 mb-1",
    primaryBtn: "bg-blue-600 hover:bg-blue-700 text-white rounded font-medium",
    ghostBtn: "border border-gray-300 text-gray-600 hover:bg-gray-50 rounded",
    linkAccent: "text-blue-600",
    tabWrap: "border-b border-gray-200",
    tabOn: "text-blue-600 border-b-2 border-blue-600 font-medium",
    tabOff: "text-gray-500 border-b-2 border-transparent",
    chipBuy: "bg-blue-50 text-blue-700",
    chipSell: "bg-orange-50 text-orange-600",
    token: "bg-blue-50 text-blue-700 border border-blue-100 rounded",
    op: "bg-gray-100 text-gray-600 border border-gray-200 rounded",
    toggleOn: "bg-blue-600",
    dashed: "border border-dashed border-gray-300 text-gray-500 hover:border-blue-500 hover:text-blue-600 rounded-md",
    footer: "bg-white/95 border-t border-gray-200",
    muted: "text-gray-400",
    body: "text-gray-700",
    exprId: "text-blue-700", exprOp: "text-orange-600", exprNum: "text-gray-900 font-semibold", exprLogic: "text-gray-500 font-semibold",
    sheet: "bg-white rounded-t-2xl border-t border-gray-200",
    radioOn: "border-blue-600 bg-blue-50 text-gray-800",
    radioOff: "border-gray-200 text-gray-500",
    dotOn: "border-blue-600 bg-blue-600",
    statusDone: "text-green-600", statusRun: "text-orange-500", statusQueue: "text-blue-600",
    banner: "bg-green-50 border border-green-200 text-green-700",
    tableHead: "bg-gray-50 text-gray-500",
    tableRow: "border-b border-gray-100",
    font: "'Inter', system-ui, sans-serif",
  },
  soft: {
    label: "Soft",
    app: "bg-gray-100 text-slate-800",
    shell: "bg-gray-100",
    header: "bg-gray-100/95 border-b border-gray-200/70",
    brand: "text-indigo-600",
    card: "bg-white rounded-2xl shadow-sm border border-gray-100",
    innerCard: "bg-gray-50 rounded-xl border border-gray-100",
    rowItem: "bg-white rounded-xl border border-gray-100 shadow-sm",
    sectionLabel: "text-[10px] uppercase tracking-widest text-slate-400 font-semibold",
    input:
      "w-full bg-white border border-gray-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-indigo-400 focus:ring-2 focus:ring-indigo-100 placeholder-slate-400",
    fieldLabel: "text-[11px] text-slate-500 mb-1",
    primaryBtn: "bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl font-medium shadow-sm",
    ghostBtn: "border border-gray-200 text-slate-500 hover:bg-white rounded-lg",
    linkAccent: "text-indigo-600",
    tabWrap: "bg-gray-200/70 rounded-xl p-1",
    tabOn: "bg-white text-indigo-600 rounded-lg shadow-sm font-medium",
    tabOff: "text-slate-500 rounded-lg",
    chipBuy: "bg-indigo-50 text-indigo-600",
    chipSell: "bg-rose-50 text-rose-500",
    token: "bg-indigo-50 text-indigo-600 border border-indigo-100 rounded-lg",
    op: "bg-gray-100 text-slate-500 border border-gray-200 rounded-lg",
    toggleOn: "bg-indigo-600",
    dashed: "border-2 border-dashed border-gray-200 text-slate-400 hover:border-indigo-300 hover:text-indigo-600 rounded-2xl",
    footer: "bg-white/95 border-t border-gray-200 shadow-lg",
    muted: "text-slate-400",
    body: "text-slate-600",
    exprId: "text-indigo-600", exprOp: "text-rose-500", exprNum: "text-slate-900 font-semibold", exprLogic: "text-slate-400 font-semibold",
    sheet: "bg-white rounded-t-3xl shadow-2xl",
    radioOn: "border-indigo-500 bg-indigo-50 text-slate-800",
    radioOff: "border-gray-200 text-slate-500",
    dotOn: "border-indigo-600 bg-indigo-600",
    statusDone: "text-emerald-600", statusRun: "text-amber-500", statusQueue: "text-indigo-600",
    banner: "bg-emerald-50 border border-emerald-200 text-emerald-700",
    tableHead: "bg-gray-50 text-slate-500",
    tableRow: "border-b border-gray-100",
    font: "'Inter', system-ui, sans-serif",
  },
  mint: {
    label: "Mint",
    app: "bg-stone-50 text-stone-800",
    shell: "bg-stone-50",
    header: "bg-stone-50/95 border-b border-stone-200",
    brand: "text-emerald-700",
    card: "bg-white rounded-xl border border-stone-200",
    innerCard: "bg-stone-50 rounded-lg border border-stone-200",
    rowItem: "bg-white rounded-lg border border-stone-200",
    sectionLabel: "text-[10px] uppercase tracking-widest text-stone-400 font-semibold",
    input:
      "w-full bg-white border border-stone-300 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-100 placeholder-stone-400",
    fieldLabel: "text-[11px] text-stone-500 mb-1",
    primaryBtn: "bg-emerald-600 hover:bg-emerald-700 text-white rounded-full font-medium",
    ghostBtn: "border border-stone-300 text-stone-500 hover:bg-stone-100 rounded-full",
    linkAccent: "text-emerald-700",
    tabWrap: "bg-stone-200/60 rounded-full p-1",
    tabOn: "bg-white text-emerald-700 rounded-full shadow-sm font-medium",
    tabOff: "text-stone-500 rounded-full",
    chipBuy: "bg-emerald-50 text-emerald-700",
    chipSell: "bg-red-50 text-red-600",
    token: "bg-emerald-50 text-emerald-700 border border-emerald-100 rounded-full",
    op: "bg-stone-100 text-stone-500 border border-stone-200 rounded-full",
    toggleOn: "bg-emerald-600",
    dashed: "border border-dashed border-stone-300 text-stone-500 hover:border-emerald-500 hover:text-emerald-700 rounded-xl",
    footer: "bg-white/95 border-t border-stone-200",
    muted: "text-stone-400",
    body: "text-stone-600",
    exprId: "text-emerald-700", exprOp: "text-red-500", exprNum: "text-stone-900 font-semibold", exprLogic: "text-stone-400 font-semibold",
    sheet: "bg-white rounded-t-2xl border-t border-stone-200",
    radioOn: "border-emerald-600 bg-emerald-50 text-stone-800",
    radioOff: "border-stone-200 text-stone-500",
    dotOn: "border-emerald-600 bg-emerald-600",
    statusDone: "text-emerald-600", statusRun: "text-amber-600", statusQueue: "text-emerald-700",
    banner: "bg-emerald-50 border border-emerald-200 text-emerald-700",
    tableHead: "bg-stone-100 text-stone-500",
    tableRow: "border-b border-stone-100",
    font: "'Inter', system-ui, sans-serif",
  },
  dusk: {
    label: "Dusk",
    app: "bg-slate-900 text-slate-200",
    shell: "bg-slate-900",
    header: "bg-slate-900/95 border-b border-slate-800",
    brand: "text-sky-400",
    card: "bg-slate-800/60 rounded-xl border border-slate-700/60",
    innerCard: "bg-slate-800 rounded-lg border border-slate-700/60",
    rowItem: "bg-slate-900/60 rounded-lg border border-slate-700/60",
    sectionLabel: "text-[10px] uppercase tracking-widest text-slate-500 font-semibold",
    input:
      "w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-100 focus:outline-none focus:border-sky-500 focus:ring-1 focus:ring-sky-900 placeholder-slate-600",
    fieldLabel: "text-[11px] text-slate-400 mb-1",
    primaryBtn: "bg-sky-500 hover:bg-sky-400 text-slate-950 rounded-lg font-semibold",
    ghostBtn: "border border-slate-700 text-slate-400 hover:bg-slate-800 rounded-lg",
    linkAccent: "text-sky-400",
    tabWrap: "bg-slate-800 rounded-xl p-1",
    tabOn: "bg-slate-700 text-sky-300 rounded-lg font-medium",
    tabOff: "text-slate-500 rounded-lg",
    chipBuy: "bg-sky-500/15 text-sky-300",
    chipSell: "bg-rose-500/15 text-rose-300",
    token: "bg-sky-500/10 text-sky-300 border border-sky-500/20 rounded-lg",
    op: "bg-slate-800 text-slate-400 border border-slate-700 rounded-lg",
    toggleOn: "bg-sky-500",
    dashed: "border border-dashed border-slate-700 text-slate-500 hover:border-sky-500 hover:text-sky-400 rounded-xl",
    footer: "bg-slate-900/95 border-t border-slate-800",
    muted: "text-slate-500",
    body: "text-slate-300",
    exprId: "text-sky-300", exprOp: "text-rose-300", exprNum: "text-amber-300 font-semibold", exprLogic: "text-slate-400 font-semibold",
    sheet: "bg-slate-900 rounded-t-2xl border-t border-slate-700",
    radioOn: "border-sky-500 bg-sky-500/10 text-slate-100",
    radioOff: "border-slate-700 text-slate-400",
    dotOn: "border-sky-400 bg-sky-400",
    statusDone: "text-emerald-400", statusRun: "text-amber-400", statusQueue: "text-sky-400",
    banner: "bg-emerald-500/10 border border-emerald-500/30 text-emerald-300",
    tableHead: "bg-slate-800 text-slate-400",
    tableRow: "border-b border-slate-800",
    font: "'Inter', system-ui, sans-serif",
  },
  blush: {
    label: "Blush",
    app: "bg-rose-50 text-stone-800",
    shell: "bg-rose-50",
    header: "bg-rose-50/95 border-b border-rose-100",
    brand: "text-rose-500",
    card: "bg-white rounded-2xl border border-rose-100 shadow-sm",
    innerCard: "bg-rose-50/60 rounded-xl border border-rose-100",
    rowItem: "bg-white rounded-xl border border-rose-100",
    sectionLabel: "text-[10px] uppercase tracking-widest text-rose-300 font-semibold",
    input:
      "w-full bg-white border border-rose-200 rounded-lg px-3 py-2 text-sm text-stone-800 focus:outline-none focus:border-rose-400 focus:ring-2 focus:ring-rose-100 placeholder-stone-400",
    fieldLabel: "text-[11px] text-stone-500 mb-1",
    primaryBtn: "bg-rose-500 hover:bg-rose-600 text-white rounded-xl font-medium shadow-sm",
    ghostBtn: "border border-rose-200 text-stone-500 hover:bg-rose-50 rounded-lg",
    linkAccent: "text-rose-500",
    tabWrap: "bg-rose-100/70 rounded-xl p-1",
    tabOn: "bg-white text-rose-500 rounded-lg shadow-sm font-medium",
    tabOff: "text-stone-500 rounded-lg",
    chipBuy: "bg-teal-50 text-teal-600",
    chipSell: "bg-rose-100 text-rose-600",
    token: "bg-rose-50 text-rose-500 border border-rose-200 rounded-lg",
    op: "bg-stone-100 text-stone-500 border border-stone-200 rounded-lg",
    toggleOn: "bg-rose-500",
    dashed: "border-2 border-dashed border-rose-200 text-stone-400 hover:border-rose-400 hover:text-rose-500 rounded-2xl",
    footer: "bg-white/95 border-t border-rose-100",
    muted: "text-stone-400",
    body: "text-stone-600",
    exprId: "text-rose-500", exprOp: "text-teal-600", exprNum: "text-stone-900 font-semibold", exprLogic: "text-stone-400 font-semibold",
    sheet: "bg-white rounded-t-3xl shadow-2xl",
    radioOn: "border-rose-400 bg-rose-50 text-stone-800",
    radioOff: "border-rose-100 text-stone-500",
    dotOn: "border-rose-500 bg-rose-500",
    statusDone: "text-teal-600", statusRun: "text-amber-500", statusQueue: "text-rose-500",
    banner: "bg-teal-50 border border-teal-200 text-teal-700",
    tableHead: "bg-rose-50 text-stone-500",
    tableRow: "border-b border-rose-50",
    font: "'Inter', system-ui, sans-serif",
  },
  ocean: {
    label: "Ocean",
    app: "bg-blue-50 text-slate-800",
    shell: "bg-blue-50",
    header: "bg-blue-50/95 border-b border-blue-100",
    brand: "text-blue-700",
    card: "bg-white rounded-2xl border border-blue-100 shadow-sm",
    innerCard: "bg-blue-50/50 rounded-xl border border-blue-100",
    rowItem: "bg-white rounded-xl border border-blue-100",
    sectionLabel: "text-[10px] uppercase tracking-widest text-blue-300 font-semibold",
    input:
      "w-full bg-white border border-blue-200 rounded-lg px-3 py-2 text-sm text-slate-800 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100 placeholder-slate-400",
    fieldLabel: "text-[11px] text-slate-500 mb-1",
    primaryBtn: "bg-blue-700 hover:bg-blue-800 text-white rounded-xl font-medium shadow-sm",
    ghostBtn: "border border-blue-200 text-slate-500 hover:bg-blue-50 rounded-lg",
    linkAccent: "text-blue-700",
    tabWrap: "bg-blue-100/70 rounded-xl p-1",
    tabOn: "bg-white text-blue-700 rounded-lg shadow-sm font-medium",
    tabOff: "text-slate-500 rounded-lg",
    chipBuy: "bg-cyan-50 text-cyan-700",
    chipSell: "bg-orange-50 text-orange-600",
    token: "bg-blue-50 text-blue-700 border border-blue-200 rounded-lg",
    op: "bg-slate-100 text-slate-500 border border-slate-200 rounded-lg",
    toggleOn: "bg-blue-700",
    dashed: "border-2 border-dashed border-blue-200 text-slate-400 hover:border-blue-500 hover:text-blue-700 rounded-2xl",
    footer: "bg-white/95 border-t border-blue-100",
    muted: "text-slate-400",
    body: "text-slate-600",
    exprId: "text-blue-700", exprOp: "text-orange-600", exprNum: "text-slate-900 font-semibold", exprLogic: "text-slate-400 font-semibold",
    sheet: "bg-white rounded-t-3xl shadow-2xl",
    radioOn: "border-blue-500 bg-blue-50 text-slate-800",
    radioOff: "border-blue-100 text-slate-500",
    dotOn: "border-blue-700 bg-blue-700",
    statusDone: "text-emerald-600", statusRun: "text-amber-500", statusQueue: "text-blue-700",
    banner: "bg-emerald-50 border border-emerald-200 text-emerald-700",
    tableHead: "bg-blue-50 text-slate-500",
    tableRow: "border-b border-blue-50",
    font: "'Inter', system-ui, sans-serif",
  },
};

const TIMEFRAMES = ["1m", "3m", "5m", "15m"];
const INDICATOR_TYPES = ["SMA", "EMA", "RSI", "SUPERTREND"];
const PRICE_FIELDS = ["open", "high", "low", "close"];
const INSTRUMENTS = ["NIFTY", "BANKNIFTY", "FINNIFTY", "SBIN (CASH)", "RELIANCE (CASH)"];
const EXPIRY_TYPES = ["WEEKLY", "NEXT_WEEKLY", "MONTHLY"];
const PATTERNS = [
  { name: "Bullish Engulfing", candles: 2 }, { name: "Bearish Engulfing", candles: 2 },
  { name: "Bullish Harami", candles: 2 }, { name: "Bearish Harami", candles: 2 },
  { name: "Piercing Line", candles: 2 }, { name: "Dark Cloud Cover", candles: 2 },
  { name: "Doji", candles: 1 }, { name: "Hammer", candles: 1 },
  { name: "Inverted Hammer", candles: 1 }, { name: "Shooting Star", candles: 1 },
  { name: "Marubozu", candles: 1 },
];

let _id = 100;
const uid = () => ++_id;

/* ─── dummy backtest result: Jan → Jun 2024, mostly green ── */

const MONTH_NAMES = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN"];

const DUMMY_TRADES = (() => {
  const trades = [];
  let n = 0;
  for (let m = 0; m < 6; m++) {
    const perMonth = 6 + (m % 2); // 6–7 trades a month
    for (let i = 0; i < perMonth; i++) {
      n++;
      const seed = n * 7919; // deterministic pseudo-random
      const win = seed % 10 < 7; // ~70% winners
      const pnl = win
        ? +(650 + (seed % 2900) + m * 90).toFixed(2)
        : -+(380 + (seed % 1500)).toFixed(2);
      const day = String(2 + ((seed >> 3) % 24)).padStart(2, "0");
      const strike = 21500 + ((seed >> 2) % 12) * 50 + m * 100;
      const side = seed % 3 === 0 ? "SELL" : "BUY";
      const entryPrice = +(150 + (seed % 90)).toFixed(2);
      const exitPrice = +(entryPrice + (side === "BUY" ? 1 : -1) * pnl / 65).toFixed(2);
      trades.push({
        id: n,
        side,
        qty: 65,
        orderId: `1.${(i % 3) + 1}.0`,
        instrument: `NIFTY${day}${MONTH_NAMES[m]}24${strike}${seed % 2 ? "CE" : "PE"}`,
        strike,
        entryDate: `2024-${String(m + 1).padStart(2, "0")}-${day}`,
        entryTime: `09:${String(31 + (seed % 25)).padStart(2, "0")}:00`,
        exitDate: `2024-${String(m + 1).padStart(2, "0")}-${day}`,
        exitTime: pnl > 0 && seed % 4 === 0 ? "14:59:00" : `1${1 + (seed % 4)}:${String(10 + (seed % 45)).padStart(2, "0")}:00`,
        entryPrice,
        exitPrice,
        pnl,
        exitReason: pnl > 0
          ? (seed % 4 === 0 ? "TIME_BASED_EXIT" : "TARGET_HIT")
          : "STOPLOSS_HIT",
        month: m,
      });
    }
  }
  return trades;
})();

const computeResult = (trades) => {
  const wins = trades.filter((x) => x.pnl > 0);
  const losses = trades.filter((x) => x.pnl <= 0);
  const totalPnl = trades.reduce((a, x) => a + x.pnl, 0);

  // equity curve + max drawdown
  let cum = 0, peak = 0, mdd = 0, ddStart = 0, ddEnd = 0, curPeakIdx = 0;
  const equity = [0];
  trades.forEach((x, i) => {
    cum += x.pnl;
    equity.push(cum);
    if (cum > peak) { peak = cum; curPeakIdx = i; }
    const dd = peak - cum;
    if (dd > mdd) { mdd = dd; ddStart = curPeakIdx; ddEnd = i; }
  });

  const monthly = MONTH_NAMES.map((name, m) => ({
    name,
    pnl: +trades.filter((x) => x.month === m).reduce((a, x) => a + x.pnl, 0).toFixed(2),
  }));

  return {
    totalPnl: +totalPnl.toFixed(2),
    nTrades: trades.length,
    nWins: wins.length,
    winPct: +((wins.length / trades.length) * 100).toFixed(2),
    nLosses: losses.length,
    lossPct: +((losses.length / trades.length) * 100).toFixed(2),
    maxProfit: Math.max(...trades.map((x) => x.pnl)),
    maxLoss: Math.min(...trades.map((x) => x.pnl)),
    equity,
    maxDrawdown: +mdd.toFixed(2),
    ddPeriod: trades[ddStart] && trades[ddEnd]
      ? `${trades[ddStart].entryDate} → ${trades[ddEnd].exitDate}` : "—",
    tradesInDd: ddEnd - ddStart + 1,
    monthly,
  };
};

const fmtInr = (v) =>
  (v < 0 ? "-" : "") + "₹" + Math.abs(v).toLocaleString("en-IN", { maximumFractionDigits: 2 });

/* ─── atoms ────────────────────────────────────────────── */

const Field = ({ t, label, children }) => (
  <label className="block">
    <span className={"block " + t.fieldLabel}>{label}</span>
    {children}
  </label>
);

const Select = ({ t, value, onChange, options }) => (
  <div className="relative">
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={t.input + " appearance-none pr-8"}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
    <ChevronDown size={14} className={"absolute right-2.5 top-2.5 pointer-events-none " + t.muted} />
  </div>
);

const Toggle = ({ t, on, onChange }) => (
  <button type="button" onClick={() => onChange(!on)}
    className={"w-10 h-5 rounded-full transition-colors relative shrink-0 " +
      (on ? t.toggleOn : "bg-gray-300")}>
    <span className={"absolute top-0.5 w-4 h-4 rounded-full bg-white shadow transition-all " +
      (on ? "left-5" : "left-0.5")} />
  </button>
);

const IconBtn = ({ t, onClick, children, danger }) => (
  <button type="button" onClick={onClick}
    className={"p-1.5 " + (danger
      ? "text-red-400 hover:bg-red-50 rounded-md"
      : t.ghostBtn)}>
    {children}
  </button>
);

const Expr = ({ t, text }) => {
  if (!text) return <span className={"italic text-xs " + t.muted}>no condition — always true</span>;
  const parts = text.split(/(\s+|\(|\))/g);
  return (
    <span className="font-mono text-xs leading-relaxed break-words">
      {parts.map((p, i) => {
        let c = t.body;
        if (/^(AND|OR|and|or)$/.test(p)) c = t.exprLogic;
        else if (/^[><=+\-*/]+$/.test(p)) c = t.exprOp;
        else if (/^[\d.:]+$/.test(p)) c = t.exprNum;
        else if (/^[()]$/.test(p)) c = t.muted;
        else if (/\w/.test(p)) c = t.exprId;
        return <span key={i} className={c}>{p}</span>;
      })}
    </span>
  );
};

/* count-up number for the results screen */
function CountUp({ value, duration = 900, prefix = "", decimals = 2 }) {
  const [display, setDisplay] = useState(0);
  useEffect(() => {
    let raf, start;
    const step = (ts) => {
      if (!start) start = ts;
      const p = Math.min((ts - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setDisplay(value * eased);
      if (p < 1) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [value, duration]);
  return <>{prefix}{display.toLocaleString("en-IN", { maximumFractionDigits: decimals, minimumFractionDigits: 0 })}</>;
}

/* ─── defaults ─────────────────────────────────────────── */

const newPosition = (n) => ({
  id: uid(), name: `Position ${String(n).padStart(2, "0")}`, open: true,
  side: "SELL", optionType: "CE", instrument: "NIFTY", expiry: "WEEKLY",
  strikeMode: "ATM", strikeStep: 1, premium: 200,
  lotType: "LOTS", lots: 1, maxFund: 100000,
  targetOn: true, targetType: "PERCENT", targetValue: 15,
  slOn: true, slType: "PERCENT", slValue: 15,
  trailOn: false, trailX: 10, trailY: 10, trailUnit: "POINT", trailMethod: "CONTINUOUS",
  momentumOn: false, momentumType: "PERCENT_UP", momentumValue: 2,
  reSlType: "NONE", reSlCount: 0, reTgtType: "NONE", reTgtCount: 0,
});

const newBlock = (n) => ({
  id: uid(), name: `Block ${String(n).padStart(2, "0")}`, open: true,
  entry: "", exit: "", entryTf: "5m", exitTf: "5m",
  positions: [newPosition(1)],
});

/* ─── bottom sheets ────────────────────────────────────── */

function Sheet({ t, title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={"relative w-full max-w-md p-4 pb-6 max-h-[85vh] overflow-y-auto " + t.sheet}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold">{title}</h3>
          <IconBtn t={t} onClick={onClose}><X size={14} /></IconBtn>
        </div>
        {children}
      </div>
    </div>
  );
}

function IndicatorSheet({ t, onAdd, onClose }) {
  const [type, setType] = useState("RSI");
  const [period, setPeriod] = useState(14);
  const [tf, setTf] = useState("5m");
  const name = type === "SUPERTREND"
    ? `supertrend_${tf.replace("m", "")}`
    : `${type.toLowerCase()}_${period}_${tf.replace("m", "")}`;
  return (
    <Sheet t={t} title="Add indicator" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field t={t} label="Type"><Select t={t} value={type} onChange={setType} options={INDICATOR_TYPES} /></Field>
        <Field t={t} label="Timeframe"><Select t={t} value={tf} onChange={setTf} options={TIMEFRAMES} /></Field>
        {type !== "SUPERTREND" && (
          <Field t={t} label="Period">
            <input type="number" className={t.input} value={period} onChange={(e) => setPeriod(e.target.value)} />
          </Field>
        )}
      </div>
      <p className={"mt-3 text-xs " + t.muted}>
        Reference in conditions as <span className={"font-mono " + t.exprId}>{name}</span>
      </p>
      <button onClick={() => { onAdd({ id: uid(), name, type, period, tf }); onClose(); }}
        className={"mt-4 w-full py-2.5 text-sm " + t.primaryBtn}>
        Add {name}
      </button>
    </Sheet>
  );
}

function PriceSheet({ t, onAdd, onClose }) {
  const [field, setField] = useState("close");
  const [tf, setTf] = useState("5m");
  const [prev, setPrev] = useState(false);
  const name = `${prev ? "prev_" : ""}${field}_${tf.replace("m", "")}`;
  return (
    <Sheet t={t} title="Add cash price" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field t={t} label="Field"><Select t={t} value={field} onChange={setField} options={PRICE_FIELDS} /></Field>
        <Field t={t} label="Timeframe"><Select t={t} value={tf} onChange={setTf} options={TIMEFRAMES} /></Field>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className={"text-sm " + t.body}>Previous candle</span>
        <Toggle t={t} on={prev} onChange={setPrev} />
      </div>
      <p className={"mt-3 text-xs " + t.muted}>
        Reference as <span className={"font-mono " + t.exprId}>{name}</span>
      </p>
      <button onClick={() => { onAdd({ id: uid(), name, field, tf, prev }); onClose(); }}
        className={"mt-4 w-full py-2.5 text-sm " + t.primaryBtn}>
        Add {name}
      </button>
    </Sheet>
  );
}

function PatternSheet({ t, onAdd, onClose }) {
  const [tf, setTf] = useState("5m");
  return (
    <Sheet t={t} title="Add pattern scan" onClose={onClose}>
      <Field t={t} label="Timeframe"><Select t={t} value={tf} onChange={setTf} options={TIMEFRAMES} /></Field>
      <div className="mt-3 max-h-64 overflow-y-auto space-y-1.5">
        {PATTERNS.map((p) => {
          const name = p.name.toLowerCase().replace(/ /g, "_") + "_" + tf.replace("m", "");
          return (
            <button key={p.name}
              onClick={() => { onAdd({ id: uid(), name, type: "PATTERN", tf }); onClose(); }}
              className={"w-full flex items-center justify-between px-3 py-2 text-left " + t.rowItem}>
              <span className={"text-sm " + t.body}>{p.name}</span>
              <span className={"text-[10px] uppercase " + t.muted}>{p.candles} candle</span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

function ConditionSheet({ t, title, value, tokens, onSave, onClose }) {
  const [text, setText] = useState(value);
  return (
    <Sheet t={t} title={title} onClose={onClose}>
      <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 500))}
        rows={5} placeholder="e.g. rsi_14_5 > 60 AND close_5 > ema_20_5"
        className={t.input + " font-mono text-xs resize-none"} />
      <div className={"flex justify-between text-[10px] mt-1 " + t.muted}>
        <span>Operators: AND OR &gt; &lt; &gt;= &lt;= + - * /</span>
        <span>{text.length}/500</span>
      </div>
      {tokens.length > 0 && (
        <>
          <p className={"text-xs mt-3 mb-1.5 " + t.muted}>Tap to insert (defined in Setup):</p>
          <div className="flex flex-wrap gap-1.5">
            {tokens.map((tok) => (
              <button key={tok} onClick={() => setText((s) => (s ? s + " " + tok : tok))}
                className={"px-2 py-1 font-mono text-[11px] " + t.token}>
                {tok}
              </button>
            ))}
            {["AND", "OR", ">", "<", ">=", "<="].map((op) => (
              <button key={op} onClick={() => setText((s) => (s ? s + " " + op : op))}
                className={"px-2 py-1 font-mono text-[11px] " + t.op}>
                {op}
              </button>
            ))}
          </div>
        </>
      )}
      <button onClick={() => { onSave(text.trim()); onClose(); }}
        className={"mt-4 w-full py-2.5 text-sm " + t.primaryBtn}>
        Save condition
      </button>
    </Sheet>
  );
}

/* run sheet: dates & times asked right before the backtest */
function RunSheet({ t, globals, setG, onRun, onClose, blocksCount, posCount }) {
  return (
    <Sheet t={t} title="Backtest period" onClose={onClose}>
      <p className={"text-xs mb-3 " + t.muted}>
        <Calendar size={12} className="inline mr-1 -mt-0.5" />
        Choose the date & time window to test <b>{blocksCount}</b> block(s) with <b>{posCount}</b> position(s).
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field t={t} label="Start date"><input type="date" className={t.input} value={globals.startDate} onChange={(e) => setG("startDate", e.target.value)} /></Field>
        <Field t={t} label="End date"><input type="date" className={t.input} value={globals.endDate} onChange={(e) => setG("endDate", e.target.value)} /></Field>
        <Field t={t} label="Start time"><input type="time" className={t.input} value={globals.startTime} onChange={(e) => setG("startTime", e.target.value)} /></Field>
        <Field t={t} label="End time"><input type="time" className={t.input} value={globals.endTime} onChange={(e) => setG("endTime", e.target.value)} /></Field>
      </div>
      <button onClick={onRun}
        className={"mt-4 w-full py-3 text-sm flex items-center justify-center gap-1.5 " + t.primaryBtn}>
        <Play size={14} fill="currentColor" /> Run Backtest
      </button>
    </Sheet>
  );
}

/* ─── equity curve (animated SVG, always on dark panel) ─── */

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
  const px = (i) => PAD + (i / (equity.length - 1)) * (W - PAD * 2);
  const py = (v) => H - PAD - ((v - min) / range) * (H - PAD * 2);
  const line = equity.map((v, i) => `${i === 0 ? "M" : "L"}${px(i).toFixed(1)},${py(v).toFixed(1)}`).join(" ");
  const area = line + ` L${px(equity.length - 1).toFixed(1)},${H - PAD} L${PAD},${H - PAD} Z`;
  const zeroY = py(0);

  return (
    <div className="bg-slate-900 rounded-2xl p-4 border border-slate-800">
      <div className="flex items-center justify-between mb-2">
        <p className="text-xs font-semibold text-slate-200">Equity curve · cumulative PnL</p>
        <span className={"text-xs font-mono font-semibold " + (totalPnl >= 0 ? "text-emerald-400" : "text-rose-400")}>
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
        {/* grid */}
        {[0.25, 0.5, 0.75].map((f) => (
          <line key={f} x1={PAD} x2={W - PAD} y1={PAD + f * (H - PAD * 2)} y2={PAD + f * (H - PAD * 2)}
            stroke="#334155" strokeWidth="0.5" strokeDasharray="3 4" />
        ))}
        {/* zero line */}
        <line x1={PAD} x2={W - PAD} y1={zeroY} y2={zeroY} stroke="#64748b" strokeWidth="0.7" strokeDasharray="2 3" />
        {/* area fades in after the line draws */}
        <path d={area} fill="url(#eqfill)"
          style={{ opacity: drawn ? 1 : 0, transition: "opacity 700ms ease 900ms" }} />
        {/* animated line */}
        <path d={line} fill="none" stroke="#34d399" strokeWidth="2.2"
          strokeLinecap="round" strokeLinejoin="round" pathLength="1"
          strokeDasharray="1" strokeDashoffset={drawn ? 0 : 1}
          style={{ transition: "stroke-dashoffset 1400ms ease-out" }} />
        {/* end dot */}
        <circle cx={px(equity.length - 1)} cy={py(equity[equity.length - 1])} r="3.5"
          fill="#34d399" style={{ opacity: drawn ? 1 : 0, transition: "opacity 300ms ease 1300ms" }} />
      </svg>
      <p className="text-[10px] text-slate-500 mt-1 font-mono">
        {equity.length - 1} trades · final {fmtInr(equity[equity.length - 1])}
      </p>
    </div>
  );
}

/* ─── results view ─────────────────────────────────────── */

function ResultsView({ t, trades, result, globals, name, onBack, onRerun }) {
  const [mounted, setMounted] = useState(false);
  useEffect(() => {
    const id = setTimeout(() => setMounted(true), 100);
    return () => clearTimeout(id);
  }, []);

  const downloadCsv = () => {
    const head = "b/s,qty,order_id,instrument_name,strike,entry_date,entry_time,exit_date,exit_time,entry_price,exit_price,pnl,exit_reason";
    const rows = trades.map((x) =>
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
    transition: `opacity 500ms ease ${i * 120}ms, transform 500ms ease ${i * 120}ms`,
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
      {/* banner */}
      <div className={"px-4 py-3 rounded-xl text-sm flex items-center gap-2 " + t.banner} style={reveal(0)}>
        <Check size={15} /> Backtest completed
        <span className={"ml-auto text-[10px] font-mono opacity-70"}>
          {globals.startDate} → {globals.endDate}
        </span>
      </div>

      {/* hero PnL */}
      <div className={"p-4 " + t.card} style={reveal(1)}>
        <p className={t.sectionLabel}>Total PnL · {globals.index}</p>
        <div className="flex items-end gap-2 mt-1">
          <span className={"text-3xl font-bold tracking-tight " +
            (result.totalPnl >= 0 ? "text-emerald-600" : "text-rose-600")}>
            <CountUp value={result.totalPnl} prefix="₹" />
          </span>
          {result.totalPnl >= 0
            ? <TrendingUp size={20} className="text-emerald-500 mb-1" />
            : <TrendingDown size={20} className="text-rose-500 mb-1" />}
        </div>
        <p className={"text-[11px] mt-1 " + t.muted}>
          {name} · {globals.startTime}–{globals.endTime} · {result.nTrades} trades in 6 months
        </p>
      </div>

      {/* equity curve */}
      <div style={reveal(2)}>
        <EquityCurve equity={result.equity} totalPnl={result.totalPnl} />
      </div>

      {/* summary grid */}
      <div className={"p-4 " + t.card} style={reveal(3)}>
        <p className={t.sectionLabel + " mb-2"}>Summary</p>
        <div className="grid grid-cols-2 gap-x-4">
          {stats.map(([label, val, tone]) => (
            <div key={label} className={"flex items-center justify-between py-2 " + t.tableRow}>
              <span className={"text-xs " + t.body}>{label}</span>
              <span className={"text-xs font-semibold font-mono " +
                (tone === "pos" ? "text-emerald-600" : tone === "neg" ? "text-rose-500" : "")}>
                {val}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* monthly report — animated bars */}
      <div className={"p-4 " + t.card} style={reveal(4)}>
        <p className={t.sectionLabel + " mb-3"}>Monthly report · 2024</p>
        <div className="space-y-2">
          {result.monthly.map((m, i) => (
            <div key={m.name} className="flex items-center gap-2">
              <span className={"w-8 text-[10px] font-mono " + t.muted}>{m.name}</span>
              <div className="flex-1 h-4 rounded-full bg-gray-200/40 overflow-hidden">
                <div className={"h-full rounded-full " + (m.pnl >= 0 ? "bg-emerald-500" : "bg-rose-500")}
                  style={{
                    width: mounted ? `${Math.max((Math.abs(m.pnl) / maxAbsMonthly) * 100, 4)}%` : "0%",
                    transition: `width 800ms cubic-bezier(.2,.8,.2,1) ${500 + i * 110}ms`,
                  }} />
              </div>
              <span className={"w-20 text-right text-[11px] font-mono font-semibold " +
                (m.pnl >= 0 ? "text-emerald-600" : "text-rose-500")}>
                {fmtInr(m.pnl)}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* drawdown matrix */}
      <div className={"p-4 " + t.card} style={reveal(5)}>
        <p className={t.sectionLabel + " mb-2"}>Drawdown matrix</p>
        {[
          ["Max drawdown", fmtInr(-result.maxDrawdown), "neg"],
          ["Drawdown period", result.ddPeriod, ""],
          ["Trades in drawdown", result.tradesInDd, ""],
        ].map(([label, val, tone]) => (
          <div key={label} className={"flex items-center justify-between py-2 " + t.tableRow}>
            <span className={"text-xs " + t.body}>{label}</span>
            <span className={"text-xs font-semibold font-mono " + (tone === "neg" ? "text-rose-500" : "")}>{val}</span>
          </div>
        ))}
      </div>

      {/* trades table */}
      <div className={"p-4 " + t.card} style={reveal(6)}>
        <div className="flex items-center justify-between mb-3">
          <p className={t.sectionLabel}>Trades ({trades.length})</p>
          <button onClick={downloadCsv}
            className={"flex items-center gap-1.5 text-xs px-3 py-1.5 " + t.primaryBtn}>
            <Download size={12} /> Download CSV
          </button>
        </div>
        <div className="overflow-x-auto -mx-4 px-4">
          <table className="w-full text-[11px] whitespace-nowrap">
            <thead>
              <tr className={t.tableHead}>
                {["B/S", "Instrument", "Entry", "Exit", "PnL", "Reason"].map((h) => (
                  <th key={h} className="text-left font-medium px-2 py-2">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trades.map((x) => (
                <tr key={x.id} className={t.tableRow}>
                  <td className="px-2 py-2">
                    <span className={"px-1.5 py-0.5 rounded text-[10px] font-medium " +
                      (x.side === "BUY" ? t.chipBuy : t.chipSell)}>{x.side}</span>
                  </td>
                  <td className={"px-2 py-2 font-mono " + t.body}>{x.instrument}</td>
                  <td className={"px-2 py-2 font-mono " + t.muted}>{x.entryDate.slice(5)} {x.entryTime.slice(0, 5)} @ {x.entryPrice}</td>
                  <td className={"px-2 py-2 font-mono " + t.muted}>{x.exitTime.slice(0, 5)} @ {x.exitPrice}</td>
                  <td className={"px-2 py-2 font-mono font-semibold " +
                    (x.pnl >= 0 ? "text-emerald-600" : "text-rose-500")}>
                    {x.pnl >= 0 ? "+" : ""}{x.pnl.toFixed(2)}
                  </td>
                  <td className={"px-2 py-2 font-mono text-[10px] " + t.muted}>{x.exitReason}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* actions */}
      <div className="flex gap-2" style={reveal(7)}>
        <button onClick={onBack}
          className={"flex-1 py-3 text-sm flex items-center justify-center gap-1.5 " + t.ghostBtn}>
          <ArrowLeft size={14} /> Edit strategy
        </button>
        <button onClick={onRerun}
          className={"flex-1 py-3 text-sm flex items-center justify-center gap-1.5 " + t.primaryBtn}>
          <RotateCcw size={14} /> Run again
        </button>
      </div>
    </main>
  );
}

/* ─── position card ────────────────────────────────────── */

function PositionCard({ t, pos, onChange, onCopy, onDelete }) {
  const set = (k, v) => onChange({ ...pos, [k]: v });
  const sell = pos.side === "SELL";
  return (
    <div className={t.innerCard + " overflow-hidden"}>
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button onClick={() => set("open", !pos.open)} className="flex items-center gap-2 flex-1 text-left">
          {pos.open ? <ChevronDown size={14} className={t.muted} /> : <ChevronRight size={14} className={t.muted} />}
          <span className="text-sm font-medium">{pos.name}</span>
          <span className={"text-[10px] font-medium px-1.5 py-0.5 rounded " + (sell ? t.chipSell : t.chipBuy)}>
            {pos.side} {pos.optionType}
          </span>
        </button>
        <IconBtn t={t} onClick={onCopy}><Copy size={13} /></IconBtn>
        <IconBtn t={t} danger onClick={onDelete}><X size={13} /></IconBtn>
      </div>

      {pos.open && (
        <div className="px-3 pb-3 space-y-4 pt-1">
          <div className="grid grid-cols-2 gap-3">
            <Field t={t} label="Position type"><Select t={t} value={pos.side} onChange={(v) => set("side", v)} options={["BUY", "SELL"]} /></Field>
            <Field t={t} label="Option type"><Select t={t} value={pos.optionType} onChange={(v) => set("optionType", v)} options={["CE", "PE", "FUT", "EQ"]} /></Field>
            <Field t={t} label="Instrument"><Select t={t} value={pos.instrument} onChange={(v) => set("instrument", v)} options={INSTRUMENTS} /></Field>
            <Field t={t} label="Expiry type"><Select t={t} value={pos.expiry} onChange={(v) => set("expiry", v)} options={EXPIRY_TYPES} /></Field>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className={"p-2.5 space-y-2 " + t.rowItem}>
              <p className={t.sectionLabel}>Strike</p>
              <Select t={t} value={pos.strikeMode} onChange={(v) => set("strikeMode", v)}
                options={["ATM", "ITM", "OTM", "CLOSEST PREMIUM"]} />
              {(pos.strikeMode === "ITM" || pos.strikeMode === "OTM") && (
                <Field t={t} label="Step"><input type="number" className={t.input} value={pos.strikeStep}
                  onChange={(e) => set("strikeStep", e.target.value)} /></Field>
              )}
              {pos.strikeMode === "CLOSEST PREMIUM" && (
                <Field t={t} label="Premium (₹)"><input type="number" className={t.input} value={pos.premium}
                  onChange={(e) => set("premium", e.target.value)} /></Field>
              )}
            </div>
            <div className={"p-2.5 space-y-2 " + t.rowItem}>
              <p className={t.sectionLabel}>Quantity</p>
              <Select t={t} value={pos.lotType} onChange={(v) => set("lotType", v)} options={["LOTS", "FUND"]} />
              {pos.lotType === "LOTS" ? (
                <Field t={t} label="Lots"><input type="number" className={t.input} value={pos.lots}
                  onChange={(e) => set("lots", e.target.value)} /></Field>
              ) : (
                <Field t={t} label="Max fund (₹)"><input type="number" className={t.input} value={pos.maxFund}
                  onChange={(e) => set("maxFund", e.target.value)} /></Field>
              )}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {[
              ["Target", "targetOn", "targetType", "targetValue"],
              ["Stop loss", "slOn", "slType", "slValue"],
            ].map(([label, onK, typeK, valK]) => (
              <div key={label} className={"p-2.5 space-y-2 " + t.rowItem}>
                <div className="flex items-center justify-between">
                  <p className={t.sectionLabel}>{label}</p>
                  <Toggle t={t} on={pos[onK]} onChange={(v) => set(onK, v)} />
                </div>
                {pos[onK] && (
                  <>
                    <Select t={t} value={pos[typeK]} onChange={(v) => set(typeK, v)} options={["PERCENT", "POINT"]} />
                    <input type="number" className={t.input} value={pos[valK]}
                      onChange={(e) => set(valK, e.target.value)} />
                  </>
                )}
              </div>
            ))}
          </div>

          <div className={"p-2.5 space-y-2 " + t.rowItem}>
            <div className="flex items-center justify-between">
              <p className={t.sectionLabel}>Trailing stop loss</p>
              <Toggle t={t} on={pos.trailOn} onChange={(v) => set("trailOn", v)} />
            </div>
            {pos.trailOn && (
              <div className="grid grid-cols-2 gap-2">
                <Field t={t} label="Profit moves by (X)"><input type="number" className={t.input} value={pos.trailX}
                  onChange={(e) => set("trailX", e.target.value)} /></Field>
                <Field t={t} label="SL moves by (Y)"><input type="number" className={t.input} value={pos.trailY}
                  onChange={(e) => set("trailY", e.target.value)} /></Field>
                <Field t={t} label="Unit"><Select t={t} value={pos.trailUnit} onChange={(v) => set("trailUnit", v)} options={["POINT", "PERCENT"]} /></Field>
                <Field t={t} label="Method"><Select t={t} value={pos.trailMethod} onChange={(v) => set("trailMethod", v)} options={["CONTINUOUS", "LOCK"]} /></Field>
                <p className={"col-span-2 text-[11px] " + t.muted}>
                  When profit reaches <b>{pos.trailX}</b>, stop loss moves by <b>{pos.trailY}</b> {pos.trailUnit.toLowerCase()}s.
                </p>
              </div>
            )}
          </div>

          <div className={"p-2.5 space-y-2 " + t.rowItem}>
            <div className="flex items-center justify-between">
              <p className={t.sectionLabel + " flex items-center gap-1"}><Zap size={11} /> Momentum entry</p>
              <Toggle t={t} on={pos.momentumOn} onChange={(v) => set("momentumOn", v)} />
            </div>
            {pos.momentumOn && (
              <div className="grid grid-cols-2 gap-2">
                <Select t={t} value={pos.momentumType} onChange={(v) => set("momentumType", v)}
                  options={["POINTS_UP", "POINTS_DOWN", "PERCENT_UP", "PERCENT_DOWN"]} />
                <input type="number" className={t.input} value={pos.momentumValue}
                  onChange={(e) => set("momentumValue", e.target.value)} />
                <p className={"col-span-2 text-[11px] " + t.muted}>
                  Enter only after price moves {pos.momentumType.includes("UP") ? "+" : "−"}
                  <b>{pos.momentumValue}</b>{pos.momentumType.includes("PERCENT") ? "%" : " pts"} from signal.
                </p>
              </div>
            )}
          </div>

          <div className={"p-2.5 space-y-3 " + t.rowItem}>
            <p className={t.sectionLabel}>Re-entry</p>
            {[["On stoploss", "reSlType", "reSlCount"], ["On target", "reTgtType", "reTgtCount"]].map(
              ([label, typeK, cntK]) => (
                <div key={label} className="grid grid-cols-3 gap-2 items-end">
                  <span className={"text-xs pb-2 " + t.body}>{label}</span>
                  <Select t={t} value={pos[typeK]} onChange={(v) => set(typeK, v)} options={["NONE", "ASAP", "MOMENTUM"]} />
                  <input type="number" min={0} disabled={pos[typeK] === "NONE"}
                    className={t.input + (pos[typeK] === "NONE" ? " opacity-40" : "")}
                    value={pos[cntK]} onChange={(e) => set(cntK, e.target.value)} placeholder="count" />
                </div>
              )
            )}
          </div>
        </div>
      )}
    </div>
  );
}

/* ─── block card ───────────────────────────────────────── */

function BlockCard({ t, block, tokens, onChange, onCopy, onDelete }) {
  const [editing, setEditing] = useState(null);
  const set = (k, v) => onChange({ ...block, [k]: v });

  const addPosition = () =>
    set("positions", [...block.positions, newPosition(block.positions.length + 1)]);
  const copyPosition = (p) =>
    set("positions", [...block.positions, { ...structuredClone(p), id: uid(), name: p.name + " copy" }]);

  return (
    <div className={t.card + " overflow-hidden"}>
      <div className="flex items-center gap-2 px-3 py-3">
        <button onClick={() => set("open", !block.open)} className="flex items-center gap-2 flex-1 text-left">
          {block.open
            ? <ChevronDown size={16} className={t.linkAccent} />
            : <ChevronRight size={16} className={t.muted} />}
          <span className="text-sm font-semibold">{block.name}</span>
          <span className={"text-[10px] font-mono " + t.muted}>
            {block.positions.length} pos · {block.entryTf}/{block.exitTf}
          </span>
        </button>
        <IconBtn t={t} onClick={onCopy}><Copy size={13} /></IconBtn>
        <IconBtn t={t} danger onClick={onDelete}><X size={13} /></IconBtn>
      </div>

      {block.open && (
        <div className="p-3 pt-0 space-y-3">
          {[["Entry condition", "entry", "entryTf"], ["Exit condition", "exit", "exitTf"]].map(
            ([label, condK, tfK]) => (
              <div key={condK} className={"p-3 " + t.innerCard}>
                <div className="flex items-center justify-between mb-2">
                  <p className={t.sectionLabel}>{label}</p>
                  <div className="flex items-center gap-3">
                    <div className={"flex items-center gap-1 text-[10px] " + t.muted}>
                      <Clock size={10} />
                      <select value={block[tfK]} onChange={(e) => set(tfK, e.target.value)}
                        className={"bg-transparent font-mono focus:outline-none " + t.linkAccent}>
                        {TIMEFRAMES.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    </div>
                    <button onClick={() => setEditing(condK)}
                      className={"flex items-center gap-1 text-[11px] font-medium " + t.linkAccent}>
                      <Pencil size={11} /> Edit
                    </button>
                  </div>
                </div>
                <Expr t={t} text={block[condK]} />
                <p className={"text-right text-[10px] mt-1 " + t.muted}>{block[condK].length}/500</p>
              </div>
            )
          )}

          <div className="space-y-2">
            {block.positions.map((p) => (
              <PositionCard key={p.id} t={t} pos={p}
                onChange={(np) => set("positions", block.positions.map((x) => (x.id === p.id ? np : x)))}
                onCopy={() => copyPosition(p)}
                onDelete={() => set("positions", block.positions.filter((x) => x.id !== p.id))} />
            ))}
          </div>

          <button onClick={addPosition}
            className={"w-full py-2.5 text-sm flex items-center justify-center gap-1.5 " + t.dashed}>
            <Plus size={14} /> Add position
          </button>
        </div>
      )}

      {editing && (
        <ConditionSheet t={t}
          title={`${block.name} — ${editing} condition (${block[editing + "Tf"]})`}
          value={block[editing]} tokens={tokens}
          onSave={(txt) => set(editing, txt)} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

/* ─── main app ─────────────────────────────────────────── */

export default function StrategyBuilder() {
  const [themeKey, setThemeKey] = useState("kite");
  const t = THEMES[themeKey];

  const [view, setView] = useState("builder"); // 'builder' | 'results'
  const [tab, setTab] = useState("setup");
  const [sheet, setSheet] = useState(null); // 'indicator' | 'price' | 'pattern' | 'run'
  const [name, setName] = useState("My Strategy 01");

  const [globals, setGlobals] = useState({
    index: "NIFTY",
    startDate: "2024-01-01", endDate: "2024-06-28",
    startTime: "09:30", endTime: "15:15",
  });
  const setG = (k, v) => setGlobals((g) => ({ ...g, [k]: v }));

  const [indicators, setIndicators] = useState([
    { id: uid(), name: "rsi_14_5", type: "RSI", period: 14, tf: "5m" },
    { id: uid(), name: "ema_20_5", type: "EMA", period: 20, tf: "5m" },
  ]);
  const [prices, setPrices] = useState([
    { id: uid(), name: "close_5", field: "close", tf: "5m" },
    { id: uid(), name: "open_5", field: "open", tf: "5m" },
  ]);
  const [blocks, setBlocks] = useState([
    { ...newBlock(1), entry: "rsi_14_5 > 60 AND close_5 > ema_20_5", exit: "rsi_14_5 < 50" },
  ]);

  const [status, setStatus] = useState({ state: "ready", msg: "Ready to run backtest" });
  const [saved, setSaved] = useState(false);
  const [result, setResult] = useState(null);
  const timers = useRef([]);

  const tokens = [...indicators.map((i) => i.name), ...prices.map((p) => p.name), "current_time"];
  const totalPos = blocks.reduce((a, b) => a + b.positions.length, 0);

  const runBacktest = () => {
    setSheet(null);
    setStatus({ state: "queued", msg: "Queued on worker…" });
    timers.current.forEach(clearTimeout);
    timers.current = [
      setTimeout(() => setStatus({ state: "running", msg: `Running ${blocks.length} block(s), ${totalPos} position(s)…` }), 800),
      setTimeout(() => {
        setResult(computeResult(DUMMY_TRADES));
        setStatus({ state: "done", msg: "Backtest complete" });
        setView("results");
      }, 2600),
    ];
  };

  const statusColor =
    status.state === "done" ? t.statusDone :
    status.state === "running" ? t.statusRun :
    status.state === "queued" ? t.statusQueue : t.muted;

  return (
    <div className={"min-h-screen flex justify-center " + t.app} style={{ fontFamily: t.font }}>
      <div className={"w-full max-w-md flex flex-col min-h-screen " + t.shell}>

        {/* header */}
        <header className={"px-4 pt-4 pb-0 sticky top-0 backdrop-blur z-10 " + t.header}>
          <div className="flex items-center justify-between">
            <p className={"text-[10px] uppercase tracking-widest font-semibold " + t.brand}>
              GenZ · Backtest
            </p>
            {/* theme switcher — remove once you've picked one */}
            <div className="flex items-center gap-1 overflow-x-auto">
              <Palette size={12} className={t.muted + " shrink-0"} />
              {Object.keys(THEMES).map((k) => (
                <button key={k} onClick={() => setThemeKey(k)}
                  className={"text-[10px] px-2 py-0.5 rounded-full border shrink-0 " +
                    (k === themeKey
                      ? t.linkAccent + " border-current font-semibold"
                      : t.muted + " border-transparent")}>
                  {THEMES[k].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1.5 pb-1">
            {view === "results" && (
              <button onClick={() => setView("builder")} className={"p-1 " + t.linkAccent}>
                <ArrowLeft size={18} />
              </button>
            )}
            <input value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }}
              className="bg-transparent text-lg font-semibold flex-1 focus:outline-none" />
            <button onClick={() => setSaved(true)}
              className={"flex items-center gap-1 text-xs px-2.5 py-1.5 " +
                (saved ? "text-green-600 border border-green-200 rounded-lg bg-green-50" : t.ghostBtn)}>
              {saved ? <Check size={12} /> : <Save size={12} />}{saved ? "Saved" : "Save"}
            </button>
          </div>

          {view === "builder" && (
            <div className={"flex mt-2 " + t.tabWrap}>
              {[["setup", "Setup", Settings2], ["blocks", "Blocks", Boxes]].map(([id, label, Icon]) => (
                <button key={id} onClick={() => setTab(id)}
                  className={"flex-1 flex items-center justify-center gap-1.5 py-2 text-sm transition-colors " +
                    (tab === id ? t.tabOn : t.tabOff)}>
                  <Icon size={14} /> {label}
                  {id === "blocks" && <span className={"text-[10px] font-mono " + t.muted}>{blocks.length}</span>}
                </button>
              ))}
            </div>
          )}
        </header>

        {/* ── results view ── */}
        {view === "results" && result && (
          <ResultsView t={t} trades={DUMMY_TRADES} result={result} globals={globals}
            name={name} onBack={() => setView("builder")} onRerun={() => setSheet("run")} />
        )}

        {/* ── builder view ── */}
        {view === "builder" && (
          <main className="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
            {tab === "setup" && (
              <>
                <section className={"p-3 space-y-3 " + t.card}>
                  <p className={t.sectionLabel}>Input parameters</p>
                  <Field t={t} label="Index / Equity">
                    <input className={t.input + " font-mono"} value={globals.index}
                      onChange={(e) => setG("index", e.target.value.toUpperCase())}
                      placeholder="NIFTY, SBIN, RELIANCE…" />
                  </Field>
                  <p className={"text-[11px] " + t.muted}>
                    <Calendar size={11} className="inline mr-1 -mt-0.5" />
                    Backtest dates & times are asked when you tap <b>Run Backtest</b>.
                  </p>
                </section>

                {[
                  ["Indicators & patterns", indicators, setIndicators, ["indicator", "pattern"]],
                  ["Cash prices", prices, setPrices, ["price"]],
                ].map(([label, list, setList, sheets]) => (
                  <section key={label} className={"p-3 " + t.card}>
                    <div className="flex items-center justify-between mb-2">
                      <p className={t.sectionLabel}>{label}</p>
                      <div className="flex gap-1.5">
                        {sheets.map((s) => (
                          <button key={s} onClick={() => setSheet(s)}
                            className={"flex items-center gap-1 text-[11px] px-2 py-1 " + t.ghostBtn}>
                            <Plus size={11} /> {s}
                          </button>
                        ))}
                      </div>
                    </div>
                    {list.length === 0 && (
                      <p className={"text-xs py-3 text-center " + t.muted}>
                        Nothing defined yet — add one to use it in block conditions.
                      </p>
                    )}
                    <div className="space-y-1.5">
                      {list.map((item) => (
                        <div key={item.id} className={"flex items-center gap-2 px-3 py-2 " + t.rowItem}>
                          <span className={"font-mono text-xs flex-1 " + t.exprId}>{item.name}</span>
                          <span className={"text-[10px] font-mono " + t.muted}>{item.tf}</span>
                          <IconBtn t={t} onClick={() => setList([...list, { ...item, id: uid() }])}><Copy size={12} /></IconBtn>
                          <IconBtn t={t} danger onClick={() => setList(list.filter((x) => x.id !== item.id))}><X size={12} /></IconBtn>
                        </div>
                      ))}
                    </div>
                  </section>
                ))}

                <p className={"text-[11px] px-1 " + t.muted}>
                  Define every indicator or price here first — only then can it be used inside block entry/exit conditions.
                </p>
              </>
            )}

            {tab === "blocks" && (
              <>
                {blocks.map((b) => (
                  <BlockCard key={b.id} t={t} block={b} tokens={tokens}
                    onChange={(nb) => setBlocks(blocks.map((x) => (x.id === b.id ? nb : x)))}
                    onCopy={() => setBlocks([...blocks, { ...structuredClone(b), id: uid(), name: b.name + " copy", positions: b.positions.map((p) => ({ ...p, id: uid() })) }])}
                    onDelete={() => setBlocks(blocks.filter((x) => x.id !== b.id))} />
                ))}
                <button onClick={() => setBlocks([...blocks, newBlock(blocks.length + 1)])}
                  className={"w-full py-3 text-sm flex items-center justify-center gap-1.5 " + t.dashed}>
                  <Plus size={15} /> Add new block
                </button>
              </>
            )}
          </main>
        )}

        {/* fixed run bar (builder only) */}
        {view === "builder" && (
          <footer className={"fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md backdrop-blur px-4 py-3 flex items-center gap-3 " + t.footer}>
            <div className="flex-1 min-w-0">
              <p className={"text-xs truncate font-medium " + statusColor}>
                {status.state === "running" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1.5" />}
                {status.msg}
              </p>
              <p className={"text-[10px] font-mono " + t.muted}>
                {globals.index} · {blocks.length} block · {totalPos} pos
              </p>
            </div>
            <button onClick={() => setSheet("run")} disabled={status.state === "running" || status.state === "queued"}
              className={"flex items-center gap-1.5 px-4 py-2.5 text-sm disabled:opacity-50 " + t.primaryBtn}>
              <Play size={14} fill="currentColor" /> Run Backtest
            </button>
          </footer>
        )}

        {/* sheets */}
        {sheet === "indicator" && <IndicatorSheet t={t} onAdd={(i) => setIndicators((s) => [...s, i])} onClose={() => setSheet(null)} />}
        {sheet === "pattern" && <PatternSheet t={t} onAdd={(i) => setIndicators((s) => [...s, i])} onClose={() => setSheet(null)} />}
        {sheet === "price" && <PriceSheet t={t} onAdd={(p) => setPrices((s) => [...s, p])} onClose={() => setSheet(null)} />}
        {sheet === "run" && (
          <RunSheet t={t} globals={globals} setG={setG} onRun={runBacktest}
            onClose={() => setSheet(null)} blocksCount={blocks.length} posCount={totalPos} />
        )}
      </div>
    </div>
  );
}
