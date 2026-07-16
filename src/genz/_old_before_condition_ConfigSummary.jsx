import { Clock } from "lucide-react";
import { Expr } from "./ui";
import { positionSummary } from "./data";

/* Compact read-only view of a strategy's blocks:
   entry/exit conditions with timeframes + each position summary.
   Used in: (1) the ⓘ details sheet on strategy cards,
            (2) the Run-Backtest sheet below the date/time inputs. */
export default function ConfigSummary({ t, blocks, tokens = [] }) {
  return (
    <div className="space-y-3">
      {blocks.map((b) => (
        <div key={b.id} className={"p-3 " + t.innerCard}>
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm font-semibold">{b.name}</p>
            <span className={"flex items-center gap-1 text-[11px] " + t.muted}>
              <Clock size={11} /> entry {b.entryTf} · exit {b.exitTf}
            </span>
          </div>

          <div className="space-y-2">
            <div>
              <p className={t.sectionLabel}>Entry</p>
              <Expr t={t} text={b.entry} tokens={tokens} />
            </div>
            <div>
              <p className={t.sectionLabel}>Exit</p>
              <Expr t={t} text={b.exit} tokens={tokens} />
            </div>
          </div>

          <div className="mt-3 space-y-1.5">
            {b.positions.map((p) => (
              <div key={p.id} className={"px-2.5 py-2 " + t.rowItem}>
                <div className="flex items-center gap-2">
                  <span className={"text-[11px] font-semibold px-1.5 py-0.5 rounded " +
                    (p.side === "SELL" ? t.chipSell : t.chipBuy)}>
                    {p.side} {p.optionType}
                  </span>
                  <span className="text-sm font-medium">{p.name}</span>
                </div>
                <p className={"text-xs mt-1 " + t.muted}>{positionSummary(p)}</p>
                {(p.trailOn || p.momentumOn || p.reSlType !== "NONE" || p.reTgtType !== "NONE") && (
                  <p className={"text-[11px] mt-0.5 " + t.muted}>
                    {p.trailOn && `Trail ${p.trailX}:${p.trailY} ${p.trailUnit.toLowerCase()} · `}
                    {p.momentumOn && `Momentum ${p.momentumType.toLowerCase()} ${p.momentumValue} · `}
                    {p.reSlType !== "NONE" && `Re-entry SL ${p.reSlType}×${p.reSlCount} · `}
                    {p.reTgtType !== "NONE" && `Re-entry T ${p.reTgtType}×${p.reTgtCount}`}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
