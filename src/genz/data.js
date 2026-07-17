import { MONTH_NAMES } from "./theme";

let _id = 1000;
export const uid = () => ++_id;

export const fmtInr = (v) =>
  (v < 0 ? "-" : "") + "₹" + Math.abs(v).toLocaleString("en-IN", { maximumFractionDigits: 2 });

/* ── display naming: "RSI (14, 5)" ─────────────────────── */

export const tfNum = (tf) => tf.replace("m", "");

export const indicatorName = (type, period, tf) =>
  type === "SUPERTREND"
    ? `Supertrend (${tfNum(tf)})`
    : `${type} (${period}, ${tfNum(tf)})`;

export const priceName = (field, tf, prev) =>
  `${prev ? "Prev " : ""}${field} (${tfNum(tf)})`;

export const patternName = (name, tf) => `${name} (${tfNum(tf)})`;

/* ══════════════════════════════════════════════════════════
   CONDITION TREE MODEL
   group:     { id, type:'group', children:[node], join? }
   condition: { id, type:'cond', lhs, cmp, rhs, join? }
   operand:   { kind:'token'|'number'|null, value }
   `join` ('AND'|'OR') connects a node to the PREVIOUS sibling;
   the first child of a group has no join.
   A condition box = { mode:null|'pattern'|'manual',
                       pattern:string|null, tree:group }
   ══════════════════════════════════════════════════════════ */

export const emptyTree = () => ({ id: uid(), type: "group", children: [] });

export const newCondNode = (join) => ({
  id: uid(), type: "cond", join,
  lhs: { kind: null, value: "" }, cmp: ">", rhs: { kind: null, value: "" },
});

export const newGroupNode = (join) => ({
  id: uid(), type: "group", join, children: [newCondNode()],
});

/* immutable walk/update */
export const mapTree = (node, fn) => {
  const n = fn(node);
  if (n.type === "group") return { ...n, children: n.children.map((c) => mapTree(c, fn)) };
  return n;
};

export const removeById = (node, id) => {
  if (node.type !== "group") return node;
  const children = node.children
    .filter((c) => c.id !== id)
    .map((c) => removeById(c, id))
    .map((c, i) => (i === 0 ? { ...c, join: undefined } : { ...c, join: c.join || "AND" }));
  return { ...node, children };
};

/* tree → text (this string is what the backend will receive
   alongside the tree, and what ConfigSummary displays) */
const opText = (o) => (o.kind ? String(o.value) : "…");

export const treeToText = (node, isRoot = false) => {
  if (node.type === "cond") return `${opText(node.lhs)} ${node.cmp} ${opText(node.rhs)}`;
  const inner = node.children
    .map((c, i) => (i === 0 ? "" : ` ${c.join} `) + treeToText(c))
    .join("");
  return isRoot ? inner : `(${inner})`;
};

export const boxText = (box) =>
  box.mode === "pattern" ? (box.pattern || "") :
  box.mode === "manual" ? treeToText(box.tree, true) : "";

/* validation — returns [] when clean */
export const validateTree = (node, errs = []) => {
  if (node.type === "cond") {
    if (!node.lhs.kind || !node.rhs.kind)
      errs.push("a condition is missing an operand (tap the dotted chips)");
    else if (node.lhs.kind === "number" && node.rhs.kind === "number")
      errs.push(`"${opText(node.lhs)} ${node.cmp} ${opText(node.rhs)}" compares two plain numbers`);
  } else {
    if (node.children.length === 0) errs.push("a group is empty — add a condition or remove it");
    node.children.forEach((c) => validateTree(c, errs));
  }
  return errs;
};

export const validateBox = (box) => {
  if (box.mode === "pattern") return box.pattern ? [] : ["no pattern selected"];
  if (box.mode === "manual") {
    if (!box.tree.children.length) return []; // empty manual = always true
    return validateTree(box.tree);
  }
  return []; // empty box = always true
};

/* quick constructors for seed data */
const opnd = (v) =>
  typeof v === "number" || /^[\d.:]+$/.test(String(v))
    ? { kind: "number", value: String(v) }
    : { kind: "token", value: v };
const cnd = (l, c, r, join) =>
  ({ id: uid(), type: "cond", join, lhs: opnd(l), cmp: c, rhs: opnd(r) });
const grp = (join, ...children) => ({ id: uid(), type: "group", join, children });
const tre = (...children) => ({ id: uid(), type: "group", children });

export const mk = { opnd, cnd, grp, tre };

const manualBox = (tree) => ({ mode: "manual", pattern: null, tree });
const patternBox = (p) => ({ mode: "pattern", pattern: p, tree: emptyTree() });
const emptyBox = () => ({ mode: null, pattern: null, tree: emptyTree() });

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

export const newBlock = (n, entryBox, exitBox) => {
  const eb = entryBox || emptyBox();
  const xb = exitBox || emptyBox();
  return {
    id: uid(), name: `Block ${String(n).padStart(2, "0")}`, open: true,
    entryTf: "5m", exitTf: "5m",
    entryBox: eb, exitBox: xb,
    entry: boxText(eb), exit: boxText(xb),
    positions: [newPosition(1)],
  };
};

/* one-line human summary of a position */
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

/* ── seed strategies (conditions built as real trees) ──── */

const mkStrategy = (name, status, entryBox, exitBox, tokens, positions, extras = {}) => {
  const block = { ...newBlock(1, entryBox, exitBox), positions };
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
    manualBox(tre(
      cnd("RSI (14, 5)", ">", 60),
      cnd("Close (5)", ">", "EMA (20, 5)", "AND"),
    )),
    manualBox(tre(cnd("RSI (14, 5)", "<", 50))),
    ["RSI (14, 5)", "EMA (20, 5)", "Close (5)"],
    [{ ...newPosition(1), side: "BUY", optionType: "CE" }],
    { pnl: 48210.5, updated: "2026-07-14" }
  ),
  mkStrategy(
    "Morning ORB", "LIVE",
    manualBox(tre(
      cnd("current_time", ">=", "09:45"),
      cnd("Close (5)", ">", "Prev High (15)", "AND"),
    )),
    manualBox(tre(cnd("current_time", ">=", "15:00"))),
    ["Close (5)", "Prev High (15)", "current_time"],
    [
      { ...newPosition(1), side: "SELL", optionType: "PE", strikeMode: "CLOSEST PREMIUM", premium: 180 },
      { ...newPosition(2), side: "SELL", optionType: "CE", strikeMode: "CLOSEST PREMIUM", premium: 180 },
    ],
    { pnl: 23984.25, updated: "2026-07-12" }
  ),
  mkStrategy(
    "EMA Cross Scalp", "PAUSED",
    manualBox(tre(cnd("EMA (9, 3)", ">", "EMA (21, 3)"))),
    manualBox(tre(cnd("EMA (9, 3)", "<", "EMA (21, 3)"))),
    ["EMA (9, 3)", "EMA (21, 3)"],
    [{ ...newPosition(1), side: "BUY", optionType: "FUT", targetType: "POINT", targetValue: 40, slType: "POINT", slValue: 20 }],
    { pnl: -3120.75, updated: "2026-06-30" }
  ),
  mkStrategy(
    "Supertrend Swing", "DRAFT",
    manualBox(tre(
      grp(undefined,
        cnd("Supertrend (15)", ">", 0),
        cnd("RSI (14, 15)", ">", 55, "AND"),
      ),
      grp("OR",
        cnd("Close (15)", ">", "Prev High (15)"),
      ),
    )),
    null,
    ["Supertrend (15)", "RSI (14, 15)", "Close (15)", "Prev High (15)"],
    [{ ...newPosition(1), side: "BUY", optionType: "CE", expiry: "MONTHLY", strikeMode: "ITM", strikeStep: 2 }],
    { updated: "2026-07-08" }
  ),
  mkStrategy(
    "Doji Reversal", "DRAFT",
    patternBox("Doji (5)"),
    manualBox(tre(cnd("RSI (14, 5)", ">", 65))),
    ["RSI (14, 5)"],
    [{ ...newPosition(1), side: "BUY", optionType: "PE", trailOn: true }],
    { updated: "2026-07-01" }
  ),
];

/* ══════════════════════════════════════════════════════════
   MARKETPLACE DUMMY DATA
   ══════════════════════════════════════════════════════════ */

export const INDIA_INDICES = [
  { name: "NIFTY 50", price: "24,812.30", chg: +0.62 },
  { name: "BANKNIFTY", price: "52,140.85", chg: -0.28 },
  { name: "FINNIFTY", price: "23,905.10", chg: +0.41 },
  { name: "SENSEX", price: "81,455.70", chg: +0.55 },
  { name: "MIDCAP 100", price: "57,230.45", chg: +1.12 },
  { name: "INDIA VIX", price: "13.42", chg: -3.85 },
];

export const GLOBAL_INDICES = [
  { name: "DOW JONES", price: "44,910.20", chg: +0.34 },
  { name: "S&P 500", price: "6,412.55", chg: +0.48 },
  { name: "NASDAQ", price: "21,880.10", chg: +0.91 },
  { name: "FTSE 100", price: "8,610.40", chg: -0.12 },
  { name: "NIKKEI 225", price: "41,220.75", chg: +1.05 },
  { name: "HANG SENG", price: "19,480.30", chg: -0.74 },
];

export const NIFTY_PULLERS = [
  { sym: "RELIANCE", chg: +2.14 }, { sym: "HDFCBANK", chg: +1.62 },
  { sym: "INFY", chg: +1.38 }, { sym: "TCS", chg: +0.95 },
];
export const NIFTY_DRAGGERS = [
  { sym: "ADANIENT", chg: -2.35 }, { sym: "TATAMOTORS", chg: -1.71 },
  { sym: "SBIN", chg: -1.12 }, { sym: "ITC", chg: -0.66 },
];

export const MARKET_NEWS = [
  {
    id: 1, time: "09:42",
    title: "RBI holds repo rate at 6.25%, keeps stance neutral",
    src: "Market Desk",
    body: "Rate-sensitive banking and realty stocks trade mixed after the policy announcement.",
  },
  {
    id: 2, time: "10:15",
    title: "IT stocks rally as US tech earnings beat estimates",
    src: "Global Wire",
    body: "INFY and TCS lead the NIFTY IT index up 1.8% in morning trade.",
  },
  {
    id: 3, time: "11:03",
    title: "Crude slips below $78; OMCs gain up to 2%",
    src: "Commodities",
    body: "Softer crude supports HPCL, BPCL and IOC; aviation stocks also tick higher.",
  },
];

/* strategies visible on the marketplace: featured (by GenZ) + community */
const mktStrategy = (name, author, desc, tagsList, blocks, tokens, extras = {}) => ({
  id: uid(), name, author, desc, tagsList,
  blocks, tokens,
  subs: extras.subs ?? 0,
  ret: extras.ret ?? 0, // 6-month return %
  featured: extras.featured ?? false,
});

const straddlePositions = () => [
  { ...newPosition(1), side: "SELL", optionType: "CE", strikeMode: "ATM" },
  { ...newPosition(2), side: "SELL", optionType: "PE", strikeMode: "ATM" },
];
const stranglePositions = () => [
  { ...newPosition(1), side: "SELL", optionType: "CE", strikeMode: "CLOSEST PREMIUM", premium: 120 },
  { ...newPosition(2), side: "SELL", optionType: "PE", strikeMode: "CLOSEST PREMIUM", premium: 120 },
];

export const marketplaceSeeds = () => [
  mktStrategy(
    "9:20 Short Straddle", "GenZ Official",
    "Classic intraday straddle: sell ATM CE + PE at 9:20 with 25% SL each leg.",
    ["Straddle", "Intraday"],
    [{ ...newBlock(1,
        { mode: "manual", pattern: null, tree: mk.tre(mk.cnd("current_time", ">=", "09:20")) },
        { mode: "manual", pattern: null, tree: mk.tre(mk.cnd("current_time", ">=", "15:10")) }),
      positions: straddlePositions() }],
    ["current_time"],
    { subs: 1240, ret: 18.4, featured: true }
  ),
  mktStrategy(
    "Wide Short Strangle", "GenZ Official",
    "Sell ~₹120 premium strangle both sides; time exit, no re-entry.",
    ["Strangle", "Intraday"],
    [{ ...newBlock(1,
        { mode: "manual", pattern: null, tree: mk.tre(mk.cnd("current_time", ">=", "09:30")) },
        { mode: "manual", pattern: null, tree: mk.tre(mk.cnd("current_time", ">=", "15:00")) }),
      positions: stranglePositions() }],
    ["current_time"],
    { subs: 862, ret: 12.7, featured: true }
  ),
  mktStrategy(
    "RSI Momentum Buyer", "GenZ Official",
    "Buys CE when RSI(14,5) crosses 60 with price above EMA(20,5).",
    ["Indicator", "Momentum"],
    [{ ...newBlock(1,
        { mode: "manual", pattern: null,
          tree: mk.tre(mk.cnd("RSI (14, 5)", ">", 60), mk.cnd("Close (5)", ">", "EMA (20, 5)", "AND")) },
        { mode: "manual", pattern: null, tree: mk.tre(mk.cnd("RSI (14, 5)", "<", 50)) }),
      positions: [{ ...newPosition(1), side: "BUY", optionType: "CE" }] }],
    ["RSI (14, 5)", "EMA (20, 5)", "Close (5)"],
    { subs: 510, ret: 22.1, featured: true }
  ),
  mktStrategy(
    "Expiry Theta Crush", "Ravi Sharma",
    "Sells far OTM strangle only on expiry day afternoons.",
    ["Strangle", "Expiry"],
    [{ ...newBlock(1,
        { mode: "manual", pattern: null, tree: mk.tre(mk.cnd("current_time", ">=", "13:00")) },
        { mode: "manual", pattern: null, tree: mk.tre(mk.cnd("current_time", ">=", "15:15")) }),
      positions: stranglePositions() }],
    ["current_time"],
    { subs: 318, ret: 9.6 }
  ),
  mktStrategy(
    "Supertrend Rider", "Priya K",
    "Rides 15-min Supertrend flips with trailing stop loss.",
    ["Indicator", "Trend"],
    [{ ...newBlock(1,
        { mode: "manual", pattern: null,
          tree: mk.tre(mk.cnd("Supertrend (15)", ">", 0), mk.cnd("RSI (14, 15)", ">", 55, "AND")) },
        { mode: "manual", pattern: null, tree: mk.tre(mk.cnd("Supertrend (15)", "<", 0)) }),
      positions: [{ ...newPosition(1), side: "BUY", optionType: "FUT", trailOn: true }] }],
    ["Supertrend (15)", "RSI (14, 15)"],
    { subs: 204, ret: 15.3 }
  ),
];

/* dummy "open positions today" for LIVE / papertrading strategies —
   deterministic per strategy so it doesn't change on re-render */
export const openPositionsFor = (s) => {
  const seed = (s.id * 2654435761) >>> 0;
  const n = 1 + (seed % 3); // 1..3 open positions
  const out = [];
  for (let i = 0; i < n; i++) {
    const k = (seed >> (i * 5)) >>> 0;
    const strike = 24700 + (k % 8) * 50;
    const side = k % 3 === 0 ? "BUY" : "SELL";
    const type = k % 2 ? "CE" : "PE";
    const pnl = +(((k % 900) - 320) * 1.7).toFixed(2);
    out.push({
      id: i,
      sym: `NIFTY 17JUL ${strike} ${type}`,
      side, qty: 65,
      entry: +(140 + (k % 80)).toFixed(2),
      pnl,
    });
  }
  return out;
};
