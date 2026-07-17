import { useState, useEffect } from "react";
import {
  MoreVertical, Play, Square, Radio, Trash2, FlaskConical, Info,
} from "lucide-react";
import { ActionSheet, Sheet, StatusChip, Tag } from "./ui";
import { fmtInr } from "./data";
import ConfigSummary from "./ConfigSummary";

/* fake live PnL that drifts while papertrade is running */
function LivePnl({ base }) {
  const [v, setV] = useState(base);
  useEffect(() => {
    const id = setInterval(() => {
      setV((x) => +(x + (Math.random() - 0.42) * 120).toFixed(2));
    }, 1400);
    return () => clearInterval(id);
  }, []);
  return (
    <span className={"text-lg font-bold tabular-nums " + (v >= 0 ? "text-emerald-600" : "text-rose-500")}>
      {fmtInr(v)}
    </span>
  );
}

function PaperCard({ t, s, onTogglePaper, onGoLive, onRemove }) {
  const [menu, setMenu] = useState(false);
  const [details, setDetails] = useState(false);
  const nPos = s.blocks.reduce((a, b) => a + b.positions.length, 0);

  return (
    <div className={"p-4 " + t.card}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-base font-semibold">{s.name}</span>
            <StatusChip t={t} status={s.status} />
            {s.subscribed && <Tag t={t} tone="green">SUBSCRIBED</Tag>}
          </div>
          <p className={"text-xs mt-1 " + t.muted}>
            {s.index} · {s.blocks.length} block · {nPos} position
          </p>
        </div>
        <button onClick={() => setMenu(true)} className={"p-1.5 rounded-lg " + t.ghostBtn}>
          <MoreVertical size={16} />
        </button>
      </div>

      <div className="flex items-center justify-between mt-3">
        {s.paperRunning ? (
          <>
            <span className="flex items-center gap-1.5 text-xs font-semibold text-emerald-600">
              <Radio size={13} className="animate-pulse" /> Paper trading live
            </span>
            <LivePnl base={s.pnl ?? 0} />
          </>
        ) : (
          <>
            <span className={"text-xs " + t.muted}>Paper trade not started</span>
            <button onClick={() => onTogglePaper(s)}
              className={"flex items-center gap-1.5 text-xs px-3 py-2 " + t.primaryBtn}>
              <Play size={12} fill="currentColor" /> Start papertrade
            </button>
          </>
        )}
      </div>

      {menu && (
        <ActionSheet t={t} title={s.name} onClose={() => setMenu(false)}
          items={[
            s.paperRunning
              ? { icon: Square, label: "Stop papertrade", onClick: () => onTogglePaper(s) }
              : { icon: Play, label: "Start papertrade", onClick: () => onTogglePaper(s) },
            { icon: Radio, label: "Go to live", disabled: s.status === "LIVE", onClick: () => onGoLive(s) },
            { icon: Info, label: "Details", onClick: () => setDetails(true) },
            { icon: Trash2, label: "Remove from papertrade", danger: true, onClick: () => onRemove(s) },
          ]} />
      )}

      {details && (
        <Sheet t={t} title={s.name + " — configuration"} onClose={() => setDetails(false)}>
          <ConfigSummary t={t} blocks={s.blocks} tokens={s.tokens || []} />
        </Sheet>
      )}
    </div>
  );
}

export default function PapertradePage({ t, strategies, onTogglePaper, onGoLive, onRemove }) {
  const list = strategies.filter((s) => s.watchlist);
  return (
    <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-3">
      {list.length === 0 && (
        <div className={"p-8 text-center " + t.card}>
          <FlaskConical size={28} className={"mx-auto mb-2 " + t.muted} />
          <p className="text-sm font-medium">Nothing in papertrade yet</p>
          <p className={"text-xs mt-1 " + t.muted}>
            Add strategies here from My Strategies (⋮ → Add to papertrade)
            or subscribe from the Marketplace.
          </p>
        </div>
      )}
      {list.map((s) => (
        <PaperCard key={s.id} t={t} s={s}
          onTogglePaper={onTogglePaper} onGoLive={onGoLive} onRemove={onRemove} />
      ))}
    </main>
  );
}
