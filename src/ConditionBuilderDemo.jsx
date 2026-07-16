import { useState } from "react";
import {
  Plus, X, Check, Pencil, ChevronRight, Hash, Activity,
  AlertCircle, Sparkles, Braces, Equal
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════
   CONDITION BUILDER — interactive concept demo
   ---------------------------------------------------------
   Preview it by pointing src/App.jsx to this file temporarily:
      import StrategyBuilder from './ConditionBuilderDemo'
   ---------------------------------------------------------
   The idea:
   • Empty box → [+ Add] → choose "Default pattern" (one only)
     or "Manual condition"
   • Manual → tree of CONDITIONS and GROUPS
       condition =  [lhs] [cmp] [rhs]
       group     =  ( children... ) with its own add buttons
   • Every element after the first is connected with an AND/OR
     chip — tap the chip to toggle
   • Operands: tap → sheet listing YOUR defined indicators &
     prices, or type a number
   • Live text preview generated from the tree
   • Validation runs on Save
   ═══════════════════════════════════════════════════════════ */

/* tokens the user already defined in Setup (demo data) */
const TOKENS = [
  "RSI (14, 5)", "EMA (20, 5)", "EMA (50, 5)", "Supertrend (5)",
  "Close (5)", "Open (5)", "Prev Close (5)", "Prev High (15)",
];
const PATTERNS = [
  "Bullish Engulfing (5)", "Bearish Engulfing (5)", "Doji (5)",
  "Hammer (5)", "Shooting Star (5)", "Marubozu (5)",
];
const CMPS = [">", "<", ">=", "<=", "=", "!="];

let _id = 1;
const uid = () => ++_id;

/* ── tree model ────────────────────────────────────────────
   group:     { id, type:'group', children:[node] }
   condition: { id, type:'cond', lhs, cmp, rhs }
   operand:   { kind:'token'|'number'|null, value }
   every non-first child carries join:'AND'|'OR'              */

const newCond = (join) => ({
  id: uid(), type: "cond", join,
  lhs: { kind: null, value: "" }, cmp: ">", rhs: { kind: null, value: "" },
});
const newGroup = (join) => ({ id: uid(), type: "group", join, children: [newCond()] });

/* immutable helpers */
const mapTree = (node, fn) => {
  const n = fn(node);
  if (n.type === "group") return { ...n, children: n.children.map((c) => mapTree(c, fn)) };
  return n;
};
const removeById = (node, id) => {
  if (node.type !== "group") return node;
  const children = node.children
    .filter((c) => c.id !== id)
    .map((c) => removeById(c, id));
  return { ...node, children: children.map((c, i) => (i === 0 ? { ...c, join: undefined } : { ...c, join: c.join || "AND" })) };
};

/* tree → text */
const opText = (o) => (o.kind ? String(o.value) : "…");
const toText = (node, isRoot = false) => {
  if (node.type === "cond") return `${opText(node.lhs)} ${node.cmp} ${opText(node.rhs)}`;
  const inner = node.children
    .map((c, i) => (i === 0 ? "" : ` ${c.join} `) + toText(c))
    .join("");
  return isRoot ? inner : `(${inner})`;
};

/* validation */
const validate = (node, errs = []) => {
  if (node.type === "cond") {
    if (!node.lhs.kind || !node.rhs.kind) errs.push("A condition is missing an operand (tap the dotted chips).");
    if (node.lhs.kind === "number" && node.rhs.kind === "number")
      errs.push(`"${opText(node.lhs)} ${node.cmp} ${opText(node.rhs)}" compares two plain numbers — use at least one indicator/price.`);
  } else {
    if (node.children.length === 0) errs.push("A group is empty — add a condition or remove the group.");
    node.children.forEach((c) => validate(c, errs));
  }
  return errs;
};

/* ── little UI atoms ─────────────────────────────────────── */

const chipBase = "inline-flex items-center gap-1 rounded-lg text-sm px-2.5 py-1.5 border transition-colors";

function OperandChip({ operand, onClick }) {
  const empty = !operand.kind;
  return (
    <button onClick={onClick}
      className={chipBase + " " + (empty
        ? "border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500"
        : operand.kind === "number"
          ? "border-amber-200 bg-amber-50 text-amber-700 font-semibold"
          : "border-blue-200 bg-blue-50 text-blue-700 font-medium")}>
      {empty ? <>select <ChevronRight size={13} /></> : operand.value}
    </button>
  );
}

function CmpChip({ value, onClick }) {
  return (
    <button onClick={onClick}
      className={chipBase + " border-orange-200 bg-orange-50 text-orange-600 font-bold min-w-10 justify-center"}>
      {value}
    </button>
  );
}

function JoinChip({ value, onToggle }) {
  return (
    <button onClick={onToggle}
      className={"self-start text-[11px] font-bold tracking-wide px-2.5 py-1 rounded-full border my-1 " +
        (value === "AND"
          ? "bg-emerald-50 text-emerald-600 border-emerald-200"
          : "bg-violet-50 text-violet-600 border-violet-200")}>
      {value} <span className="opacity-50 font-normal">⇄</span>
    </button>
  );
}

/* ── condition row ───────────────────────────────────────── */

function ConditionRow({ node, onPick, onCmp, onDelete }) {
  return (
    <div className="flex items-center gap-1.5 flex-wrap bg-white border border-gray-200 rounded-xl p-2 shadow-sm">
      <OperandChip operand={node.lhs} onClick={() => onPick(node.id, "lhs")} />
      <CmpChip value={node.cmp} onClick={() => onCmp(node.id)} />
      <OperandChip operand={node.rhs} onClick={() => onPick(node.id, "rhs")} />
      <button onClick={() => onDelete(node.id)}
        className="ml-auto p-1.5 rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50">
        <X size={14} />
      </button>
    </div>
  );
}

/* ── group (recursive) ───────────────────────────────────── */

function Group({ node, depth, onPick, onCmp, onDelete, onAdd, onToggleJoin }) {
  const tint = ["border-blue-200 bg-blue-50/40", "border-violet-200 bg-violet-50/40",
    "border-teal-200 bg-teal-50/40"][depth % 3];
  return (
    <div className={"rounded-2xl border-2 border-dashed p-2.5 " + tint}>
      <div className="flex items-center justify-between mb-1.5 px-0.5">
        <span className="text-[11px] font-bold text-gray-400 tracking-widest">( GROUP</span>
        <button onClick={() => onDelete(node.id)}
          className="p-1 rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50">
          <X size={13} />
        </button>
      </div>

      <div className="space-y-1">
        {node.children.map((c, i) => (
          <div key={c.id}>
            {i > 0 && <JoinChip value={c.join} onToggle={() => onToggleJoin(c.id)} />}
            {c.type === "cond"
              ? <ConditionRow node={c} onPick={onPick} onCmp={onCmp} onDelete={onDelete} />
              : <Group node={c} depth={depth + 1} onPick={onPick} onCmp={onCmp}
                  onDelete={onDelete} onAdd={onAdd} onToggleJoin={onToggleJoin} />}
          </div>
        ))}
      </div>

      <div className="flex gap-1.5 mt-2">
        <button onClick={() => onAdd(node.id, "cond")}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600">
          <Plus size={12} /> Condition
        </button>
        <button onClick={() => onAdd(node.id, "group")}
          className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded-lg border border-gray-300 bg-white text-gray-600 hover:border-violet-400 hover:text-violet-600">
          <Braces size={12} /> Group
        </button>
        <span className="ml-auto text-[11px] font-bold text-gray-400 tracking-widest self-end">)</span>
      </div>
    </div>
  );
}

/* ── bottom sheet ────────────────────────────────────────── */

function DemoSheet({ title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className="relative w-full max-w-md bg-white rounded-t-2xl p-4 pb-6 max-h-[80vh] overflow-y-auto">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-base font-semibold text-gray-800">{title}</h3>
          <button onClick={onClose} className="p-1.5 rounded-md border border-gray-200 text-gray-400"><X size={14} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

/* ── main demo ───────────────────────────────────────────── */

export default function ConditionBuilderDemo() {
  /* block name is editable too */
  const [blockName, setBlockName] = useState("Block 01");
  const [editingName, setEditingName] = useState(false);

  /* mode: null (empty) | 'pattern' | 'manual' */
  const [mode, setMode] = useState(null);
  const [pattern, setPattern] = useState(null);
  const [tree, setTree] = useState({ id: 0, type: "group", children: [] });

  /* sheets */
  const [chooser, setChooser] = useState(false);       // add: pattern vs manual
  const [patternSheet, setPatternSheet] = useState(false);
  const [operandPick, setOperandPick] = useState(null); // {condId, side}
  const [numInput, setNumInput] = useState("");
  const [cmpPick, setCmpPick] = useState(null);         // condId
  const [saveState, setSaveState] = useState(null);     // {ok, errors}

  /* tree ops */
  const addTo = (groupId, kind) =>
    setTree((t) => mapTree(t, (n) =>
      n.id === groupId && n.type === "group"
        ? { ...n, children: [...n.children, kind === "cond" ? newCond(n.children.length ? "AND" : undefined) : newGroup(n.children.length ? "AND" : undefined)] }
        : n));
  const del = (id) => setTree((t) => removeById(t, id));
  const toggleJoin = (id) =>
    setTree((t) => mapTree(t, (n) => n.id === id ? { ...n, join: n.join === "AND" ? "OR" : "AND" } : n));
  const setCmp = (id, cmp) =>
    setTree((t) => mapTree(t, (n) => n.id === id ? { ...n, cmp } : n));
  const setOperand = (id, side, operand) =>
    setTree((t) => mapTree(t, (n) => n.id === id ? { ...n, [side]: operand } : n));

  const startManual = () => {
    setMode("manual");
    setTree({ id: 0, type: "group", children: [newCond()] });
    setChooser(false);
  };
  const clearAll = () => {
    setMode(null); setPattern(null); setSaveState(null);
    setTree({ id: 0, type: "group", children: [] });
  };

  const save = () => {
    if (mode === "pattern") { setSaveState({ ok: true }); return; }
    const errors = validate(tree);
    if (tree.children.length === 0) errors.push("Condition box is empty.");
    setSaveState(errors.length ? { ok: false, errors } : { ok: true });
  };

  const text = mode === "pattern" ? pattern : toText(tree, true);

  return (
    <div className="min-h-screen bg-gray-100 flex justify-center" style={{ fontFamily: "'Inter', system-ui, sans-serif" }}>
      <div className="w-full max-w-md min-h-screen bg-gray-100 p-4 space-y-4">

        <p className="text-[11px] uppercase tracking-widest font-semibold text-blue-600">
          GenZ · Condition builder concept
        </p>

        {/* ── block header with editable name ── */}
        <div className="bg-white rounded-2xl border border-gray-200 shadow-sm p-4">
          <div className="flex items-center gap-2">
            {editingName ? (
              <input autoFocus value={blockName}
                onChange={(e) => setBlockName(e.target.value)}
                onBlur={() => setEditingName(false)}
                onKeyDown={(e) => e.key === "Enter" && setEditingName(false)}
                className="text-lg font-semibold bg-blue-50 border border-blue-200 rounded-lg px-2 py-1 flex-1 focus:outline-none" />
            ) : (
              <>
                <h2 className="text-lg font-semibold text-gray-800">{blockName}</h2>
                <button onClick={() => setEditingName(true)}
                  className="p-1.5 rounded-md text-gray-400 hover:text-blue-600 hover:bg-blue-50">
                  <Pencil size={14} />
                </button>
              </>
            )}
            <span className="ml-auto text-xs text-gray-400">entry · 5m</span>
          </div>

          {/* ── the condition box ── */}
          <div className="mt-3 rounded-2xl border border-gray-200 bg-gray-50 p-3">
            <p className="text-[11px] uppercase tracking-widest text-gray-400 font-medium mb-2">
              Entry condition
            </p>

            {/* empty state */}
            {mode === null && (
              <button onClick={() => setChooser(true)}
                className="w-full py-8 rounded-xl border-2 border-dashed border-gray-300 text-gray-400 hover:border-blue-400 hover:text-blue-500 flex flex-col items-center gap-1.5">
                <Plus size={22} />
                <span className="text-sm font-medium">Add condition</span>
              </button>
            )}

            {/* pattern mode: exactly one pattern chip */}
            {mode === "pattern" && (
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1.5 rounded-xl bg-violet-50 border border-violet-200 text-violet-700 text-sm font-medium px-3 py-2">
                  <Sparkles size={14} /> {pattern}
                </span>
                <button onClick={clearAll}
                  className="p-1.5 rounded-md text-gray-300 hover:text-red-400 hover:bg-red-50">
                  <X size={15} />
                </button>
                <span className="text-[11px] text-gray-400 ml-auto">patterns: max 1</span>
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
                        ? <ConditionRow node={c}
                            onPick={(id, side) => { setOperandPick({ condId: id, side }); setNumInput(""); }}
                            onCmp={(id) => setCmpPick(id)} onDelete={del} />
                        : <Group node={c} depth={0}
                            onPick={(id, side) => { setOperandPick({ condId: id, side }); setNumInput(""); }}
                            onCmp={(id) => setCmpPick(id)} onDelete={del}
                            onAdd={addTo} onToggleJoin={toggleJoin} />}
                    </div>
                  ))}
                </div>
                <div className="flex gap-1.5 mt-2.5">
                  <button onClick={() => addTo(0, "cond")}
                    className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:border-blue-400 hover:text-blue-600">
                    <Plus size={13} /> Condition
                  </button>
                  <button onClick={() => addTo(0, "group")}
                    className="flex items-center gap-1 text-xs px-3 py-2 rounded-lg border border-gray-300 bg-white text-gray-600 hover:border-violet-400 hover:text-violet-600">
                    <Braces size={13} /> Group
                  </button>
                  <button onClick={clearAll}
                    className="ml-auto text-xs px-3 py-2 rounded-lg text-gray-400 hover:text-red-400">
                    Clear
                  </button>
                </div>
              </>
            )}
          </div>

          {/* ── live text preview ── */}
          {mode !== null && (
            <div className="mt-3 rounded-xl bg-slate-900 p-3">
              <p className="text-[10px] uppercase tracking-widest text-slate-500 mb-1">Preview</p>
              <p className="text-sm text-emerald-300 leading-relaxed break-words">
                {text || <span className="text-slate-600 italic">…</span>}
              </p>
            </div>
          )}

          {/* ── save + validation ── */}
          {mode !== null && (
            <>
              <button onClick={save}
                className="mt-3 w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium flex items-center justify-center gap-1.5">
                <Check size={15} /> Save condition
              </button>
              {saveState?.ok && (
                <p className="mt-2 text-sm text-emerald-600 flex items-center gap-1.5">
                  <Check size={14} /> Valid — saved.
                </p>
              )}
              {saveState && !saveState.ok && (
                <div className="mt-2 rounded-xl bg-red-50 border border-red-200 p-3 space-y-1">
                  {saveState.errors.map((e, i) => (
                    <p key={i} className="text-xs text-red-600 flex items-start gap-1.5">
                      <AlertCircle size={13} className="mt-0.5 shrink-0" /> {e}
                    </p>
                  ))}
                </div>
              )}
            </>
          )}
        </div>

        <p className="text-xs text-gray-400 px-1 leading-relaxed">
          Try it: Add → Manual → build <b>(a &gt; b) OR (c &gt; d AND e &lt; f)</b> using
          Condition/Group buttons, tap the AND/OR chips to flip them, tap dotted chips to pick
          operands, tap the orange comparator to change it, then Save to see validation.
        </p>

        {/* ═ sheets ═ */}

        {chooser && (
          <DemoSheet title="Add to condition box" onClose={() => setChooser(false)}>
            <div className="space-y-2">
              <button onClick={() => { setChooser(false); setPatternSheet(true); }}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-violet-400 text-left">
                <span className="p-2 rounded-lg bg-violet-50 text-violet-600"><Sparkles size={18} /></span>
                <span>
                  <span className="block text-sm font-semibold text-gray-800">Default pattern</span>
                  <span className="block text-xs text-gray-400">Pick one ready-made candle pattern (only one allowed)</span>
                </span>
              </button>
              <button onClick={startManual}
                className="w-full flex items-center gap-3 p-3.5 rounded-xl border border-gray-200 hover:border-blue-400 text-left">
                <span className="p-2 rounded-lg bg-blue-50 text-blue-600"><Braces size={18} /></span>
                <span>
                  <span className="block text-sm font-semibold text-gray-800">Manual condition</span>
                  <span className="block text-xs text-gray-400">Build your own with conditions, groups and AND/OR</span>
                </span>
              </button>
            </div>
          </DemoSheet>
        )}

        {patternSheet && (
          <DemoSheet title="Choose a pattern" onClose={() => setPatternSheet(false)}>
            <div className="space-y-1.5">
              {PATTERNS.map((p) => (
                <button key={p}
                  onClick={() => { setPattern(p); setMode("pattern"); setPatternSheet(false); setSaveState(null); }}
                  className="w-full flex items-center justify-between px-3 py-2.5 rounded-xl bg-gray-50 border border-gray-200 hover:border-violet-400 text-left">
                  <span className="text-sm text-gray-700">{p}</span>
                  <Sparkles size={13} className="text-violet-400" />
                </button>
              ))}
            </div>
          </DemoSheet>
        )}

        {operandPick && (
          <DemoSheet title="Pick indicator / price — or type a number" onClose={() => setOperandPick(null)}>
            <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-1.5 flex items-center gap-1">
              <Activity size={12} /> Your indicators & prices
            </p>
            <div className="flex flex-wrap gap-1.5 mb-4">
              {TOKENS.map((tok) => (
                <button key={tok}
                  onClick={() => { setOperand(operandPick.condId, operandPick.side, { kind: "token", value: tok }); setOperandPick(null); setSaveState(null); }}
                  className="px-2.5 py-1.5 rounded-lg bg-blue-50 border border-blue-100 text-blue-700 text-sm">
                  {tok}
                </button>
              ))}
            </div>
            <p className="text-[11px] uppercase tracking-widest text-gray-400 mb-1.5 flex items-center gap-1">
              <Hash size={12} /> Or a number
            </p>
            <div className="flex gap-2">
              <input type="number" value={numInput} onChange={(e) => setNumInput(e.target.value)}
                placeholder="e.g. 60"
                className="flex-1 bg-white border border-gray-300 rounded-lg px-3 py-2.5 text-base focus:outline-none focus:border-amber-400" />
              <button disabled={numInput === ""}
                onClick={() => { setOperand(operandPick.condId, operandPick.side, { kind: "number", value: numInput }); setOperandPick(null); setSaveState(null); }}
                className="px-4 rounded-lg bg-amber-500 text-white text-sm font-medium disabled:opacity-40">
                Use
              </button>
            </div>
          </DemoSheet>
        )}

        {cmpPick && (
          <DemoSheet title="Comparator" onClose={() => setCmpPick(null)}>
            <div className="grid grid-cols-3 gap-2">
              {CMPS.map((c) => (
                <button key={c}
                  onClick={() => { setCmp(cmpPick, c); setCmpPick(null); setSaveState(null); }}
                  className="py-3 rounded-xl border border-orange-200 bg-orange-50 text-orange-600 text-lg font-bold hover:border-orange-400">
                  {c}
                </button>
              ))}
            </div>
          </DemoSheet>
        )}
      </div>
    </div>
  );
}
