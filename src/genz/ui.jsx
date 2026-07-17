import { useState, useEffect } from "react";
import { ChevronDown, X, Radio, Pause, FileText } from "lucide-react";

export const Field = ({ t, label, children }) => (
  <label className="block">
    <span className={"block " + t.fieldLabel}>{label}</span>
    {children}
  </label>
);

export const Select = ({ t, value, onChange, options }) => (
  <div className="relative">
    <select value={value} onChange={(e) => onChange(e.target.value)}
      className={t.input + " appearance-none pr-8"}>
      {options.map((o) => <option key={o} value={o}>{o}</option>)}
    </select>
    <ChevronDown size={15} className={"absolute right-2.5 top-3 pointer-events-none " + t.muted} />
  </div>
);

export const Toggle = ({ t, on, onChange }) => (
  <button type="button" onClick={() => onChange(!on)}
    className={"w-11 h-6 rounded-full transition-colors relative shrink-0 " +
      (on ? t.toggleOn : "bg-gray-300")}>
    <span className={"absolute top-0.5 w-5 h-5 rounded-full bg-white shadow transition-all " +
      (on ? "left-5" : "left-0.5")} />
  </button>
);

export const IconBtn = ({ t, onClick, children, danger }) => (
  <button type="button" onClick={onClick}
    className={"p-2 " + (danger
      ? "text-red-400 hover:bg-red-50 rounded-md"
      : t.ghostBtn)}>
    {children}
  </button>
);

/* Expression preview.
   Names like "RSI (14, 5)" are matched first (longest first) and
   tinted as identifiers; the rest gets operator/number/logic tints. */
const escRe = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

export const Expr = ({ t, text, tokens = [] }) => {
  if (!text) return <span className={"italic text-sm " + t.muted}>no condition — always true</span>;

  const renderPlain = (chunk, keyBase) =>
    chunk.split(/(\s+)/g).map((p, i) => {
      let c = t.body;
      if (/^(AND|OR|and|or)$/.test(p)) c = t.exprLogic;
      else if (/^[><=+\-*/]+$/.test(p)) c = t.exprOp;
      else if (/^[\d.:]+$/.test(p)) c = t.exprNum;
      return <span key={keyBase + "-" + i} className={c}>{p}</span>;
    });

  let parts = [text];
  if (tokens.length) {
    const re = new RegExp(
      "(" + [...tokens].sort((a, b) => b.length - a.length).map(escRe).join("|") + ")", "g");
    parts = text.split(re);
  }

  return (
    <span className="text-sm leading-relaxed break-words">
      {parts.map((p, i) =>
        tokens.includes(p)
          ? <span key={i} className={t.exprId}>{p}</span>
          : <span key={i}>{renderPlain(p, i)}</span>
      )}
    </span>
  );
};

export function CountUp({ value, duration = 900, prefix = "", decimals = 2 }) {
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

export function Sheet({ t, title, children, onClose }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center">
      <div className="absolute inset-0 bg-black/40" onClick={onClose} />
      <div className={"relative w-full max-w-md p-4 pb-6 max-h-[88vh] overflow-y-auto " + t.sheet}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-semibold">{title}</h3>
          <IconBtn t={t} onClick={onClose}><X size={15} /></IconBtn>
        </div>
        {children}
      </div>
    </div>
  );
}

export const StatusChip = ({ t, status }) => {
  const map = {
    LIVE: [t.chipLive, <Radio key="i" size={11} className="animate-pulse" />],
    PAUSED: [t.chipPaused, <Pause key="i" size={11} />],
    DRAFT: [t.chipDraft, <FileText key="i" size={11} />],
  };
  const [cls, icon] = map[status] || map.DRAFT;
  return (
    <span className={"inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full " + cls}>
      {icon}{status}
    </span>
  );
};

/* small labelled tag chip (SUBSCRIBED / WATCHLIST / PUBLISHED …) */
export const Tag = ({ t, children, tone = "default" }) => {
  const tones = {
    default: t.chipDraft,
    accent: t.token,
    green: t.chipLive,
    amber: t.chipPaused,
  };
  return (
    <span className={"inline-flex items-center gap-1 text-[10px] font-semibold px-1.5 py-0.5 rounded " + tones[tone]}>
      {children}
    </span>
  );
};

/* bottom action sheet for ⋮ menus: items = [{icon, label, onClick, danger, disabled}] */
export function ActionSheet({ t, title, items, onClose }) {
  return (
    <Sheet t={t} title={title} onClose={onClose}>
      <div className="space-y-1.5">
        {items.map(({ icon: Icon, label, onClick, danger, disabled }) => (
          <button key={label} disabled={disabled}
            onClick={() => { onClose(); onClick && onClick(); }}
            className={"w-full flex items-center gap-3 px-3 py-3 text-left text-sm " +
              t.rowItem + " " +
              (disabled ? "opacity-40" : danger ? "text-red-500" : "")}>
            {Icon && <Icon size={17} className={danger ? "text-red-400" : t.muted} />}
            <span className="font-medium">{label}</span>
          </button>
        ))}
      </div>
    </Sheet>
  );
}

/* auto-dismissing toast, rendered by the app shell */
export function Toast({ t, toast }) {
  if (!toast) return null;
  return (
    <div className="fixed top-4 left-1/2 -translate-x-1/2 z-[60] w-[calc(100%-2rem)] max-w-sm">
      <div className={"px-4 py-3 rounded-xl text-sm font-medium shadow-lg flex items-center gap-2 " + t.banner}>
        <span className="flex-1">{toast}</span>
      </div>
    </div>
  );
}
