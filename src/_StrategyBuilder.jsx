import { useState } from "react";
import {
  Plus, Copy, X, ChevronDown, ChevronRight, Play, Save,
  Settings2, Boxes, Pencil, Check, Clock, Zap
} from "lucide-react";

/* ─────────────────────────────────────────────────────────
   GenZ Backtesting — Mobile Strategy Builder
   Dark terminal aesthetic: mono for expressions & symbols,
   emerald = buy/run, rose = sell, amber = numbers/values.
   ───────────────────────────────────────────────────────── */

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

/* ── small ui atoms ──────────────────────────────────────── */

const Field = ({ label, children }) => (
  <label className="block">
    <span className="block text-xs uppercase tracking-wider text-zinc-500 mb-1">{label}</span>
    {children}
  </label>
);

const inputCls =
  "w-full bg-zinc-900 border border-zinc-800 rounded-lg px-3 py-2 text-sm text-zinc-100 " +
  "focus:outline-none focus:border-emerald-500 placeholder-zinc-600";

const Select = ({ value, onChange, options }) => (
  <div className="relative">
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={inputCls + " appearance-none pr-8"}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
    <ChevronDown size={14} className="absolute right-2.5 top-2.5 text-zinc-500 pointer-events-none" />
  </div>
);

const Toggle = ({ on, onChange }) => (
  <button type="button" onClick={() => onChange(!on)}
    className={"w-10 h-5 rounded-full transition-colors relative shrink-0 " +
      (on ? "bg-emerald-500" : "bg-zinc-700")}>
    <span className={"absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all " +
      (on ? "left-5" : "left-0.5")} />
  </button>
);

const IconBtn = ({ onClick, children, tone = "zinc" }) => (
  <button type="button" onClick={onClick}
    className={"p-1.5 rounded-md border border-zinc-800 " +
      (tone === "danger" ? "text-rose-400 hover:bg-rose-500/10" : "text-zinc-400 hover:bg-zinc-800")}>
    {children}
  </button>
);

/* syntax-tinted expression preview */
const Expr = ({ text }) => {
  if (!text) return <span className="text-zinc-600 italic">no condition — always true</span>;
  const parts = text.split(/(\s+|\(|\))/g);
  return (
    <span className="font-mono text-xs leading-relaxed break-words">
      {parts.map((p, i) => {
        let c = "text-zinc-300";
        if (/^(AND|OR|and|or)$/.test(p)) c = "text-emerald-400 font-semibold";
        else if (/^[><=+\-*/]+$/.test(p)) c = "text-rose-300";
        else if (/^[\d.:]+$/.test(p)) c = "text-amber-300";
        else if (/^[()]$/.test(p)) c = "text-zinc-500";
        return <span key={i} className={c}>{p}</span>;
      })}
    </span>
  );
};

/* ── defaults ────────────────────────────────────────────── */

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

/* ── indicator / price sheets ────────────────────────────── */

function IndicatorSheet({ onAdd, onClose }) {
  const [type, setType] = useState("RSI");
  const [period, setPeriod] = useState(14);
  const [tf, setTf] = useState("5m");
  const name = type === "SUPERTREND"
    ? `supertrend_${tf.replace("m", "")}`
    : `${type.toLowerCase()}_${period}_${tf.replace("m", "")}`;
  return (
    <Sheet title="Add indicator" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Type"><Select value={type} onChange={setType} options={INDICATOR_TYPES} /></Field>
        <Field label="Timeframe"><Select value={tf} onChange={setTf} options={TIMEFRAMES} /></Field>
        {type !== "SUPERTREND" && (
          <Field label="Period">
            <input type="number" className={inputCls} value={period}
              onChange={(e) => setPeriod(e.target.value)} />
          </Field>
        )}
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        Reference in conditions as <span className="font-mono text-amber-300">{name}</span>
      </p>
      <button onClick={() => { onAdd({ id: uid(), name, type, period, tf }); onClose(); }}
        className="mt-4 w-full py-2.5 rounded-lg bg-emerald-500 text-zinc-950 text-sm font-semibold">
        Add {name}
      </button>
    </Sheet>
  );
}

function PriceSheet({ onAdd, onClose }) {
  const [field, setField] = useState("close");
  const [tf, setTf] = useState("5m");
  const [prev, setPrev] = useState(false);
  const name = `${prev ? "prev_" : ""}${field}_${tf.replace("m", "")}`;
  return (
    <Sheet title="Add cash price" onClose={onClose}>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Field"><Select value={field} onChange={setField} options={PRICE_FIELDS} /></Field>
        <Field label="Timeframe"><Select value={tf} onChange={setTf} options={TIMEFRAMES} /></Field>
      </div>
      <div className="flex items-center justify-between mt-3">
        <span className="text-sm text-zinc-300">Previous candle</span>
        <Toggle on={prev} onChange={setPrev} />
      </div>
      <p className="mt-3 text-xs text-zinc-500">
        Reference as <span className="font-mono text-amber-300">{name}</span>
      </p>
      <button onClick={() => { onAdd({ id: uid(), name, field, tf, prev }); onClose(); }}
        className="mt-4 w-full py-2.5 rounded-lg bg-emerald-500 text-zinc-950 text-sm font-semibold">
        Add {name}
      </button>
    </Sheet>
  );
}

function PatternSheet({ onAdd, onClose }) {
  const [tf, setTf] = useState("5m");
  return (
    <Sheet title="Add pattern scan" onClose={onClose}>
      <Field label="Timeframe"><Select value={tf} onChange={setTf} options={TIMEFRAMES} /></Field>
      <div className="mt-3 max-h-64 overflow-y-auto space-y-1.5">
        {PATTERNS.map((p) => {
          const name = p.name.toLowerCase().replace(/ /g, "_") + "_" + tf.replace("m", "");
          return (
            <button key={p.name}
              onClick={() => { onAdd({ id: uid(), name, type: "PATTERN", tf }); onClose(); }}
              className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800 hover:border-emerald-500 text-left">
              <span className="text-sm text-zinc-200">{p.name}</span>
              <span className="text-[10px] uppercase text-zinc-500">{p.candles} candle</span>
            </button>
          );
        })}
      </div>
    </Sheet>
  );
}

function ConditionSheet({ title, value, tokens, onSave, onClose }) {
  const [text, setText] = useState(value);
  return (
    <Sheet title={title} onClose={onClose}>
      <textarea value={text} onChange={(e) => setText(e.target.value.slice(0, 500))}
        rows={5} placeholder="e.g. rsi_14_5 > 60 AND close_5 > ema_20_5"
        className={inputCls + " font-mono text-xs resize-none"} />
      <div className="flex justify-between text-[10px] text-zinc-500 mt-1">
        <span>Operators: AND OR &gt; &lt; &gt;= &lt;= + - * /</span>
        <span>{text.length}/500</span>
      </div>
      {tokens.length > 0 && (
        <>
          <p className="text-xs text-zinc-500 mt-3 mb-1.5">Tap to insert (defined in Setup):</p>
          <div className="flex flex-wrap gap-1.5">
            {tokens.map((t) => (
              <button key={t} onClick={() => setText((s) => (s ? s + " " + t : t))}
                className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-700 font-mono text-[11px] text-sky-300">
                {t}
              </button>
            ))}
            {["AND", "OR", ">", "<", ">=", "<="].map((t) => (
              <button key={t} onClick={() => setText((s) => (s ? s + " " + t : t))}
                className="px-2 py-1 rounded-md bg-zinc-900 border border-zinc-700 font-mono text-[11px] text-emerald-300">
                {t}
              </button>
            ))}
          </div>
        </>
      )}
      <button onClick={() => { onSave(text.trim()); onClose(); }}
        className="mt-4 w-full py-2.5 rounded-lg bg-emerald-500 text-zinc-950 text-sm font-semibold">
        Save condition
      </button>
    </Sheet>
  );
}

function Sheet({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/70" onClick={onClose} />
      <div className="relative w-full max-w-md bg-zinc-950 border-t border-zinc-800 rounded-t-2xl p-4 pb-6 max-h-[85vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-sm font-semibold text-zinc-100">{title}</h3>
          <IconBtn onClick={onClose}><X size={14} /></IconBtn>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── position card ───────────────────────────────────────── */

function PositionCard({ pos, onChange, onCopy, onDelete }) {
  const set = (k, v) => onChange({ ...pos, [k]: v });
  const sell = pos.side === "SELL";
  return (
    <div className="rounded-xl border border-zinc-800 bg-zinc-900/60 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-2.5">
        <button onClick={() => set("open", !pos.open)} className="flex items-center gap-2 flex-1 text-left">
          {pos.open ? <ChevronDown size={14} className="text-zinc-500" /> : <ChevronRight size={14} className="text-zinc-500" />}
          <span className="text-sm font-medium text-zinc-100">{pos.name}</span>
          <span className={"text-[10px] font-mono px-1.5 py-0.5 rounded " +
            (sell ? "bg-rose-500/15 text-rose-300" : "bg-emerald-500/15 text-emerald-300")}>
            {pos.side} {pos.optionType}
          </span>
        </button>
        <IconBtn onClick={onCopy}><Copy size={13} /></IconBtn>
        <IconBtn onClick={onDelete} tone="danger"><X size={13} /></IconBtn>
      </div>

      {pos.open && (
        <div className="px-3 pb-3 space-y-4 border-t border-zinc-800/70 pt-3">
          <div className="grid grid-cols-2 gap-3">
            <Field label="Position type"><Select value={pos.side} onChange={(v) => set("side", v)} options={["BUY", "SELL"]} /></Field>
            <Field label="Option type"><Select value={pos.optionType} onChange={(v) => set("optionType", v)} options={["CE", "PE", "FUT", "EQ"]} /></Field>
            <Field label="Instrument"><Select value={pos.instrument} onChange={(v) => set("instrument", v)} options={INSTRUMENTS} /></Field>
            <Field label="Expiry type"><Select value={pos.expiry} onChange={(v) => set("expiry", v)} options={EXPIRY_TYPES} /></Field>
          </div>

          {/* strike + lots */}
          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-zinc-800 p-2.5 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Strike selection</p>
              <Select value={pos.strikeMode} onChange={(v) => set("strikeMode", v)}
                options={["ATM", "ITM", "OTM", "CLOSEST PREMIUM"]} />
              {(pos.strikeMode === "ITM" || pos.strikeMode === "OTM") && (
                <Field label="Step"><input type="number" className={inputCls} value={pos.strikeStep}
                  onChange={(e) => set("strikeStep", e.target.value)} /></Field>
              )}
              {pos.strikeMode === "CLOSEST PREMIUM" && (
                <Field label="Premium (₹)"><input type="number" className={inputCls} value={pos.premium}
                  onChange={(e) => set("premium", e.target.value)} /></Field>
              )}
            </div>
            <div className="rounded-lg border border-zinc-800 p-2.5 space-y-2">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Lot selection</p>
              <Select value={pos.lotType} onChange={(v) => set("lotType", v)} options={["LOTS", "FUND"]} />
              {pos.lotType === "LOTS" ? (
                <Field label="Lots"><input type="number" className={inputCls} value={pos.lots}
                  onChange={(e) => set("lots", e.target.value)} /></Field>
              ) : (
                <Field label="Max fund (₹)"><input type="number" className={inputCls} value={pos.maxFund}
                  onChange={(e) => set("maxFund", e.target.value)} /></Field>
              )}
            </div>
          </div>

          {/* target / SL */}
          <div className="grid grid-cols-2 gap-3">
            {[
              ["Target", "targetOn", "targetType", "targetValue"],
              ["Stop loss", "slOn", "slType", "slValue"],
            ].map(([label, onK, typeK, valK]) => (
              <div key={label} className="rounded-lg border border-zinc-800 p-2.5 space-y-2">
                <div className="flex items-center justify-between">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
                  <Toggle on={pos[onK]} onChange={(v) => set(onK, v)} />
                </div>
                {pos[onK] && (
                  <>
                    <Select value={pos[typeK]} onChange={(v) => set(typeK, v)} options={["PERCENT", "POINT"]} />
                    <input type="number" className={inputCls} value={pos[valK]}
                      onChange={(e) => set(valK, e.target.value)} />
                  </>
                )}
              </div>
            ))}
          </div>

          {/* trailing SL */}
          <div className="rounded-lg border border-zinc-800 p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500">Trailing stop loss</p>
              <Toggle on={pos.trailOn} onChange={(v) => set("trailOn", v)} />
            </div>
            {pos.trailOn && (
              <div className="grid grid-cols-2 gap-2">
                <Field label="Profit moves by (X)"><input type="number" className={inputCls} value={pos.trailX}
                  onChange={(e) => set("trailX", e.target.value)} /></Field>
                <Field label="SL moves by (Y)"><input type="number" className={inputCls} value={pos.trailY}
                  onChange={(e) => set("trailY", e.target.value)} /></Field>
                <Field label="Unit"><Select value={pos.trailUnit} onChange={(v) => set("trailUnit", v)} options={["POINT", "PERCENT"]} /></Field>
                <Field label="Method"><Select value={pos.trailMethod} onChange={(v) => set("trailMethod", v)} options={["CONTINUOUS", "LOCK"]} /></Field>
                <p className="col-span-2 text-[11px] text-zinc-500">
                  When profit reaches <span className="text-amber-300 font-mono">{pos.trailX}</span>, stop loss moves by <span className="text-amber-300 font-mono">{pos.trailY}</span> {pos.trailUnit.toLowerCase()}s.
                </p>
              </div>
            )}
          </div>

          {/* momentum */}
          <div className="rounded-lg border border-zinc-800 p-2.5 space-y-2">
            <div className="flex items-center justify-between">
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 flex items-center gap-1">
                <Zap size={11} /> Momentum entry
              </p>
              <Toggle on={pos.momentumOn} onChange={(v) => set("momentumOn", v)} />
            </div>
            {pos.momentumOn && (
              <div className="grid grid-cols-2 gap-2">
                <Select value={pos.momentumType} onChange={(v) => set("momentumType", v)}
                  options={["POINTS_UP", "POINTS_DOWN", "PERCENT_UP", "PERCENT_DOWN"]} />
                <input type="number" className={inputCls} value={pos.momentumValue}
                  onChange={(e) => set("momentumValue", e.target.value)} />
                <p className="col-span-2 text-[11px] text-zinc-500">
                  Enter only after price moves {pos.momentumType.includes("UP") ? "+" : "−"}
                  <span className="text-amber-300 font-mono">{pos.momentumValue}</span>
                  {pos.momentumType.includes("PERCENT") ? "%" : " pts"} from signal.
                </p>
              </div>
            )}
          </div>

          {/* re-entry */}
          <div className="rounded-lg border border-zinc-800 p-2.5 space-y-3">
            <p className="text-[10px] uppercase tracking-wider text-zinc-500">Re-entry</p>
            {[["On stoploss", "reSlType", "reSlCount"], ["On target", "reTgtType", "reTgtCount"]].map(
              ([label, typeK, cntK]) => (
                <div key={label} className="grid grid-cols-3 gap-2 items-end">
                  <span className="text-xs text-zinc-300 pb-2">{label}</span>
                  <Select value={pos[typeK]} onChange={(v) => set(typeK, v)} options={["NONE", "ASAP", "MOMENTUM"]} />
                  <input type="number" min={0} disabled={pos[typeK] === "NONE"}
                    className={inputCls + (pos[typeK] === "NONE" ? " opacity-40" : "")}
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

/* ── block card ──────────────────────────────────────────── */

function BlockCard({ block, tokens, onChange, onCopy, onDelete }) {
  const [editing, setEditing] = useState(null); // 'entry' | 'exit'
  const set = (k, v) => onChange({ ...block, [k]: v });

  const addPosition = () =>
    set("positions", [...block.positions, newPosition(block.positions.length + 1)]);
  const copyPosition = (p) =>
    set("positions", [...block.positions, { ...structuredClone(p), id: uid(), name: p.name + " copy" }]);

  return (
    <div className="rounded-2xl border border-zinc-800 bg-zinc-950 overflow-hidden">
      <div className="flex items-center gap-2 px-3 py-3 bg-zinc-900/70">
        <button onClick={() => set("open", !block.open)} className="flex items-center gap-2 flex-1 text-left">
          {block.open ? <ChevronDown size={16} className="text-emerald-400" /> : <ChevronRight size={16} className="text-zinc-500" />}
          <span className="text-sm font-semibold text-zinc-100">{block.name}</span>
          <span className="text-[10px] text-zinc-500 font-mono">{block.positions.length} pos · {block.entryTf}/{block.exitTf}</span>
        </button>
        <IconBtn onClick={onCopy}><Copy size={13} /></IconBtn>
        <IconBtn onClick={onDelete} tone="danger"><X size={13} /></IconBtn>
      </div>

      {block.open && (
        <div className="p-3 space-y-3">
          {[["Entry condition", "entry", "entryTf"], ["Exit condition", "exit", "exitTf"]].map(
            ([label, condK, tfK]) => (
              <div key={condK} className="rounded-xl border border-zinc-800 bg-zinc-900/40 p-3">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-[10px] text-zinc-500">
                      <Clock size={10} />
                      <select value={block[tfK]} onChange={(e) => set(tfK, e.target.value)}
                        className="bg-transparent text-emerald-400 font-mono focus:outline-none">
                        {TIMEFRAMES.map((t) => <option key={t} className="bg-zinc-900">{t}</option>)}
                      </select>
                    </div>
                    <button onClick={() => setEditing(condK)}
                      className="flex items-center gap-1 text-[11px] text-emerald-400">
                      <Pencil size={11} /> Edit
                    </button>
                  </div>
                </div>
                <Expr text={block[condK]} />
                <p className="text-right text-[10px] text-zinc-600 mt-1">{block[condK].length}/500</p>
              </div>
            )
          )}

          <div className="space-y-2">
            {block.positions.map((p) => (
              <PositionCard key={p.id} pos={p}
                onChange={(np) => set("positions", block.positions.map((x) => (x.id === p.id ? np : x)))}
                onCopy={() => copyPosition(p)}
                onDelete={() => set("positions", block.positions.filter((x) => x.id !== p.id))} />
            ))}
          </div>

          <button onClick={addPosition}
            className="w-full py-2.5 rounded-xl border border-dashed border-zinc-700 text-sm text-zinc-400 flex items-center justify-center gap-1.5 hover:border-emerald-500 hover:text-emerald-400">
            <Plus size={14} /> Add position
          </button>
        </div>
      )}

      {editing && (
        <ConditionSheet
          title={`${block.name} — ${editing} condition (${block[editing + "Tf"]})`}
          value={block[editing]} tokens={tokens}
          onSave={(t) => set(editing, t)} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

/* ── main app ────────────────────────────────────────────── */

export default function StrategyBuilder() {
  const [tab, setTab] = useState("setup");
  const [sheet, setSheet] = useState(null); // 'indicator' | 'price' | 'pattern'
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

  const tokens = [
    ...indicators.map((i) => i.name),
    ...prices.map((p) => p.name),
    "current_time",
  ];

  const runBacktest = () => {
    const nBlocks = blocks.length;
    const nPos = blocks.reduce((a, b) => a + b.positions.length, 0);
    setStatus({ state: "queued", msg: "Queued on worker…" });
    setTimeout(() => setStatus({ state: "running", msg: `Running ${nBlocks} block(s), ${nPos} position(s)…` }), 900);
    setTimeout(() => setStatus({ state: "done", msg: "Backtest complete — view results" }), 3200);
  };

  const totalPos = blocks.reduce((a, b) => a + b.positions.length, 0);

  return (
    <div className="min-h-screen bg-black text-zinc-100 flex justify-center"
      style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="w-full max-w-md flex flex-col min-h-screen bg-zinc-950 border-x border-zinc-900">

        {/* header */}
        <header className="px-4 pt-4 pb-3 border-b border-zinc-900 sticky top-0 bg-zinc-950/95 backdrop-blur z-10">
          <p className="text-[10px] uppercase tracking-widest text-emerald-400 font-mono">GenZ · Backtest</p>
          <div className="flex items-center gap-2 mt-1">
            <input value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }}
              className="bg-transparent text-lg font-semibold flex-1 focus:outline-none focus:border-b focus:border-emerald-500" />
            <button onClick={() => setSaved(true)}
              className={"flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border " +
                (saved ? "border-emerald-600 text-emerald-400" : "border-zinc-700 text-zinc-300")}>
              {saved ? <Check size={12} /> : <Save size={12} />}{saved ? "Saved" : "Save"}
            </button>
          </div>
          {/* tabs */}
          <div className="flex gap-1 mt-3 bg-zinc-900 rounded-lg p-1">
            {[["setup", "Setup", Settings2], ["blocks", "Blocks", Boxes]].map(([id, label, Icon]) => (
              <button key={id} onClick={() => setTab(id)}
                className={"flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-sm " +
                  (tab === id ? "bg-zinc-800 text-emerald-400 font-medium" : "text-zinc-500")}>
                <Icon size={14} /> {label}
                {id === "blocks" && <span className="text-[10px] font-mono text-zinc-500">{blocks.length}</span>}
              </button>
            ))}
          </div>
        </header>

        {/* content */}
        <main className="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
          {tab === "setup" && (
            <>
              <section className="rounded-2xl border border-zinc-800 p-3 space-y-3">
                <p className="text-[10px] uppercase tracking-wider text-zinc-500">Input parameters</p>
                <Field label="Index / Equity">
                  <input className={inputCls + " font-mono"} value={globals.index}
                    onChange={(e) => setG("index", e.target.value.toUpperCase())}
                    placeholder="NIFTY, SBIN, RELIANCE…" />
                </Field>
                <div className="grid grid-cols-2 gap-3">
                  <Field label="Start date"><input type="date" className={inputCls} value={globals.startDate} onChange={(e) => setG("startDate", e.target.value)} /></Field>
                  <Field label="End date"><input type="date" className={inputCls} value={globals.endDate} onChange={(e) => setG("endDate", e.target.value)} /></Field>
                  <Field label="Start time"><input type="time" className={inputCls} value={globals.startTime} onChange={(e) => setG("startTime", e.target.value)} /></Field>
                  <Field label="End time"><input type="time" className={inputCls} value={globals.endTime} onChange={(e) => setG("endTime", e.target.value)} /></Field>
                </div>
                <div className="pt-1 border-t border-zinc-800/70">
                  <div className="flex items-center justify-between py-2">
                    <span className="text-sm text-zinc-300">Expiry mode</span>
                    <Toggle on={globals.expiryMode} onChange={(v) => setG("expiryMode", v)} />
                  </div>
                  {globals.expiryMode && (
                    <div className="space-y-1.5">
                      {[["SAME", "Trade on expiry with same expiry"], ["NEXT", "Trade on expiry with next expiry"]].map(([v, l]) => (
                        <button key={v} onClick={() => setG("expiryRule", v)}
                          className={"w-full flex items-center gap-2 px-3 py-2 rounded-lg border text-sm text-left " +
                            (globals.expiryRule === v ? "border-emerald-500 bg-emerald-500/10 text-zinc-100" : "border-zinc-800 text-zinc-400")}>
                          <span className={"w-3 h-3 rounded-full border " +
                            (globals.expiryRule === v ? "border-emerald-400 bg-emerald-400" : "border-zinc-600")} />
                          {l}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              </section>

              {[
                ["Indicators & patterns", indicators, setIndicators, ["indicator", "pattern"]],
                ["Cash prices", prices, setPrices, ["price"]],
              ].map(([label, list, setList, sheets]) => (
                <section key={label} className="rounded-2xl border border-zinc-800 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-[10px] uppercase tracking-wider text-zinc-500">{label}</p>
                    <div className="flex gap-1.5">
                      {sheets.map((s) => (
                        <button key={s} onClick={() => setSheet(s)}
                          className="flex items-center gap-1 text-[11px] text-emerald-400 border border-zinc-700 rounded-md px-2 py-1">
                          <Plus size={11} /> {s}
                        </button>
                      ))}
                    </div>
                  </div>
                  {list.length === 0 && (
                    <p className="text-xs text-zinc-600 py-3 text-center">Nothing defined yet — add one to use it in block conditions.</p>
                  )}
                  <div className="space-y-1.5">
                    {list.map((item) => (
                      <div key={item.id} className="flex items-center gap-2 px-3 py-2 rounded-lg bg-zinc-900 border border-zinc-800">
                        <span className="font-mono text-xs text-sky-300 flex-1">{item.name}</span>
                        <span className="text-[10px] text-zinc-500 font-mono">{item.tf}</span>
                        <IconBtn onClick={() => setList([...list, { ...item, id: uid() }])}><Copy size={12} /></IconBtn>
                        <IconBtn tone="danger" onClick={() => setList(list.filter((x) => x.id !== item.id))}><X size={12} /></IconBtn>
                      </div>
                    ))}
                  </div>
                </section>
              ))}

              <p className="text-[11px] text-zinc-600 px-1">
                Define every indicator or price here first — only then can it be used inside block entry/exit conditions.
              </p>
            </>
          )}

          {tab === "blocks" && (
            <>
              {blocks.map((b) => (
                <BlockCard key={b.id} block={b} tokens={tokens}
                  onChange={(nb) => setBlocks(blocks.map((x) => (x.id === b.id ? nb : x)))}
                  onCopy={() => setBlocks([...blocks, { ...structuredClone(b), id: uid(), name: b.name + " copy", positions: b.positions.map((p) => ({ ...p, id: uid() })) }])}
                  onDelete={() => setBlocks(blocks.filter((x) => x.id !== b.id))} />
              ))}
              <button onClick={() => setBlocks([...blocks, newBlock(blocks.length + 1)])}
                className="w-full py-3 rounded-2xl border border-dashed border-zinc-700 text-sm text-zinc-400 flex items-center justify-center gap-1.5 hover:border-emerald-500 hover:text-emerald-400">
                <Plus size={15} /> Add new block
              </button>
            </>
          )}
        </main>

        {/* fixed run bar */}
        <footer className="fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md border-t border-zinc-800 bg-zinc-950/95 backdrop-blur px-4 py-3 flex items-center gap-3">
          <div className="flex-1 min-w-0">
            <p className={"text-xs truncate " +
              (status.state === "done" ? "text-emerald-400" :
               status.state === "running" ? "text-amber-300" :
               status.state === "queued" ? "text-sky-300" : "text-zinc-500")}>
              {status.state === "running" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-amber-300 animate-pulse mr-1.5" />}
              {status.msg}
            </p>
            <p className="text-[10px] text-zinc-600 font-mono">
              {globals.index} · {blocks.length} block · {totalPos} pos · {globals.startDate} → {globals.endDate}
            </p>
          </div>
          <button onClick={runBacktest} disabled={status.state === "running" || status.state === "queued"}
            className="flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-emerald-500 text-zinc-950 text-sm font-semibold disabled:opacity-50">
            <Play size={14} fill="currentColor" /> Run Backtest
          </button>
        </footer>

        {/* sheets */}
        {sheet === "indicator" && <IndicatorSheet onAdd={(i) => setIndicators((s) => [...s, i])} onClose={() => setSheet(null)} />}
        {sheet === "pattern" && <PatternSheet onAdd={(i) => setIndicators((s) => [...s, i])} onClose={() => setSheet(null)} />}
        {sheet === "price" && <PriceSheet onAdd={(p) => setPrices((s) => [...s, p])} onClose={() => setSheet(null)} />}
      </div>
    </div>
  );
}
