import { useState, useRef } from "react";
import {
  Save, Check, ArrowLeft, Palette, Play, Calendar, AlertCircle,
  Store, Layers, FlaskConical,
} from "lucide-react";
import { THEMES } from "./genz/theme";
import { Field, Sheet, StatusChip, Toast } from "./genz/ui";
import {
  uid, newBlock, seedStrategies, DUMMY_TRADES, mk, validateBox, marketplaceSeeds,
} from "./genz/data";
import ConfigSummary from "./genz/ConfigSummary";
import BuilderPage from "./genz/BuilderPage";
import ResultsPage from "./genz/ResultsPage";
import StrategiesPage from "./genz/StrategiesPage";
import MarketplacePage from "./genz/MarketplacePage";
import PapertradePage from "./genz/PapertradePage";

/* Run sheet: dates & times + the strategy's full config below */
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

/* the default block a fresh strategy starts with */
const demoBlock = () => newBlock(1, {
  mode: "manual", pattern: null,
  tree: mk.tre(
    mk.cnd("RSI (14, 5)", ">", 60),
    mk.cnd("Close (5)", ">", "EMA (20, 5)", "AND"),
  ),
}, {
  mode: "manual", pattern: null,
  tree: mk.tre(mk.cnd("RSI (14, 5)", "<", 50)),
});

const validateBlocks = (blocks) => {
  const out = [];
  blocks.forEach((b) => {
    validateBox(b.entryBox).forEach((e) => out.push(`${b.name} · entry: ${e}`));
    validateBox(b.exitBox).forEach((e) => out.push(`${b.name} · exit: ${e}`));
  });
  return out;
};

const NAV = [
  ["market", "Market", Store],
  ["home", "Strategies", Layers],
  ["paper", "Papertrade", FlaskConical],
];

export default function StrategyBuilder() {
  const [themeKey, setThemeKey] = useState("kite");
  const t = THEMES[themeKey];

  /* pages: market | home | paper | builder | results */
  const [page, setPage] = useState("home");
  const [strategies, setStrategies] = useState(seedStrategies);
  const [market, setMarket] = useState(marketplaceSeeds);
  const [subscribedIds, setSubscribedIds] = useState(new Set());

  /* toast */
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);
  const notify = (msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  };

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
  const [blocks, setBlocks] = useState([demoBlock()]);
  const [saved, setSaved] = useState(false);
  const [saveErrors, setSaveErrors] = useState([]);

  /* run / results state */
  const [globals, setGlobals] = useState({
    index: "NIFTY", startDate: "2024-01-01", endDate: "2024-06-28",
    startTime: "09:30", endTime: "15:15",
  });
  const setG = (k, v) => setGlobals((g) => ({ ...g, [k]: v }));
  const [status, setStatus] = useState({ state: "ready", msg: "Ready to run backtest" });
  const [runSheet, setRunSheet] = useState(false);
  const [resultCtx, setResultCtx] = useState(null);
  const timers = useRef([]);

  const tokens = [...indicators.map((i) => i.name), ...prices.map((p) => p.name), "current_time"];

  /* ── strategy status/flag actions (⋮ menus) ── */
  const patchStrategy = (id, patch) =>
    setStrategies((list) => list.map((s) => (s.id === id ? { ...s, ...patch } : s)));

  const actions = {
    pause: (s) => { patchStrategy(s.id, { status: "PAUSED", paperRunning: false }); notify(`"${s.name}" paused`); },
    goLive: (s) => { patchStrategy(s.id, { status: "LIVE" }); notify(`"${s.name}" is now LIVE`); },
    toggleWatchlist: (s) => {
      patchStrategy(s.id, { watchlist: !s.watchlist, paperRunning: false });
      notify(s.watchlist
        ? `"${s.name}" removed from papertrade`
        : `"${s.name}" added to papertrade — see Papertrade tab`);
    },
    publish: (s) => {
      patchStrategy(s.id, { published: true });
      setMarket((m) => [...m, {
        id: uid(), name: s.name, author: "You", desc: `Published from My Strategies.`,
        tagsList: ["Community"], blocks: structuredClone(s.blocks), tokens: s.tokens || [],
        subs: 0, ret: 0, featured: false,
      }]);
      notify(`"${s.name}" published to Marketplace`);
    },
    remove: (s) => {
      setStrategies((list) => list.filter((x) => x.id !== s.id));
      notify(`"${s.name}" deleted`);
    },
  };

  const togglePaper = (s) => {
    patchStrategy(s.id, { paperRunning: !s.paperRunning });
    notify(s.paperRunning ? `Papertrade stopped for "${s.name}"` : `Papertrade started for "${s.name}"`);
  };

  const subscribe = (m) => {
    setSubscribedIds((set) => new Set(set).add(m.id));
    setStrategies((list) => [{
      id: uid(), name: m.name, status: "DRAFT", index: "NIFTY",
      blocks: structuredClone(m.blocks), tokens: m.tokens || [],
      updated: "2026-07-17", pnl: null,
      subscribed: true, watchlist: false, published: false,
    }, ...list]);
    notify(`"${m.name}" added to My Strategies — run it from there if you want`);
  };

  /* ── builder actions ── */
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
    setSaved(false); setSaveErrors([]); setTab("setup");
    setPage("builder");
  };

  const openEditStrategy = (s) => {
    setEditingId(s.id);
    setName(s.name);
    setIndex(s.index || "NIFTY");
    setBlocks(structuredClone(s.blocks));
    if (s.indicators) setIndicators(structuredClone(s.indicators));
    if (s.prices) setPrices(structuredClone(s.prices));
    setSaved(true); setSaveErrors([]); setTab("blocks");
    setPage("builder");
  };

  const saveStrategy = () => {
    const errors = validateBlocks(blocks);
    setSaveErrors(errors);
    if (errors.length) { setSaved(false); return; }

    setSaved(true);
    setStrategies((list) => {
      const payload = {
        name, index, blocks: structuredClone(blocks),
        indicators: structuredClone(indicators), prices: structuredClone(prices),
        tokens, updated: "2026-07-17",
      };
      if (editingId) return list.map((s) => (s.id === editingId ? { ...s, ...payload } : s));
      const id = uid();
      setEditingId(id);
      return [{ id, status: "DRAFT", pnl: null, subscribed: false, watchlist: false, published: false, ...payload }, ...list];
    });
    notify("Strategy saved");
  };

  const runBacktest = () => {
    const errors = validateBlocks(blocks);
    if (errors.length) {
      setRunSheet(false); setSaveErrors(errors);
      setStatus({ state: "ready", msg: "Fix condition issues before running" });
      return;
    }
    setSaveErrors([]); setRunSheet(false);
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

  const editingStrategy = strategies.find((s) => s.id === editingId);
  const isMainPage = ["market", "home", "paper"].includes(page);
  const pageTitle =
    page === "market" ? "Marketplace" :
    page === "home" ? "My strategies" :
    page === "paper" ? "Papertrade" : "";

  return (
    <div className={"min-h-screen flex justify-center " + t.app} style={{ fontFamily: t.font }}>
      <div className={"w-full max-w-md flex flex-col min-h-screen " + t.shell}>

        <Toast t={t} toast={toast} />

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
            {!isMainPage && (
              <button onClick={() => setPage(page === "results" && resultCtx?.showRerun ? "builder" : "home")}
                className={"p-1 " + t.linkAccent}>
                <ArrowLeft size={20} />
              </button>
            )}

            {isMainPage && <h1 className="text-xl font-semibold flex-1">{pageTitle}</h1>}

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

          {page === "builder" && saveErrors.length > 0 && (
            <div className="mt-2 rounded-xl bg-red-500/10 border border-red-300 p-2.5 space-y-1">
              {saveErrors.slice(0, 4).map((e, i) => (
                <p key={i} className="text-xs text-red-500 flex items-start gap-1.5">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" /> {e}
                </p>
              ))}
              {saveErrors.length > 4 && (
                <p className="text-xs text-red-400">…and {saveErrors.length - 4} more</p>
              )}
            </div>
          )}
        </header>

        {page === "market" && (
          <MarketplacePage t={t} market={market}
            onSubscribe={subscribe} subscribedIds={subscribedIds} />
        )}

        {page === "home" && (
          <StrategiesPage t={t} strategies={strategies}
            onOpen={openStrategyResults} onEdit={openEditStrategy}
            onNew={openNewStrategy} actions={actions} />
        )}

        {page === "paper" && (
          <PapertradePage t={t} strategies={strategies}
            onTogglePaper={togglePaper}
            onGoLive={actions.goLive}
            onRemove={actions.toggleWatchlist} />
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

        {/* bottom navigation — main pages only */}
        {isMainPage && (
          <nav className={"fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md backdrop-blur flex " + t.footer}>
            {NAV.map(([id, label, Icon]) => (
              <button key={id} onClick={() => setPage(id)}
                className={"flex-1 flex flex-col items-center gap-0.5 py-2.5 text-[11px] font-medium transition-colors " +
                  (page === id ? t.linkAccent : t.muted)}>
                <Icon size={20} strokeWidth={page === id ? 2.4 : 1.8} />
                {label}
              </button>
            ))}
          </nav>
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
