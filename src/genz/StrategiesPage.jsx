import { useState } from "react";
import {
  Plus, Info, ChevronRight, Pencil, MoreVertical,
  Pause, Radio, FlaskConical, Store, Trash2,
} from "lucide-react";
import { Sheet, StatusChip, Tag, ActionSheet, OpenPositions } from "./ui";
import { fmtInr, openPositionsFor } from "./data";
import ConfigSummary from "./ConfigSummary";

const FILTERS = ["ALL", "LIVE", "PAUSED", "DRAFT"];

/* status-appropriate ⋮ actions for a strategy card */
const menuItems = (s, act) => {
  const items = [];
  if (s.status === "LIVE") items.push({ icon: Pause, label: "Pause", onClick: () => act.pause(s) });
  else items.push({ icon: Radio, label: "Go live", onClick: () => act.goLive(s) });

  items.push({
    icon: FlaskConical,
    label: s.watchlist ? "Remove from papertrade" : "Add to papertrade",
    onClick: () => act.toggleWatchlist(s),
  });
  /* subscribed (marketplace-origin) strategies can't be re-published */
  if (!s.subscribed) {
    items.push({
      icon: Store,
      label: s.published ? "Published to marketplace" : "Publish to marketplace",
      disabled: s.published,
      onClick: () => act.publish(s),
    });
  }
  items.push({ icon: Trash2, label: "Delete strategy", danger: true, onClick: () => act.remove(s) });
  return items;
};

export default function StrategiesPage({ t, strategies, onOpen, onEdit, onNew, actions }) {
  const [filter, setFilter] = useState("ALL");
  const [details, setDetails] = useState(null);
  const [menuFor, setMenuFor] = useState(null);

  const shown = strategies.filter((s) => filter === "ALL" || s.status === filter);
  const count = (f) => strategies.filter((s) => f === "ALL" || s.status === f).length;

  return (
    <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
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
            <div className="flex items-start p-4 pb-0 gap-2">
              <button onClick={() => onOpen(s)} className="flex-1 min-w-0 text-left">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-base font-semibold">{s.name}</span>
                  <StatusChip t={t} status={s.status} />
                  <ChevronRight size={15} className={t.muted} />
                </div>
                <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                  {s.subscribed && <Tag t={t} tone="green">SUBSCRIBED</Tag>}
                  {s.watchlist && <Tag t={t} tone="accent">PAPERTRADE</Tag>}
                  {s.published && <Tag t={t} tone="amber">PUBLISHED</Tag>}
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
                {s.status === "LIVE" && (
                  <OpenPositions t={t} positions={openPositionsFor(s)} />
                )}
              </button>
              <button onClick={() => setMenuFor(s)} className={"p-1.5 rounded-lg " + t.ghostBtn}>
                <MoreVertical size={16} />
              </button>
            </div>

            {/* card footer actions */}
            <div className="flex items-center gap-2 px-4 py-3">
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

      {/* ⋮ menu */}
      {menuFor && (
        <ActionSheet t={t} title={menuFor.name}
          items={menuItems(menuFor, actions)} onClose={() => setMenuFor(null)} />
      )}

      {/* ⓘ details sheet */}
      {details && (
        <Sheet t={t} title={details.name + " — configuration"} onClose={() => setDetails(null)}>
          <div className="flex items-center gap-2 mb-3 flex-wrap">
            <StatusChip t={t} status={details.status} />
            {details.subscribed && <Tag t={t} tone="green">SUBSCRIBED</Tag>}
            {details.watchlist && <Tag t={t} tone="accent">PAPERTRADE</Tag>}
            {details.published && <Tag t={t} tone="amber">PUBLISHED</Tag>}
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
