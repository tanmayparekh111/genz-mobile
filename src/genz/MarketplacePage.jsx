import { useState } from "react";
import {
  MoreVertical, TrendingUp, TrendingDown, Newspaper, Sparkles,
  Users, Download, Info, Globe2, MapPin, BadgeCheck,
} from "lucide-react";
import { ActionSheet, Sheet, Tag } from "./ui";
import {
  INDIA_INDICES, GLOBAL_INDICES, NIFTY_PULLERS, NIFTY_DRAGGERS, MARKET_NEWS,
} from "./data";
import ConfigSummary from "./ConfigSummary";

const Pct = ({ v }) => (
  <span className={"inline-flex items-center gap-0.5 text-xs font-semibold " +
    (v >= 0 ? "text-emerald-600" : "text-rose-500")}>
    {v >= 0 ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
    {v >= 0 ? "+" : ""}{v.toFixed(2)}%
  </span>
);

function IndexTiles({ t }) {
  const [region, setRegion] = useState("india");
  const list = region === "india" ? INDIA_INDICES : GLOBAL_INDICES;
  return (
    <section className={"p-4 " + t.card}>
      <div className="flex items-center justify-between mb-3">
        <p className={t.sectionLabel}>Market overview</p>
        <div className={"flex " + t.tabWrap} style={{ padding: 2 }}>
          {[["india", "India", MapPin], ["global", "Global", Globe2]].map(([id, label, Icon]) => (
            <button key={id} onClick={() => setRegion(id)}
              className={"flex items-center gap-1 px-3 py-1 text-xs " +
                (region === id ? t.tabOn : t.tabOff)}>
              <Icon size={12} /> {label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {list.map((ix) => (
          <div key={ix.name} className={"px-3 py-2.5 " + t.rowItem}>
            <p className={"text-[11px] font-medium " + t.muted}>{ix.name}</p>
            <p className="text-[15px] font-semibold mt-0.5">{ix.price}</p>
            <Pct v={ix.chg} />
          </div>
        ))}
      </div>
    </section>
  );
}

function MoversRow({ t, label, list, positive }) {
  return (
    <div>
      <p className={t.sectionLabel + " mb-1.5"}>{label}</p>
      <div className="flex gap-2 overflow-x-auto pb-1">
        {list.map((s) => (
          <div key={s.sym}
            className={"shrink-0 px-3 py-2 rounded-xl border " +
              (positive
                ? "bg-emerald-500/5 border-emerald-300/50"
                : "bg-rose-500/5 border-rose-300/50")}>
            <p className="text-sm font-semibold">{s.sym}</p>
            <Pct v={s.chg} />
          </div>
        ))}
      </div>
    </div>
  );
}

function MarketStrategyCard({ t, s, onSubscribe, subscribedIds }) {
  const [menu, setMenu] = useState(false);
  const [details, setDetails] = useState(false);
  const isSubscribed = subscribedIds.has(s.id);

  return (
    <div className={"p-4 " + t.card}>
      <div className="flex items-start gap-2">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-base font-semibold">{s.name}</span>
            {s.featured && (
              <span className="inline-flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded bg-violet-500/10 text-violet-500">
                <Sparkles size={10} /> FEATURED
              </span>
            )}
          </div>
          <p className={"text-xs mt-0.5 flex items-center gap-1 " + t.muted}>
            <BadgeCheck size={12} className={s.featured ? t.linkAccent : t.muted} />
            {s.author}
          </p>
        </div>
        <button onClick={() => setMenu(true)} className={"p-1.5 rounded-lg " + t.ghostBtn}>
          <MoreVertical size={16} />
        </button>
      </div>

      <p className={"text-sm mt-2 " + t.body}>{s.desc}</p>

      <div className="flex items-center gap-2 mt-2.5 flex-wrap">
        {s.tagsList.map((tag) => <Tag key={tag} t={t} tone="accent">{tag}</Tag>)}
        {isSubscribed && <Tag t={t} tone="green">SUBSCRIBED</Tag>}
        <span className={"ml-auto text-xs flex items-center gap-1 " + t.muted}>
          <Users size={12} /> {s.subs.toLocaleString("en-IN")}
        </span>
        <span className={"text-xs font-semibold " + (s.ret >= 0 ? "text-emerald-600" : "text-rose-500")}>
          {s.ret >= 0 ? "+" : ""}{s.ret}% · 6M
        </span>
      </div>

      {menu && (
        <ActionSheet t={t} title={s.name} onClose={() => setMenu(false)}
          items={[
            {
              icon: Download,
              label: isSubscribed ? "Already in My Strategies" : "Subscribe",
              disabled: isSubscribed,
              onClick: () => onSubscribe(s),
            },
            { icon: Info, label: "Details", onClick: () => setDetails(true) },
          ]} />
      )}

      {details && (
        <Sheet t={t} title={s.name + " — configuration"} onClose={() => setDetails(false)}>
          <p className={"text-xs mb-3 " + t.muted}>by {s.author} · {s.subs.toLocaleString("en-IN")} subscribers</p>
          <ConfigSummary t={t} blocks={s.blocks} tokens={s.tokens || []} />
        </Sheet>
      )}
    </div>
  );
}

export default function MarketplacePage({ t, market, onSubscribe, subscribedIds }) {
  const featured = market.filter((s) => s.featured);
  const community = market.filter((s) => !s.featured);

  return (
    <main className="flex-1 overflow-y-auto p-4 pb-24 space-y-4">
      <IndexTiles t={t} />

      <section className={"p-4 space-y-3 " + t.card}>
        <MoversRow t={t} label="NIFTY pullers" list={NIFTY_PULLERS} positive />
        <MoversRow t={t} label="NIFTY draggers" list={NIFTY_DRAGGERS} />
      </section>

      <section className={"p-4 " + t.card}>
        <p className={t.sectionLabel + " mb-2 flex items-center gap-1"}>
          <Newspaper size={12} /> Market news
        </p>
        <div className="space-y-2">
          {MARKET_NEWS.map((n) => (
            <div key={n.id} className={"px-3 py-2.5 " + t.rowItem}>
              <p className="text-sm font-semibold leading-snug">{n.title}</p>
              <p className={"text-xs mt-1 " + t.body}>{n.body}</p>
              <p className={"text-[11px] mt-1 " + t.muted}>{n.src} · {n.time}</p>
            </div>
          ))}
        </div>
      </section>

      <div>
        <p className={t.sectionLabel + " mb-2 px-1"}>Featured strategies</p>
        <div className="space-y-3">
          {featured.map((s) => (
            <MarketStrategyCard key={s.id} t={t} s={s}
              onSubscribe={onSubscribe} subscribedIds={subscribedIds} />
          ))}
        </div>
      </div>

      <div>
        <p className={t.sectionLabel + " mb-2 px-1"}>Community strategies</p>
        <div className="space-y-3">
          {community.map((s) => (
            <MarketStrategyCard key={s.id} t={t} s={s}
              onSubscribe={onSubscribe} subscribedIds={subscribedIds} />
          ))}
        </div>
      </div>
    </main>
  );
}
