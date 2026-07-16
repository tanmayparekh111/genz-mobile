import { useState } from "react";
import { Plus, X, ChevronRight, Hash, Activity, AlertCircle, Sparkles, Braces } from "lucide-react";
import { TIMEFRAMES, PATTERNS } from "./theme";
import { Sheet, Field, Select } from "./ui";
import {
  newCondNode, newGroupNode, emptyTree, mapTree, removeById,
  treeToText, validateBox, patternName,
} from "./data";

const CMPS = [">", "<", ">=", "<=", "=", "!="];

/* ── chips ─────────────────────────────────────────────── */

const chipBase = "inline-flex items-center gap-1 rounded-lg text-sm px-2.5 py-1.5 border transition-colors";

function OperandChip({ t, operand, onClick }) {
  const empty = !operand.kind;
  return (
    <button onClick={onClick}
      className={chipBase + " " + (empty
        ? "border-dashed " + t.muted + " border-current opacity-70"
        : operand.kind === "number"
          ? "border-amber-300 bg-amber-500/10 text-amber-600 font-semibold"
          : t.token)}>
      {empty ? <>select <ChevronRight size={13} /></> : operand.value}
    </button>
  );
}

function CmpChip({ onClick, value }) {
  return (
    <button onClick={onClick}
      className={chipBase + " border-orange-300 bg-orange-500/10 text-orange-500 font-bold min-w-10 justify-center"}>
      {value}
    </button>
  );
}

function JoinChip({ value, onToggle }) {
  return (
    <button onClick={onToggle}
      className={"self-start text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-full border my-1 " +
        (value === "AND"
          ? "bg-emerald-500/10 text-emerald-500 border-emerald-300"
          : "bg-violet-500/10 text-violet-500 border-violet-300")}>
      {value} <span className="opacity-50 font-normal">⇄</span>
    </button>
  );
}

/* ── rows ──────────────────────────────────────────────── */

function ConditionRow({ t, node, onPick, onCmp, onDelete }) {
  return (
    <div className={"flex items-center gap-1.5 flex-wrap rounded-xl p-2 " + t.rowItem}>
      <OperandChip t={t} operand={node.lhs} onClick={() => onPick(node.id, "lhs")} />
      <CmpChip value={node.cmp} onClick={() => onCmp(node.id)} />
      <OperandChip t={t} operand={node.rhs} onClick={() => onPick(node.id, "rhs")} />
      <button onClick={() => onDelete(node.id)}
        className={"ml-auto p-1.5 rounded-md hover:text-red-400 " + t.muted}>
        <X size={14} />
      </button>
    </div>
  );
}

function GroupBox({ t, node, depth, handlers }) {
  const { onPick, onCmp, onDelete, onAdd, onToggleJoin } = handlers;
  const tint = ["border-blue-300/60", "border-violet-300/60", "border-teal-300/60"][depth % 3];
  return (
    <div className={"rounded-2xl border-2 border-dashed p-2.5 " + tint}>
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span className={"text-[11px] font-bold tracking-widest " + t.muted}>( GROUP</span>
        <button onClick={() => onDelete(node.id)}
          className={"p-1 rounded-md hover:text-red-400 " + t.muted}>
          <X size={13} />
        </button>
      </div>

      <div className="space-y-1">
        {node.children.map((c, i) => (
          <div key={c.id}>
            {i > 0 && <JoinChip value={c.join} onToggle={() => onToggleJoin(c.id)} />}
            {c.type === "cond"
              ? <ConditionRow t={t} node={c} onPick={onPick} onCmp={onCmp} onDelete={onDelete} />
              : <GroupBox t={t} node={c} depth={depth + 1} handlers={handlers} />}
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 mt-2 items-end">
        <button onClick={() => onAdd(node.id, "cond")}
          className={"flex items-center gap-1 text-xs px-2.5 py-1.5 " + t.ghostBtn}>
          <Plus size={12} /> Condition
        </button>
        <button onClick={() => onAdd(node.id, "group")}
          className={"flex items-center gap-1 text-xs px-2.5 py-1.5 " + t.ghostBtn}>
          <Braces size={12} /> Group
        </button>
        <span className={"ml-auto text-[11px] font-bold tracking-widest " + t.muted}>)</span>
      </div>
    </div>
  );
}

/* ══════════════════════════════════════════════════════════
   ConditionBuilder
   value = { mode:null|'pattern'|'manual', pattern, tree }
   onChange(nextValue) — parent also refreshes the derived text
   ══════════════════════════════════════════════════════════ */

export default function ConditionBuilder({ t, tokens, value, onChange }) {
  const { mode, pattern, tree } = value;

  const [chooser, setChooser] = useState(false);
  const [patternSheet, setPatternSheet] = useState(false);
  const [patternTf, setPatternTf] = useState("5m");
  const [operandPick, setOperandPick] = useState(null); // {condId, side}
  const [numInput, setNumInput] = useState("");
  const [cmpPick, setCmpPick] = useState(null);

  const update = (patch) => onChange({ ...value, ...patch });

  /* tree ops */
  const setTree = (fn) => update({ tree: fn(tree) });
  const addTo = (groupId, kind) =>
    setTree((tr) => mapTree(tr, (n) =>
      n.id === groupId && n.type === "group"
        ? {
            ...n, children: [...n.children,
              kind === "cond"
                ? newCondNode(n.children.length ? "AND" : undefined)
                : newGroupNode(n.children.length ? "AND" : undefined)],
          }
        : n));
  const del = (id) => setTree((tr) => removeById(tr, id));
  const toggleJoin = (id) =>
    setTree((tr) => mapTree(tr, (n) => (n.id === id ? { ...n, join: n.join === "AND" ? "OR" : "AND" } : n)));
  const setCmp = (id, cmp) =>
    setTree((tr) => mapTree(tr, (n) => (n.id === id ? { ...n, cmp } : n)));
  const setOperand = (id, side, operand) =>
    setTree((tr) => mapTree(tr, (n) => (n.id === id ? { ...n, [side]: operand } : n)));

  const startManual = () => {
    update({ mode: "manual", pattern: null, tree: { ...emptyTree(), children: [newCondNode()] } });
    setChooser(false);
  };
  const clearAll = () => update({ mode: null, pattern: null, tree: emptyTree() });

  const handlers = {
    onPick: (id, side) => { setOperandPick({ condId: id, side }); setNumInput(""); },
    onCmp: (id) => setCmpPick(id),
    onDelete: del, onAdd: addTo, onToggleJoin: toggleJoin,
  };

  const text = mode === "pattern" ? pattern : treeToText(tree, true);
  const errors = validateBox(value);

  return (
    <div>
      {/* empty state */}
      {mode === null && (
        <button onClick={() => setChooser(true)}
          className={"w-full py-6 flex flex-col items-center gap-1 text-sm " + t.dashed}>
          <Plus size={20} />
          <span className="font-medium">Add condition</span>
          <span className={"text-[11px] " + t.muted}>empty = always true</span>
        </button>
      )}

      {/* pattern mode: exactly one */}
      {mode === "pattern" && (
        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 rounded-xl bg-violet-500/10 border border-violet-300 text-violet-500 text-sm font-medium px-3 py-2">
            <Sparkles size={14} /> {pattern}
          </span>
          <button onClick={clearAll}
            className={"p-1.5 rounded-md hover:text-red-400 " + t.muted}>
            <X size={15} />
          </button>
          <span className={"text-[11px] ml-auto " + t.muted}>patterns: max 1</span>
        </div>
      )}

      {/* manual mode: the tree */}
      {mode === "manual" && (
        <>
          <div className="space-y-1">
            {tree.children.map((c, i) => (
              <div key={c.id}>
                {i > 0 && <JoinChip value={c.join} onToggle={() => toggleJoin(c.id)} />}
                {c.type === "cond"
                  ? <ConditionRow t={t} node={c} onPick={handlers.onPick} onCmp={handlers.onCmp} onDelete={del} />
                  : <GroupBox t={t} node={c} depth={0} handlers={handlers} />}
              </div>
            ))}
          </div>
          <div className="flex gap-1.5 mt-2">
            <button onClick={() => addTo(tree.id, "cond")}
              className={"flex items-center gap-1 text-xs px-3 py-2 " + t.ghostBtn}>
              <Plus size={13} /> Condition
            </button>
            <button onClick={() => addTo(tree.id, "group")}
              className={"flex items-center gap-1 text-xs px-3 py-2 " + t.ghostBtn}>
              <Braces size={13} /> Group
            </button>
            <button onClick={clearAll}
              className={"ml-auto text-xs px-3 py-2 hover:text-red-400 " + t.muted}>
              Clear
            </button>
          </div>
        </>
      )}

      {/* live preview + inline issues */}
      {mode !== null && (
        <>
          <div className="mt-2.5 rounded-xl bg-slate-900 p-3">
            <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Preview</p>
            <p className="text-sm text-emerald-300 leading-relaxed break-words">
              {text || <span className="text-slate-600 italic">…</span>}
            </p>
          </div>
          {errors.length > 0 && (
            <div className="mt-2 rounded-xl bg-red-500/10 border border-red-300 p-2.5 space-y-1">
              {errors.map((e, i) => (
                <p key={i} className="text-xs text-red-500 flex items-start gap-1.5">
                  <AlertCircle size={13} className="mt-0.5 shrink-0" /> {e}
                </p>
              ))}
            </div>
          )}
        </>
      )}

      {/* ═ sheets ═ */}

      {chooser && (
        <Sheet t={t} title="Add to condition box" onClose={() => setChooser(false)}>
          <div className="space-y-2">
            <button onClick={() => { setChooser(false); setPatternSheet(true); }}
              className={"w-full flex items-center gap-3 p-3.5 text-left " + t.rowItem}>
              <span className="p-2 rounded-lg bg-violet-500/10 text-violet-500"><Sparkles size={18} /></span>
              <span>
                <span className="block text-sm font-semibold">Default pattern</span>
                <span className={"block text-xs " + t.muted}>Pick one ready-made candle pattern (only one allowed)</span>
              </span>
            </button>
            <button onClick={startManual}
              className={"w-full flex items-center gap-3 p-3.5 text-left " + t.rowItem}>
              <span className={"p-2 rounded-lg " + t.token}><Braces size={18} /></span>
              <span>
                <span className="block text-sm font-semibold">Manual condition</span>
                <span className={"block text-xs " + t.muted}>Build your own with conditions, groups and AND/OR</span>
              </span>
            </button>
          </div>
        </Sheet>
      )}

      {patternSheet && (
        <Sheet t={t} title="Choose a pattern" onClose={() => setPatternSheet(false)}>
          <Field t={t} label="Timeframe">
            <Select t={t} value={patternTf} onChange={setPatternTf} options={TIMEFRAMES} />
          </Field>
          <div className="mt-3 max-h-72 overflow-y-auto space-y-1.5">
            {PATTERNS.map((p) => {
              const name = patternName(p.name, patternTf);
              return (
                <button key={p.name}
                  onClick={() => { update({ mode: "pattern", pattern: name, tree: emptyTree() }); setPatternSheet(false); }}
                  className={"w-full flex items-center justify-between px-3 py-2.5 text-left " + t.rowItem}>
                  <span className={"text-sm " + t.body}>{name}</span>
                  <Sparkles size={13} className="text-violet-400" />
                </button>
              );
            })}
          </div>
        </Sheet>
      )}

      {operandPick && (
        <Sheet t={t} title="Pick indicator / price — or type a number" onClose={() => setOperandPick(null)}>
          <p className={t.sectionLabel + " mb-1.5 flex items-center gap-1"}>
            <Activity size={12} /> Your indicators & prices
          </p>
          {tokens.length === 0 && (
            <p className={"text-sm mb-3 " + t.muted}>Nothing defined yet — add indicators/prices in Setup first.</p>
          )}
          <div className="flex flex-wrap gap-1.5 mb-4">
            {tokens.map((tok) => (
              <button key={tok}
                onClick={() => { setOperand(operandPick.condId, operandPick.side, { kind: "token", value: tok }); setOperandPick(null); }}
                className={"px-2.5 py-1.5 text-sm " + t.token}>
                {tok}
              </button>
            ))}
          </div>
          <p className={t.sectionLabel + " mb-1.5 flex items-center gap-1"}>
            <Hash size={12} /> Or a number
          </p>
          <div className="flex gap-2">
            <input type="number" value={numInput} onChange={(e) => setNumInput(e.target.value)}
              placeholder="e.g. 60" className={t.input + " flex-1"} />
            <button disabled={numInput === ""}
              onClick={() => { setOperand(operandPick.condId, operandPick.side, { kind: "number", value: numInput }); setOperandPick(null); }}
              className={"px-4 text-sm disabled:opacity-40 " + t.primaryBtn}>
              Use
            </button>
          </div>
        </Sheet>
      )}

      {cmpPick && (
        <Sheet t={t} title="Comparator" onClose={() => setCmpPick(null)}>
          <div className="grid grid-cols-3 gap-2">
            {CMPS.map((c) => (
              <button key={c}
                onClick={() => { setCmp(cmpPick, c); setCmpPick(null); }}
                className="py-3 rounded-xl border border-orange-300 bg-orange-500/10 text-orange-500 text-lg font-bold">
                {c}
              </button>
            ))}
          </div>
        </Sheet>
      )}
    </div>
  );
}
