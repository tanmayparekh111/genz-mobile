import { useState } from "react";
import {
  Plus, Copy, X, ChevronDown, ChevronRight, Play, Save,
  Settings2, Boxes, Pencil, Check, Clock, Zap, Palette
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   GenZ Backtesting — Mobile Strategy Builder (Premium light)
   Three themes built in — tap the palette icon (top right)
   to switch live and pick the one you like:
     1. KITE  — Zerodha-style: white, hairlines, blue, flat
     2. SOFT  — gray canvas, white cards, soft shadows, indigo
     3. MINT  — warm paper, green accent, pill buttons
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

/* ── atoms ──────────────────────────────────────────────── */

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

/* ── defaults ───────────────────────────────────────────── */

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

/* ── bottom sheets ──────────────────────────────────────── */

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

/* ── position card ──────────────────────────────────────── */

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

/* ── block card ─────────────────────────────────────────── */

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

/* ── main app ───────────────────────────────────────────── */

export default function StrategyBuilder() {
  const [themeKey, setThemeKey] = useState("kite");
  const t = THEMES[themeKey];

  const [tab, setTab] = useState("setup");
  const [sheet, setSheet] = useState(null);
  const [name, setName] = useState("My Strategy 01");

  const [globals, setGlobals] = useState({
    index: "NIFTY", startDate: "2024-01-01", endDate: "2024-02-28",
    startTime: "09:30", endTime: "15:15", expiryMode: true, expiryRule: "SAME",
  });
  const setG = (k, v) => setGlobals({ ...globals, [k]: v });

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

  const tokens = [...indicators.map((i) => i.name), ...prices.map((p) => p.name), "current_time"];

  const runBacktest = () => {
    const nBlocks = blocks.length;
    const nPos = blocks.reduce((a, b) => a + b.positions.length, 0);
    setStatus({ state: "queued", msg: "Queued on worker…" });
    setTimeout(() => setStatus({ state: "running", msg: `Running ${nBlocks} block(s), ${nPos} position(s)…` }), 900);
    setTimeout(() => setStatus({ state: "done", msg: "Backtest complete — view results" }), 3200);
  };

  const totalPos = blocks.reduce((a, b) => a + b.positions.length, 0);
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
            <div className="flex items-center gap-1">
              <Palette size={12} className={t.muted} />
              {Object.keys(THEMES).map((k) => (
                <button key={k} onClick={() => setThemeKey(k)}
                  className={"text-[10px] px-2 py-0.5 rounded-full border " +
                    (k === themeKey
                      ? t.linkAccent + " border-current font-semibold"
                      : t.muted + " border-transparent")}>
                  {THEMES[k].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-1.5">
            <input value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }}
              className="bg-transparent text-lg font-semibold flex-1 focus:outline-none" />
            <button onClick={() => setSaved(true)}
              className={"flex items-center gap-1 text-xs px-2.5 py-1.5 " +
                (saved ? "text-green-600 border border-green-200 rounded-lg bg-green-50" : t.ghostBtn)}>
              {saved ? <Check size={12} /> : <Save size={12} />}{saved ? "Saved" : "Save"}
            </button>
          </div>

          <div className={"flex mt-3 " + t.tabWrap}>
            {[["setup", "Setup", Settings2], ["blocks", "Blocks", Boxes]].map(([id, label, Icon]) => (
              <button key={id} onClick={() => setTab(id)}
                className={"flex-1 flex items-center justify-center gap-1.5 py-2 text-sm transition-colors " +
                  (tab === id ? t.tabOn : t.tabOff)}>
                <Icon size={14} /> {label}
                {id === "blocks" && <span className={"text-[10px] font-mono " + t.muted}>{blocks.length}</span>}
              </button>
            ))}
          </div>
        </header>

        {/* content */}
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
                <div className="grid grid-cols-2 gap-3">
                  <Field t={t} label="Start date"><input type="date" className={t.input} value={globals.startDate} onChange={(e) => setG("startDate", e.target.value)} /></Field>
                  <Field t={t} label="End date"><input type="date" className={t.input} value={globals.endDate} onChange={(e) => setG("endDate", e.target.value)} /></Field>
                  <Field t={t} label="Start time"><input type="time" className={t.input} value={globals.startTime} onChange={(e) => setG("startTime", e.target.value)} /></Field>
                  <Field t={t} label="End time"><input type="time" className={t.input} value={globals.endTime} onChange={(e) => setG("endTime", e.target.value)} /></Field>
                </div>
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

        {/* fixed run bar */}
        <footer className={"fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md backdrop-blur px-4 py-3 flex items-center gap-3 " + t.footer}>
          <div className="flex-1 min-w-0">
            <p className={"text-xs truncate font-medium " + statusColor}>
              {status.state === "running" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1.5" />}
              {status.msg}
            </p>
            <p className={"text-[10px] font-mono " + t.muted}>
              {globals.index} · {blocks.length} block · {totalPos} pos · {globals.startDate} → {globals.endDate}
            </p>
          </div>
          <button onClick={runBacktest} disabled={status.state === "running" || status.state === "queued"}
            className={"flex items-center gap-1.5 px-4 py-2.5 text-sm disabled:opacity-50 " + t.primaryBtn}>
            <Play size={14} fill="currentColor" /> Run Backtest
          </button>
        </footer>

        {/* sheets */}
        {sheet === "indicator" && <IndicatorSheet t={t} onAdd={(i) => setIndicators((s) => [...s, i])} onClose={() => setSheet(null)} />}
        {sheet === "pattern" && <PatternSheet t={t} onAdd={(i) => setIndicators((s) => [...s, i])} onClose={() => setSheet(null)} />}
        {sheet === "price" && <PriceSheet t={t} onAdd={(p) => setPrices((s) => [...s, p])} onClose={() => setSheet(null)} />}
      </div>
    </div>
  );
}
