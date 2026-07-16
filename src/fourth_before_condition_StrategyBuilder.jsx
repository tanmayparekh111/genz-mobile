import { useState, useRef } from "react";
import { Save, Check, ArrowLeft, Palette, Play, Calendar } from "lucide-react";
import { THEMES } from "./genz/theme";
import { Field, Sheet, StatusChip } from "./genz/ui";
import {
  uid, newBlock, seedStrategies, DUMMY_TRADES,
} from "./genz/data";
import ConfigSummary from "./genz/ConfigSummary";
import BuilderPage from "./genz/BuilderPage";
import ResultsPage from "./genz/ResultsPage";
import StrategiesPage from "./genz/StrategiesPage";

/* Run sheet: dates & times + the strategy's full config below,
   so the user reviews exactly what is about to run. */
function RunSheet({ t, globals, setG, blocks, tokens, onRun, onClose }) {
  return (
    <Sheet t={t} title="Run backtest" onClose={onClose}>
      <p className={"text-sm mb-3 " + t.muted}>
        <Calendar size={13} className="inline mr-1 -mt-0.5" />
        Choose the date & time window for this backtest.
      </p>
      <div className="grid grid-cols-2 gap-3">
        <Field t={t} label="Start date"><input type="date" className={t.input} value={globals.startDate} onChange={(e) => setG("startDate", e.target.value)} /></Field>
        <Field t={t} label="End date"><input type="date" className={t.input} value={globals.endDate} onChange={(e) => setG("endDate", e.target.value)} /></Field>
        <Field t={t} label="Start time"><input type="time" className={t.input} value={globals.startTime} onChange={(e) => setG("startTime", e.target.value)} /></Field>
        <Field t={t} label="End time"><input type="time" className={t.input} value={globals.endTime} onChange={(e) => setG("endTime", e.target.value)} /></Field>
      </div>

      <p className={t.sectionLabel + " mt-4 mb-2"}>What will run</p>
      <ConfigSummary t={t} blocks={blocks} tokens={tokens} />

      <button onClick={onRun}
        className={"mt-4 w-full py-3.5 text-sm flex items-center justify-center gap-1.5 " + t.primaryBtn}>
        <Play size={15} fill="currentColor" /> Run Backtest
      </button>
    </Sheet>
  );
}

export default function StrategyBuilder() {
  const [themeKey, setThemeKey] = useState("kite");
  const t = THEMES[themeKey];

  /* pages: home (strategy list) | builder | results */
  const [page, setPage] = useState("home");
  const [strategies, setStrategies] = useState(seedStrategies);

  /* builder state */
  const [editingId, setEditingId] = useState(null);
  const [name, setName] = useState("My Strategy 01");
  const [tab, setTab] = useState("setup");
  const [index, setIndex] = useState("NIFTY");
  const [indicators, setIndicators] = useState([
    { id: uid(), name: "RSI (14, 5)", type: "RSI", period: 14, tf: "5m" },
    { id: uid(), name: "EMA (20, 5)", type: "EMA", period: 20, tf: "5m" },
  ]);
  const [prices, setPrices] = useState([
    { id: uid(), name: "Close (5)", field: "Close", tf: "5m" },
    { id: uid(), name: "Open (5)", field: "Open", tf: "5m" },
  ]);
  const [blocks, setBlocks] = useState([
    { ...newBlock(1), entry: "RSI (14, 5) > 60 AND Close (5) > EMA (20, 5)", exit: "RSI (14, 5) < 50" },
  ]);
  const [saved, setSaved] = useState(false);

  /* run / results state */
  const [globals, setGlobals] = useState({
    index: "NIFTY", startDate: "2024-01-01", endDate: "2024-06-28",
    startTime: "09:30", endTime: "15:15",
  });
  const setG = (k, v) => setGlobals((g) => ({ ...g, [k]: v }));
  const [status, setStatus] = useState({ state: "ready", msg: "Ready to run backtest" });
  const [runSheet, setRunSheet] = useState(false);
  const [resultCtx, setResultCtx] = useState(null); // { name, showRerun }
  const timers = useRef([]);

  const tokens = [...indicators.map((i) => i.name), ...prices.map((p) => p.name), "current_time"];

  /* ── actions ── */

  const openNewStrategy = () => {
    setEditingId(null);
    setName(`My Strategy ${String(strategies.length + 1).padStart(2, "0")}`);
    setIndex("NIFTY");
    setIndicators([
      { id: uid(), name: "RSI (14, 5)", type: "RSI", period: 14, tf: "5m" },
      { id: uid(), name: "EMA (20, 5)", type: "EMA", period: 20, tf: "5m" },
    ]);
    setPrices([{ id: uid(), name: "Close (5)", field: "Close", tf: "5m" }]);
    setBlocks([newBlock(1)]);
    setSaved(false);
    setTab("setup");
    setPage("builder");
  };

  const openEditStrategy = (s) => {
    setEditingId(s.id);
    setName(s.name);
    setIndex(s.index || "NIFTY");
    setBlocks(structuredClone(s.blocks));
    if (s.indicators) setIndicators(structuredClone(s.indicators));
    if (s.prices) setPrices(structuredClone(s.prices));
    setSaved(true);
    setTab("blocks");
    setPage("builder");
  };

  const saveStrategy = () => {
    setSaved(true);
    setStrategies((list) => {
      const payload = {
        name, index, blocks: structuredClone(blocks),
        indicators: structuredClone(indicators), prices: structuredClone(prices),
        tokens, updated: "2026-07-15",
      };
      if (editingId) {
        return list.map((s) => (s.id === editingId ? { ...s, ...payload } : s));
      }
      const id = uid();
      setEditingId(id);
      return [{ id, status: "DRAFT", pnl: null, ...payload }, ...list];
    });
  };

  const runBacktest = () => {
    setRunSheet(false);
    setStatus({ state: "queued", msg: "Queued on worker…" });
    const nPos = blocks.reduce((a, b) => a + b.positions.length, 0);
    timers.current.forEach(clearTimeout);
    timers.current = [
      setTimeout(() => setStatus({ state: "running", msg: `Running ${blocks.length} block(s), ${nPos} position(s)…` }), 800),
      setTimeout(() => {
        setStatus({ state: "done", msg: "Backtest complete" });
        setResultCtx({ name, showRerun: true });
        setPage("results");
      }, 2600),
    ];
  };

  const openStrategyResults = (s) => {
    setResultCtx({ name: s.name, showRerun: false });
    setPage("results");
  };

  /* ── header title per page ── */
  const editingStrategy = strategies.find((s) => s.id === editingId);

  return (
    <div className={"min-h-screen flex justify-center " + t.app} style={{ fontFamily: t.font }}>
      <div className={"w-full max-w-md flex flex-col min-h-screen " + t.shell}>

        <header className={"px-4 pt-4 pb-3 sticky top-0 backdrop-blur z-10 " + t.header}>
          <div className="flex items-center justify-between">
            <p className={"text-[11px] uppercase tracking-widest font-semibold " + t.brand}>
              GenZ · Backtest
            </p>
            {/* theme switcher — remove once you've picked one */}
            <div className="flex items-center gap-1 overflow-x-auto">
              <Palette size={13} className={t.muted + " shrink-0"} />
              {Object.keys(THEMES).map((k) => (
                <button key={k} onClick={() => setThemeKey(k)}
                  className={"text-[11px] px-2 py-0.5 rounded-full border shrink-0 " +
                    (k === themeKey
                      ? t.linkAccent + " border-current font-semibold"
                      : t.muted + " border-transparent")}>
                  {THEMES[k].label}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 mt-2">
            {page !== "home" && (
              <button onClick={() => setPage(page === "results" && resultCtx?.showRerun ? "builder" : "home")}
                className={"p-1 " + t.linkAccent}>
                <ArrowLeft size={20} />
              </button>
            )}

            {page === "home" && <h1 className="text-xl font-semibold flex-1">My strategies</h1>}

            {page === "builder" && (
              <>
                <input value={name} onChange={(e) => { setName(e.target.value); setSaved(false); }}
                  className="bg-transparent text-xl font-semibold flex-1 min-w-0 focus:outline-none" />
                {editingStrategy && <StatusChip t={t} status={editingStrategy.status} />}
                <button onClick={saveStrategy}
                  className={"flex items-center gap-1 text-sm px-3 py-2 shrink-0 " +
                    (saved ? "text-green-600 border border-green-200 rounded-lg bg-green-50" : t.ghostBtn)}>
                  {saved ? <Check size={13} /> : <Save size={13} />}{saved ? "Saved" : "Save"}
                </button>
              </>
            )}

            {page === "results" && (
              <h1 className="text-xl font-semibold flex-1 truncate">{resultCtx?.name} — results</h1>
            )}
          </div>
        </header>

        {page === "home" && (
          <StrategiesPage t={t} strategies={strategies}
            onOpen={openStrategyResults} onEdit={openEditStrategy} onNew={openNewStrategy} />
        )}

        {page === "builder" && (
          <BuilderPage t={t} tab={tab} setTab={setTab}
            index={index} setIndex={setIndex}
            indicators={indicators} setIndicators={setIndicators}
            prices={prices} setPrices={setPrices}
            blocks={blocks} setBlocks={setBlocks}
            tokens={tokens} status={status}
            onRunClick={() => setRunSheet(true)} />
        )}

        {page === "results" && resultCtx && (
          <ResultsPage t={t} name={resultCtx.name} trades={DUMMY_TRADES} globals={{ ...globals, index }}
            onBack={() => setPage(resultCtx.showRerun ? "builder" : "home")}
            onRerun={() => setRunSheet(true)}
            showRerun={resultCtx.showRerun} />
        )}

        {runSheet && (
          <RunSheet t={t} globals={globals} setG={setG}
            blocks={blocks} tokens={tokens}
            onRun={runBacktest} onClose={() => setRunSheet(false)} />
        )}
      </div>
    </div>
  );
}
