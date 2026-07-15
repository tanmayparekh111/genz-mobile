import { MONTH_NAMES } from "./theme";

let _id = 1000;
export const uid = () => ++_id;

export const fmtInr = (v) =>
  (v < 0 ? "-" : "") + "₹" + Math.abs(v).toLocaleString("en-IN", { maximumFractionDigits: 2 });

/* ── display naming: "RSI (14, 5)" instead of rsi_14_5 ──── */

export const tfNum = (tf) => tf.replace("m", "");

export const indicatorName = (type, period, tf) =>
  type === "SUPERTREND"
    ? `Supertrend (${tfNum(tf)})`
    : `${type} (${period}, ${tfNum(tf)})`;

export const priceName = (field, tf, prev) =>
  `${prev ? "Prev " : ""}${field} (${tfNum(tf)})`;

export const patternName = (name, tf) => `${name} (${tfNum(tf)})`;

/* ── builder defaults ─────────────────────────────────── */

export const newPosition = (n) => ({
  id: uid(), name: `Position ${String(n).padStart(2, "0")}`, open: true,
  side: "SELL", optionType: "CE", instrument: "NIFTY", expiry: "WEEKLY",
  strikeMode: "ATM", strikeStep: 1, premium: 200,
  lotType: "LOTS", lots: 1, maxFund: 100000,
  targetOn: true, targetType: "PERCENT", targetValue: 15,
  slOn: true, slType: "PERCENT", slValue: 15,
  trailOn: false, trailX: 10, trailY: 10, trailUnit: "POINT", trailMethod: "CONTINUOUS",
  momentumOn: false, momentumType: "PERCENT_UP", momentumValue: 2,
  reSlType: "NONE", reSlCount: 0, reTgtType: "NONE", reTgtCount: 0,
});

export const newBlock = (n) => ({
  id: uid(), name: `Block ${String(n).padStart(2, "0")}`, open: true,
  entry: "", exit: "", entryTf: "5m", exitTf: "5m",
  positions: [newPosition(1)],
});

/* one-line human summary of a position, used in config views */
export const positionSummary = (p) => {
  const strike =
    p.strikeMode === "CLOSEST PREMIUM" ? `≈₹${p.premium} premium` :
    p.strikeMode === "ATM" ? "ATM" : `${p.strikeMode} +${p.strikeStep}`;
  const qty = p.lotType === "LOTS" ? `${p.lots} lot` : `₹${p.maxFund} fund`;
  const tgt = p.targetOn ? `T ${p.targetValue}${p.targetType === "PERCENT" ? "%" : "pt"}` : "no T";
  const sl = p.slOn ? `SL ${p.slValue}${p.slType === "PERCENT" ? "%" : "pt"}` : "no SL";
  return `${p.instrument} · ${p.expiry} · ${strike} · ${qty} · ${tgt} / ${sl}`;
};

/* ── dummy backtest: Jan → Jun 2024, mostly green ──────── */

export const DUMMY_TRADES = (() => {
  const trades = [];
  let n = 0;
  for (let m = 0; m < 6; m++) {
    const perMonth = 6 + (m % 2);
    for (let i = 0; i < perMonth; i++) {
      n++;
      const seed = n * 7919;
      const win = seed % 10 < 7;
      const pnl = win
        ? +(650 + (seed % 2900) + m * 90).toFixed(2)
        : -+(380 + (seed % 1500)).toFixed(2);
      const day = String(2 + ((seed >> 3) % 24)).padStart(2, "0");
      const strike = 21500 + ((seed >> 2) % 12) * 50 + m * 100;
      const side = seed % 3 === 0 ? "SELL" : "BUY";
      const entryPrice = +(150 + (seed % 90)).toFixed(2);
      const exitPrice = +(entryPrice + (side === "BUY" ? 1 : -1) * pnl / 65).toFixed(2);
      trades.push({
        id: n, side, qty: 65,
        orderId: `1.${(i % 3) + 1}.0`,
        instrument: `NIFTY${day}${MONTH_NAMES[m]}24${strike}${seed % 2 ? "CE" : "PE"}`,
        strike,
        entryDate: `2024-${String(m + 1).padStart(2, "0")}-${day}`,
        entryTime: `09:${String(31 + (seed % 25)).padStart(2, "0")}:00`,
        exitDate: `2024-${String(m + 1).padStart(2, "0")}-${day}`,
        exitTime: pnl > 0 && seed % 4 === 0 ? "14:59:00" : `1${1 + (seed % 4)}:${String(10 + (seed % 45)).padStart(2, "0")}:00`,
        entryPrice, exitPrice, pnl,
        exitReason: pnl > 0
          ? (seed % 4 === 0 ? "TIME_BASED_EXIT" : "TARGET_HIT")
          : "STOPLOSS_HIT",
        month: m,
      });
    }
  }
  return trades;
})();

export const computeResult = (trades) => {
  const wins = trades.filter((x) => x.pnl > 0);
  const losses = trades.filter((x) => x.pnl <= 0);
  const totalPnl = trades.reduce((a, x) => a + x.pnl, 0);

  let cum = 0, peak = 0, mdd = 0, ddStart = 0, ddEnd = 0, curPeakIdx = 0;
  const equity = [0];
  trades.forEach((x, i) => {
    cum += x.pnl;
    equity.push(cum);
    if (cum > peak) { peak = cum; curPeakIdx = i; }
    const dd = peak - cum;
    if (dd > mdd) { mdd = dd; ddStart = curPeakIdx; ddEnd = i; }
  });

  const monthly = MONTH_NAMES.map((name, m) => ({
    name,
    pnl: +trades.filter((x) => x.month === m).reduce((a, x) => a + x.pnl, 0).toFixed(2),
  }));

  return {
    totalPnl: +totalPnl.toFixed(2),
    nTrades: trades.length,
    nWins: wins.length,
    winPct: trades.length ? +((wins.length / trades.length) * 100).toFixed(2) : 0,
    nLosses: losses.length,
    lossPct: trades.length ? +((losses.length / trades.length) * 100).toFixed(2) : 0,
    maxProfit: trades.length ? Math.max(...trades.map((x) => x.pnl)) : 0,
    maxLoss: trades.length ? Math.min(...trades.map((x) => x.pnl)) : 0,
    equity,
    maxDrawdown: +mdd.toFixed(2),
    ddPeriod: trades[ddStart] && trades[ddEnd]
      ? `${trades[ddStart].entryDate} → ${trades[ddEnd].exitDate}` : "—",
    tradesInDd: trades.length ? ddEnd - ddStart + 1 : 0,
    monthly,
  };
};

/* ── seed strategies for the home page ─────────────────── */

const mkStrategy = (name, status, entry, exit, tokens, positions, extras = {}) => {
  const block = { ...newBlock(1), entry, exit, positions };
  return {
    id: uid(), name, status, index: "NIFTY",
    blocks: [block],
    tokens,
    updated: extras.updated || "2026-07-10",
    pnl: extras.pnl ?? null,
    ...extras,
  };
};

export const seedStrategies = () => [
  mkStrategy(
    "RSI Momentum", "LIVE",
    "RSI (14, 5) > 60 AND Close (5) > EMA (20, 5)",
    "RSI (14, 5) < 50",
    ["RSI (14, 5)", "EMA (20, 5)", "Close (5)"],
    [{ ...newPosition(1), side: "BUY", optionType: "CE" }],
    { pnl: 48210.5, updated: "2026-07-14" }
  ),
  mkStrategy(
    "Morning ORB", "LIVE",
    "current_time >= 09:45 AND Close (5) > Prev High (15)",
    "current_time >= 15:00",
    ["Close (5)", "Prev High (15)", "current_time"],
    [
      { ...newPosition(1), side: "SELL", optionType: "PE", strikeMode: "CLOSEST PREMIUM", premium: 180 },
      { ...newPosition(2), side: "SELL", optionType: "CE", strikeMode: "CLOSEST PREMIUM", premium: 180 },
    ],
    { pnl: 23984.25, updated: "2026-07-12" }
  ),
  mkStrategy(
    "EMA Cross Scalp", "PAUSED",
    "EMA (9, 3) > EMA (21, 3)",
    "EMA (9, 3) < EMA (21, 3)",
    ["EMA (9, 3)", "EMA (21, 3)"],
    [{ ...newPosition(1), side: "BUY", optionType: "FUT", targetType: "POINT", targetValue: 40, slType: "POINT", slValue: 20 }],
    { pnl: -3120.75, updated: "2026-06-30" }
  ),
  mkStrategy(
    "Supertrend Swing", "DRAFT",
    "Supertrend (15) > 0 AND RSI (14, 15) > 55",
    "",
    ["Supertrend (15)", "RSI (14, 15)"],
    [{ ...newPosition(1), side: "BUY", optionType: "CE", expiry: "MONTHLY", strikeMode: "ITM", strikeStep: 2 }],
    { updated: "2026-07-08" }
  ),
  mkStrategy(
    "Doji Reversal", "DRAFT",
    "Doji (5) AND Close (5) < EMA (50, 5)",
    "RSI (14, 5) > 65",
    ["Doji (5)", "Close (5)", "EMA (50, 5)", "RSI (14, 5)"],
    [{ ...newPosition(1), side: "BUY", optionType: "PE", trailOn: true }],
    { updated: "2026-07-01" }
  ),
];
