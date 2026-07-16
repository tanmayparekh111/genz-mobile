import { useState } from "react";
import { Plus, Info, ChevronRight, Pencil } from "lucide-react";
import { Sheet, StatusChip } from "./ui";
import { fmtInr } from "./data";
import ConfigSummary from "./ConfigSummary";

const FILTERS = ["ALL", "LIVE", "PAUSED", "DRAFT"];

export default function StrategiesPage({ t, strategies, onOpen, onEdit, onNew }) {
  const [filter, setFilter] = useState("ALL");
  const [details, setDetails] = useState(null); // strategy shown in the ⓘ sheet

  const shown = strategies.filter((s) => filter === "ALL" || s.status === filter);
  const count = (f) => strategies.filter((s) => f === "ALL" || s.status === f).length;

  return (
    <main className="flex-1 overflow-y-auto p-4 pb-28 space-y-4">
      {/* status filter pills */}
      <div className={"flex " + t.tabWrap}>
        {FILTERS.map((f) => (
          <button key={f} onClick={() => setFilter(f)}
            className={"flex-1 py-2 text-sm transition-colors " + (filter === f ? t.tabOn : t.tabOff)}>
            {f.charAt(0) + f.slice(1).toLowerCase()}
            <span className={"ml-1 text-[11px] " + t.muted}>{count(f)}</span>
          </button>
        ))}
      </div>

      {shown.length === 0 && (
        <p className={"text-sm text-center py-10 " + t.muted}>
          No {filter.toLowerCase()} strategies yet.
        </p>
      )}

      {/* strategy cards */}
      {shown.map((s) => {
        const nPos = s.blocks.reduce((a, b) => a + b.positions.length, 0);
        return (
          <div key={s.id} className={t.card + " overflow-hidden"}>
            <button onClick={() => onOpen(s)} className="w-full text-left p-4">
              <div className="flex items-center gap-2">
                <span className="text-base font-semibold flex-1">{s.name}</span>
                <StatusChip t={t} status={s.status} />
                <ChevronRight size={16} className={t.muted} />
              </div>
              <p className={"text-xs mt-1.5 " + t.muted}>
                {s.index} · {s.blocks.length} block · {nPos} position · updated {s.updated}
              </p>
              {s.pnl !== null && s.pnl !== undefined && (
                <p className={"text-sm font-semibold mt-1.5 " +
                  (s.pnl >= 0 ? "text-emerald-600" : "text-rose-500")}>
                  {s.pnl >= 0 ? "▲ " : "▼ "}{fmtInr(s.pnl)}
                  <span className={"font-normal text-xs ml-1 " + t.muted}>total PnL</span>
                </p>
              )}
            </button>

            {/* card footer actions */}
            <div className={"flex items-center gap-2 px-4 pb-3"}>
              <button onClick={() => setDetails(s)}
                className={"flex items-center gap-1.5 text-xs px-3 py-1.5 " + t.ghostBtn}>
                <Info size={13} /> Details
              </button>
              <button onClick={() => onEdit(s)}
                className={"flex items-center gap-1.5 text-xs px-3 py-1.5 " + t.ghostBtn}>
                <Pencil size={12} /> Edit
              </button>
              <span className={"ml-auto text-xs " + t.muted}>Tap card for results</span>
            </div>
          </div>
        );
      })}

      {/* new strategy */}
      <button onClick={onNew}
        className={"w-full py-3.5 text-sm flex items-center justify-center gap-1.5 " + t.dashed}>
        <Plus size={16} /> Create new strategy
      </button>

      {/* ⓘ details sheet: full config of blocks + positions */}
      {details && (
        <Sheet t={t} title={details.name + " — configuration"} onClose={() => setDetails(null)}>
          <div className="flex items-center gap-2 mb-3">
            <StatusChip t={t} status={details.status} />
            <span className={"text-xs " + t.muted}>{details.index} · updated {details.updated}</span>
          </div>
          <ConfigSummary t={t} blocks={details.blocks} tokens={details.tokens || []} />
          <div className="flex gap-2 mt-4">
            <button onClick={() => { setDetails(null); onEdit(details); }}
              className={"flex-1 py-2.5 text-sm " + t.ghostBtn}>
              Edit strategy
            </button>
            <button onClick={() => { setDetails(null); onOpen(details); }}
              className={"flex-1 py-2.5 text-sm " + t.primaryBtn}>
              View results
            </button>
          </div>
        </Sheet>
      )}
    </main>
  );
}
