import { useState } from "react";
import {
  Plus, Copy, X, ChevronDown, ChevronRight, Play,
  Settings2, Boxes, Pencil, Clock, Zap, Calendar
} from "lucide-react";
import {
  TIMEFRAMES, INDICATOR_TYPES, PRICE_FIELDS, INSTRUMENTS, EXPIRY_TYPES, PATTERNS
} from "./theme";
import { Field, Select, Toggle, IconBtn, Expr, Sheet } from "./ui";
import { uid, newPosition, newBlock, indicatorName, priceName, patternName } from "./data";

/* ── add-sheets (display naming: "RSI (14, 5)") ─────────── */

function IndicatorSheet({ t, onAdd, onClose }) {
  const [type, setType] = useState("RSI");
  const [period, setPeriod] = useState(14);
  const [tf, setTf] = useState("5m");
  const name = indicatorName(type, period, tf);
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
      <p className={"mt-3 text-sm " + t.muted}>
        Will appear in conditions as <span className={t.exprId}>{name}</span>
      </p>
      <button onClick={() => { onAdd({ id: uid(), name, type, period, tf }); onClose(); }}
        className={"mt-4 w-full py-3 text-sm " + t.primaryBtn}>
        Add {name}
      </button>
    </Sheet>
  );
}

function PriceSheet({ t, onAdd, onClose }) {
  const [field, setField] = useState("Close");
  const [tf, setTf] = useState("5m");
  const [prev, setPrev] = useState(false);
  const name = priceName(field, tf, prev);
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
      <p className={"mt-3 text-sm " + t.muted}>
        Will appear in conditions as <span className={t.exprId}>{name}</span>
      </p>
      <button onClick={() => { onAdd({ id: uid(), name, field, tf, prev }); onClose(); }}
        className={"mt-4 w-full py-3 text-sm " + t.primaryBtn}>
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
      <div className="mt-3 max-h-72 overflow-y-auto space-y-1.5">
        {PATTERNS.map((p) => {
          const name = patternName(p.name, tf);
          return (
            <button key={p.name}
              onClick={() => { onAdd({ id: uid(), name, type: "PATTERN", tf }); onClose(); }}
              className={"w-full flex items-center justify-between px-3 py-2.5 text-left " + t.rowItem}>
              <span className={"text-sm " + t.body}>{name}</span>
              <span className={"text-[11px] uppercase " + t.muted}>{p.candles} candle</span>
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
        rows={5} placeholder="e.g. RSI (14, 5) > 60 AND Close (5) > EMA (20, 5)"
        className={t.input + " text-sm resize-none"} />
      <div className={"flex justify-between text-[11px] mt-1 " + t.muted}>
        <span>Operators: AND OR &gt; &lt; &gt;= &lt;= + - * /</span>
        <span>{text.length}/500</span>
      </div>
      {tokens.length > 0 && (
        <>
          <p className={"text-sm mt-3 mb-1.5 " + t.muted}>Tap to insert (defined in Setup):</p>
          <div className="flex flex-wrap gap-1.5">
            {tokens.map((tok) => (
              <button key={tok} onClick={() => setText((s) => (s ? s + " " + tok : tok))}
                className={"px-2.5 py-1.5 text-xs " + t.token}>
                {tok}
              </button>
            ))}
            {["AND", "OR", ">", "<", ">=", "<="].map((op) => (
              <button key={op} onClick={() => setText((s) => (s ? s + " " + op : op))}
                className={"px-2.5 py-1.5 text-xs " + t.op}>
                {op}
              </button>
            ))}
          </div>
        </>
      )}
      <button onClick={() => { onSave(text.trim()); onClose(); }}
        className={"mt-4 w-full py-3 text-sm " + t.primaryBtn}>
        Save condition
      </button>
    </Sheet>
  );
}

/* ── position card ─────────────────────────────────────── */

function PositionCard({ t, pos, onChange, onCopy, onDelete }) {
  const set = (k, v) => onChange({ ...pos, [k]: v });
  const sell = pos.side === "SELL";
  return (
    <div className={t.innerCard + " overflow-hidden"}>
      <div className="flex items-center gap-2 px-3 py-3">
        <button onClick={() => set("open", !pos.open)} className="flex items-center gap-2 flex-1 text-left">
          {pos.open ? <ChevronDown size={15} className={t.muted} /> : <ChevronRight size={15} className={t.muted} />}
          <span className="text-[15px] font-medium">{pos.name}</span>
          <span className={"text-[11px] font-medium px-1.5 py-0.5 rounded " + (sell ? t.chipSell : t.chipBuy)}>
            {pos.side} {pos.optionType}
          </span>
        </button>
        <IconBtn t={t} onClick={onCopy}><Copy size={14} /></IconBtn>
        <IconBtn t={t} danger onClick={onDelete}><X size={14} /></IconBtn>
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
                <p className={"col-span-2 text-xs " + t.muted}>
                  When profit reaches <b>{pos.trailX}</b>, stop loss moves by <b>{pos.trailY}</b> {pos.trailUnit.toLowerCase()}s.
                </p>
              </div>
            )}
          </div>

          <div className={"p-2.5 space-y-2 " + t.rowItem}>
            <div className="flex items-center justify-between">
              <p className={t.sectionLabel + " flex items-center gap-1"}><Zap size={12} /> Momentum entry</p>
              <Toggle t={t} on={pos.momentumOn} onChange={(v) => set("momentumOn", v)} />
            </div>
            {pos.momentumOn && (
              <div className="grid grid-cols-2 gap-2">
                <Select t={t} value={pos.momentumType} onChange={(v) => set("momentumType", v)}
                  options={["POINTS_UP", "POINTS_DOWN", "PERCENT_UP", "PERCENT_DOWN"]} />
                <input type="number" className={t.input} value={pos.momentumValue}
                  onChange={(e) => set("momentumValue", e.target.value)} />
                <p className={"col-span-2 text-xs " + t.muted}>
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
                  <span className={"text-sm pb-2.5 " + t.body}>{label}</span>
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

/* ── block card ────────────────────────────────────────── */

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
            ? <ChevronDown size={17} className={t.linkAccent} />
            : <ChevronRight size={17} className={t.muted} />}
          <span className="text-[15px] font-semibold">{block.name}</span>
          <span className={"text-[11px] " + t.muted}>
            {block.positions.length} pos · {block.entryTf}/{block.exitTf}
          </span>
        </button>
        <IconBtn t={t} onClick={onCopy}><Copy size={14} /></IconBtn>
        <IconBtn t={t} danger onClick={onDelete}><X size={14} /></IconBtn>
      </div>

      {block.open && (
        <div className="p-3 pt-0 space-y-3">
          {[["Entry condition", "entry", "entryTf"], ["Exit condition", "exit", "exitTf"]].map(
            ([label, condK, tfK]) => (
              <div key={condK} className={"p-3 " + t.innerCard}>
                <div className="flex items-center justify-between mb-2">
                  <p className={t.sectionLabel}>{label}</p>
                  <div className="flex items-center gap-3">
                    <div className={"flex items-center gap-1 text-[11px] " + t.muted}>
                      <Clock size={11} />
                      <select value={block[tfK]} onChange={(e) => set(tfK, e.target.value)}
                        className={"bg-transparent focus:outline-none " + t.linkAccent}>
                        {TIMEFRAMES.map((x) => <option key={x}>{x}</option>)}
                      </select>
                    </div>
                    <button onClick={() => setEditing(condK)}
                      className={"flex items-center gap-1 text-xs font-medium " + t.linkAccent}>
                      <Pencil size={12} /> Edit
                    </button>
                  </div>
                </div>
                <Expr t={t} text={block[condK]} tokens={tokens} />
                <p className={"text-right text-[11px] mt-1 " + t.muted}>{block[condK].length}/500</p>
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
            className={"w-full py-3 text-sm flex items-center justify-center gap-1.5 " + t.dashed}>
            <Plus size={15} /> Add position
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

/* ── builder page (setup + blocks tabs + run bar) ──────── */

export default function BuilderPage({
  t, tab, setTab,
  index, setIndex,
  indicators, setIndicators,
  prices, setPrices,
  blocks, setBlocks,
  tokens, status, onRunClick,
}) {
  const [sheet, setSheet] = useState(null);
  const totalPos = blocks.reduce((a, b) => a + b.positions.length, 0);

  const statusColor =
    status.state === "done" ? t.statusDone :
    status.state === "running" ? t.statusRun :
    status.state === "queued" ? t.statusQueue : t.muted;

  return (
    <>
      <div className={"flex mx-4 mt-3 " + t.tabWrap}>
        {[["setup", "Setup", Settings2], ["blocks", "Blocks", Boxes]].map(([id, label, Icon]) => (
          <button key={id} onClick={() => setTab(id)}
            className={"flex-1 flex items-center justify-center gap-1.5 py-2.5 text-sm transition-colors " +
              (tab === id ? t.tabOn : t.tabOff)}>
            <Icon size={15} /> {label}
            {id === "blocks" && <span className={"text-[11px] " + t.muted}>{blocks.length}</span>}
          </button>
        ))}
      </div>

      <main className="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
        {tab === "setup" && (
          <>
            <section className={"p-4 space-y-3 " + t.card}>
              <p className={t.sectionLabel}>Input parameters</p>
              <Field t={t} label="Index / Equity">
                <input className={t.input} value={index}
                  onChange={(e) => setIndex(e.target.value.toUpperCase())}
                  placeholder="NIFTY, SBIN, RELIANCE…" />
              </Field>
              <p className={"text-xs " + t.muted}>
                <Calendar size={12} className="inline mr-1 -mt-0.5" />
                Backtest dates & times are asked when you tap <b>Run Backtest</b>.
              </p>
            </section>

            {[
              ["Indicators & patterns", indicators, setIndicators, ["indicator", "pattern"]],
              ["Cash prices", prices, setPrices, ["price"]],
            ].map(([label, list, setList, sheets]) => (
              <section key={label} className={"p-4 " + t.card}>
                <div className="flex items-center justify-between mb-2">
                  <p className={t.sectionLabel}>{label}</p>
                  <div className="flex gap-1.5">
                    {sheets.map((s) => (
                      <button key={s} onClick={() => setSheet(s)}
                        className={"flex items-center gap-1 text-xs px-2.5 py-1.5 " + t.ghostBtn}>
                        <Plus size={12} /> {s}
                      </button>
                    ))}
                  </div>
                </div>
                {list.length === 0 && (
                  <p className={"text-sm py-3 text-center " + t.muted}>
                    Nothing defined yet — add one to use it in block conditions.
                  </p>
                )}
                <div className="space-y-1.5">
                  {list.map((item) => (
                    <div key={item.id} className={"flex items-center gap-2 px-3 py-2.5 " + t.rowItem}>
                      <span className={"text-sm flex-1 " + t.exprId}>{item.name}</span>
                      <IconBtn t={t} onClick={() => setList([...list, { ...item, id: uid() }])}><Copy size={13} /></IconBtn>
                      <IconBtn t={t} danger onClick={() => setList(list.filter((x) => x.id !== item.id))}><X size={13} /></IconBtn>
                    </div>
                  ))}
                </div>
              </section>
            ))}

            <p className={"text-xs px-1 " + t.muted}>
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
              className={"w-full py-3.5 text-sm flex items-center justify-center gap-1.5 " + t.dashed}>
              <Plus size={16} /> Add new block
            </button>
          </>
        )}
      </main>

      {/* fixed run bar */}
      <footer className={"fixed bottom-0 left-1/2 -translate-x-1/2 w-full max-w-md backdrop-blur px-4 py-3 flex items-center gap-3 " + t.footer}>
        <div className="flex-1 min-w-0">
          <p className={"text-sm truncate font-medium " + statusColor}>
            {status.state === "running" && <span className="inline-block w-1.5 h-1.5 rounded-full bg-current animate-pulse mr-1.5" />}
            {status.msg}
          </p>
          <p className={"text-[11px] " + t.muted}>
            {index} · {blocks.length} block · {totalPos} pos
          </p>
        </div>
        <button onClick={onRunClick} disabled={status.state === "running" || status.state === "queued"}
          className={"flex items-center gap-1.5 px-4 py-3 text-sm disabled:opacity-50 " + t.primaryBtn}>
          <Play size={15} fill="currentColor" /> Run Backtest
        </button>
      </footer>

      {/* add sheets */}
      {sheet === "indicator" && <IndicatorSheet t={t} onAdd={(i) => setIndicators((s) => [...s, i])} onClose={() => setSheet(null)} />}
      {sheet === "pattern" && <PatternSheet t={t} onAdd={(i) => setIndicators((s) => [...s, i])} onClose={() => setSheet(null)} />}
      {sheet === "price" && <PriceSheet t={t} onAdd={(p) => setPrices((s) => [...s, p])} onClose={() => setSheet(null)} />}
    </>
  );
}
