import type { ReactNode } from "react";

/**
 * Иллюстрации для конкретных услуг: картинка подбирается по названию услуги,
 * а не одна на всю категорию (электрощиток → щиток, автомат → автомат, бойлер → бойлер...).
 * Для 4 услуг есть растровые картинки в /public/images/services, остальные нарисованы SVG.
 */

type Art = { bg: string; img?: string; svg?: ReactNode };

const S = "#334155"; // тёмные линии
const G = "#E2E8F0"; // светло-серый корпус
const W = "#FFFFFF";
const E = "#10B981"; // зелёный
const B = "#3B82F6"; // синий
const O = "#F59E0B"; // оранжевый
const R = "#EF4444"; // красный
const C = "#D97706"; // медь/дерево

const box = (x: number, y: number, w: number, h: number, fill: string, r = 4, stroke = S) => (
  <rect x={x} y={y} width={w} height={h} rx={r} fill={fill} stroke={stroke} strokeWidth="2.5" />
);

const ART: Record<string, Art> = {
  socket: { bg: "bg-emerald-50", img: "/images/services/socket.png" },
  switch: { bg: "bg-sky-50", img: "/images/services/switch.png" },
  chandelier: { bg: "bg-amber-50", img: "/images/services/chandelier.png" },
  wiring: { bg: "bg-violet-50", img: "/images/services/wiring.png" },

  // ---------- Электрика ----------
  panel: {
    bg: "bg-emerald-50",
    svg: (
      <>
        {box(18, 12, 64, 76, G, 6)}
        {box(25, 22, 50, 56, W, 3)}
        <line x1="25" y1="48" x2="75" y2="48" stroke={S} strokeWidth="2" />
        {[29, 40, 51, 62].map((x) => (
          <g key={x}>
            {box(x, 27, 9, 17, "#F8FAFC", 1.5)}
            <rect x={x + 2.5} y={30} width="4" height="6" rx="1" fill={x === 51 ? R : E} />
          </g>
        ))}
        {[29, 40, 51, 62].map((x) => (
          <g key={`b${x}`}>
            {box(x, 53, 9, 17, "#F8FAFC", 1.5)}
            <rect x={x + 2.5} y={56} width="4" height="6" rx="1" fill={E} />
          </g>
        ))}
        <circle cx="76" cy="50" r="2" fill={S} />
      </>
    ),
  },
  breaker: {
    bg: "bg-sky-50",
    svg: (
      <>
        <rect x="14" y="44" width="72" height="8" rx="2" fill="#94A3B8" />
        {box(30, 16, 40, 68, W, 5)}
        <rect x="36" y="22" width="28" height="8" rx="2" fill={E} />
        {box(42, 38, 16, 22, "#F1F5F9", 3)}
        <rect x="45" y="40" width="10" height="9" rx="2" fill={S} />
        <text x="50" y="74" textAnchor="middle" fontSize="9" fontWeight="700" fill={S} fontFamily="sans-serif">C16</text>
      </>
    ),
  },
  elMeter: {
    bg: "bg-amber-50",
    svg: (
      <>
        {box(20, 12, 60, 76, W, 6)}
        {box(28, 22, 44, 18, "#0F172A", 3)}
        <text x="50" y="35.5" textAnchor="middle" fontSize="11" fontWeight="700" fill="#34D399" fontFamily="monospace">01287</text>
        <text x="50" y="52" textAnchor="middle" fontSize="8" fontWeight="700" fill={S} fontFamily="sans-serif">кВт·ч</text>
        <circle cx="38" cy="64" r="4" fill={R} />
        <rect x="48" y="60" width="22" height="8" rx="2" fill={G} />
        <rect x="30" y="76" width="40" height="6" rx="2" fill="#94A3B8" />
      </>
    ),
  },
  multimeter: {
    bg: "bg-yellow-50",
    svg: (
      <>
        {box(28, 10, 44, 72, O, 8)}
        {box(34, 16, 32, 18, "#0F172A", 3)}
        <text x="50" y="29" textAnchor="middle" fontSize="10" fontWeight="700" fill="#34D399" fontFamily="monospace">220V</text>
        <circle cx="50" cy="52" r="11" fill={W} stroke={S} strokeWidth="2.5" />
        <line x1="50" y1="52" x2="56" y2="45" stroke={S} strokeWidth="3" strokeLinecap="round" />
        <circle cx="42" cy="72" r="3" fill={R} />
        <circle cx="58" cy="72" r="3" fill={S} />
        <path d="M42 75 C40 88, 22 86, 20 94" fill="none" stroke={R} strokeWidth="3" />
        <path d="M58 75 C60 88, 78 86, 80 94" fill="none" stroke={S} strokeWidth="3" />
      </>
    ),
  },

  // ---------- Сантехника ----------
  faucet: {
    bg: "bg-sky-50",
    svg: (
      <>
        <path d="M30 70 V46 a16 16 0 0 1 16 -16 h22 v12 h-20 a4 4 0 0 0 -4 4 V70z" fill="#CBD5E1" stroke={S} strokeWidth="2.5" />
        {box(22, 68, 30, 10, "#94A3B8", 3)}
        {box(40, 18, 22, 8, "#CBD5E1", 3)}
        <rect x="49" y="24" width="4" height="8" fill="#94A3B8" />
        <path d="M66 46 q2 8 0 12 q-2 -4 0 -12" fill={B} />
        <path d="M66 62 q3 10 0 16 q-3 -6 0 -16" fill="#60A5FA" />
      </>
    ),
  },
  toilet: {
    bg: "bg-slate-100",
    svg: (
      <>
        {box(56, 14, 26, 36, W, 4)}
        <rect x="63" y="20" width="12" height="4" rx="2" fill="#CBD5E1" />
        <path d="M18 46 h64 v6 a26 20 0 0 1 -26 20 h-12 a26 20 0 0 1 -26 -20z" fill={W} stroke={S} strokeWidth="2.5" />
        <path d="M34 72 h20 l4 16 h-28z" fill={W} stroke={S} strokeWidth="2.5" />
        <ellipse cx="42" cy="49" rx="20" ry="3" fill="#CBD5E1" />
      </>
    ),
  },
  plunger: {
    bg: "bg-cyan-50",
    svg: (
      <>
        <rect x="46" y="8" width="8" height="52" rx="3" fill={C} stroke={S} strokeWidth="2" />
        <path d="M26 80 a24 24 0 0 1 48 0z" fill={R} stroke={S} strokeWidth="2.5" />
        <rect x="22" y="80" width="56" height="6" rx="3" fill="#94A3B8" />
        <path d="M30 92 q20 6 40 0" fill="none" stroke={B} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  sink: {
    bg: "bg-sky-50",
    svg: (
      <>
        <path d="M14 44 h72 l-6 20 a14 14 0 0 1 -13 10 h-34 a14 14 0 0 1 -13 -10z" fill={W} stroke={S} strokeWidth="2.5" />
        <ellipse cx="50" cy="48" rx="28" ry="4" fill="#CBD5E1" />
        <path d="M46 44 V28 a8 8 0 0 1 8 -8 h8 v6 h-7 a3 3 0 0 0 -3 3 V44z" fill="#CBD5E1" stroke={S} strokeWidth="2.5" />
        <rect x="44" y="74" width="12" height="16" fill="#94A3B8" stroke={S} strokeWidth="2" />
      </>
    ),
  },
  pipe: {
    bg: "bg-sky-50",
    svg: (
      <>
        <path d="M10 30 h44 a12 12 0 0 1 12 12 v48" fill="none" stroke="#94A3B8" strokeWidth="16" />
        <path d="M10 30 h44 a12 12 0 0 1 12 12 v48" fill="none" stroke={S} strokeWidth="2" strokeDasharray="0" opacity="0.25" />
        {box(22, 20, 10, 20, "#64748B", 2)}
        {box(56, 56, 20, 10, "#64748B", 2)}
        <path d="M78 22 l10 -10 m-6 16 l12 -2" stroke={B} strokeWidth="3" strokeLinecap="round" />
        <circle cx="84" cy="34" r="3" fill="#60A5FA" />
      </>
    ),
  },
  boiler: {
    bg: "bg-orange-50",
    svg: (
      <>
        <rect x="28" y="8" width="44" height="78" rx="20" fill={W} stroke={S} strokeWidth="2.5" />
        <circle cx="50" cy="36" r="10" fill="#F1F5F9" stroke={S} strokeWidth="2.5" />
        <line x1="50" y1="36" x2="55" y2="31" stroke={R} strokeWidth="2.5" strokeLinecap="round" />
        <rect x="42" y="56" width="16" height="4" rx="2" fill={E} />
        <rect x="38" y="86" width="5" height="10" fill={B} />
        <rect x="57" y="86" width="5" height="10" fill={R} />
      </>
    ),
  },
  shower: {
    bg: "bg-cyan-50",
    svg: (
      <>
        <path d="M24 90 V24 a10 10 0 0 1 10 -10 h24" fill="none" stroke="#94A3B8" strokeWidth="5" strokeLinecap="round" />
        <path d="M50 14 h26 l6 12 h-38z" fill="#CBD5E1" stroke={S} strokeWidth="2.5" />
        {[50, 58, 66, 74].map((x, i) => (
          <line key={x} x1={x} y1="34" x2={x - 4 + i * 2} y2={56 + (i % 2) * 8} stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
        ))}
        <rect x="16" y="88" width="72" height="6" rx="3" fill="#94A3B8" />
      </>
    ),
  },
  waterMeter: {
    bg: "bg-sky-50",
    svg: (
      <>
        <rect x="8" y="58" width="84" height="12" rx="3" fill="#94A3B8" stroke={S} strokeWidth="2" />
        <circle cx="50" cy="44" r="26" fill={W} stroke={S} strokeWidth="2.5" />
        <circle cx="50" cy="44" r="19" fill="#EFF6FF" />
        <rect x="36" y="34" width="28" height="9" rx="2" fill="#0F172A" />
        <text x="50" y="41.5" textAnchor="middle" fontSize="7.5" fontWeight="700" fill="#34D399" fontFamily="monospace">00243</text>
        <line x1="50" y1="52" x2="56" y2="48" stroke={R} strokeWidth="2.5" strokeLinecap="round" />
        <text x="50" y="62" textAnchor="middle" fontSize="6" fontWeight="700" fill={B} fontFamily="sans-serif">м³</text>
      </>
    ),
  },

  // ---------- Отделка ----------
  spatula: {
    bg: "bg-stone-100",
    svg: (
      <>
        <rect x="10" y="18" width="80" height="56" rx="4" fill="#F5F5F4" stroke="#D6D3D1" strokeWidth="2" />
        <path d="M18 60 q30 -8 60 0" fill="none" stroke="#E7E5E4" strokeWidth="8" strokeLinecap="round" />
        <path d="M40 30 h36 l-4 22 h-28z" fill="#CBD5E1" stroke={S} strokeWidth="2.5" />
        <rect x="52" y="52" width="12" height="10" fill="#94A3B8" />
        <rect x="50" y="62" width="16" height="28" rx="4" fill={O} stroke={S} strokeWidth="2.5" />
      </>
    ),
  },
  trowel: {
    bg: "bg-stone-100",
    svg: (
      <>
        <path d="M14 68 L50 26 L86 68z" fill="#CBD5E1" stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M50 44 v-18" stroke="#94A3B8" strokeWidth="4" />
        <rect x="40" y="8" width="20" height="20" rx="5" fill={C} stroke={S} strokeWidth="2.5" />
        <path d="M14 80 q18 -6 36 0 t36 0" fill="none" stroke="#D6D3D1" strokeWidth="6" strokeLinecap="round" />
      </>
    ),
  },
  wallpaper: {
    bg: "bg-rose-50",
    svg: (
      <>
        <rect x="16" y="14" width="44" height="72" fill="#FDE68A" stroke={S} strokeWidth="2.5" />
        {[24, 40, 56, 72].map((y) => (
          <g key={y}>
            <circle cx="28" cy={y} r="3" fill="#F472B6" />
            <circle cx="46" cy={y + 8} r="3" fill="#F472B6" />
          </g>
        ))}
        <rect x="56" y="24" width="28" height="52" rx="14" fill="#FEF3C7" stroke={S} strokeWidth="2.5" />
        <ellipse cx="70" cy="30" rx="14" ry="6" fill="#FDE68A" stroke={S} strokeWidth="2.5" />
        <ellipse cx="70" cy="30" rx="4" ry="2" fill={S} />
      </>
    ),
  },
  tiles: {
    bg: "bg-teal-50",
    svg: (
      <>
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => (
            <rect key={`${r}${c}`} x={14 + c * 25} y={14 + r * 25} width="22" height="22" rx="2" fill={(r + c) % 2 ? "#99F6E4" : "#5EEAD4"} stroke={S} strokeWidth="2" />
          )),
        )}
        <path d="M60 60 l22 22 m-6 -28 l8 8 -18 18 -8 -8z" fill={O} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
      </>
    ),
  },
  drywall: {
    bg: "bg-slate-100",
    svg: (
      <>
        <rect x="12" y="10" width="56" height="80" fill="#F1F5F9" stroke={S} strokeWidth="2.5" />
        <rect x="30" y="16" width="56" height="80" fill={W} stroke={S} strokeWidth="2.5" />
        {[30, 50, 70].map((y) => (
          <g key={y}>
            <circle cx="38" cy={y} r="1.8" fill={S} />
            <circle cx="78" cy={y} r="1.8" fill={S} />
          </g>
        ))}
        <path d="M44 56 h28" stroke="#CBD5E1" strokeWidth="3" />
      </>
    ),
  },
  window: {
    bg: "bg-sky-50",
    svg: (
      <>
        <rect x="14" y="10" width="72" height="80" rx="3" fill="#E7E5E4" stroke={S} strokeWidth="2.5" />
        <rect x="24" y="20" width="52" height="60" fill="#BFDBFE" stroke={S} strokeWidth="2.5" />
        <line x1="50" y1="20" x2="50" y2="80" stroke={S} strokeWidth="2.5" />
        <path d="M30 30 l10 -6 M30 40 l14 -8" stroke={W} strokeWidth="3" strokeLinecap="round" />
        <rect x="10" y="88" width="80" height="6" rx="2" fill="#94A3B8" />
      </>
    ),
  },

  // ---------- Мебель и двери ----------
  wardrobe: {
    bg: "bg-orange-50",
    svg: (
      <>
        <rect x="18" y="8" width="64" height="80" rx="3" fill="#FCD34D" stroke={S} strokeWidth="2.5" />
        <line x1="50" y1="8" x2="50" y2="88" stroke={S} strokeWidth="2.5" />
        <rect x="44" y="42" width="3" height="12" rx="1.5" fill={S} />
        <rect x="53" y="42" width="3" height="12" rx="1.5" fill={S} />
        <rect x="22" y="88" width="6" height="6" fill={S} />
        <rect x="72" y="88" width="6" height="6" fill={S} />
      </>
    ),
  },
  kitchen: {
    bg: "bg-amber-50",
    svg: (
      <>
        <rect x="10" y="12" width="80" height="22" rx="2" fill="#FDE68A" stroke={S} strokeWidth="2.5" />
        <line x1="36" y1="12" x2="36" y2="34" stroke={S} strokeWidth="2" />
        <line x1="63" y1="12" x2="63" y2="34" stroke={S} strokeWidth="2" />
        <rect x="8" y="52" width="84" height="6" fill="#94A3B8" stroke={S} strokeWidth="2" />
        <rect x="10" y="58" width="80" height="32" fill="#FCD34D" stroke={S} strokeWidth="2.5" />
        <line x1="36" y1="58" x2="36" y2="90" stroke={S} strokeWidth="2" />
        <line x1="63" y1="58" x2="63" y2="90" stroke={S} strokeWidth="2" />
        <rect x="68" y="44" width="16" height="8" rx="2" fill="#CBD5E1" stroke={S} strokeWidth="2" />
      </>
    ),
  },
  door: {
    bg: "bg-orange-50",
    svg: (
      <>
        <rect x="24" y="6" width="52" height="88" fill="#E7E5E4" stroke={S} strokeWidth="2.5" />
        <rect x="30" y="12" width="40" height="82" fill={C} stroke={S} strokeWidth="2.5" />
        <rect x="36" y="20" width="28" height="28" rx="2" fill="none" stroke="#FCD34D" strokeWidth="2" />
        <rect x="36" y="56" width="28" height="30" rx="2" fill="none" stroke="#FCD34D" strokeWidth="2" />
        <rect x="60" y="50" width="10" height="4" rx="2" fill="#E5E7EB" stroke={S} strokeWidth="1.5" />
      </>
    ),
  },
  lock: {
    bg: "bg-slate-100",
    svg: (
      <>
        <path d="M34 44 V32 a16 16 0 0 1 32 0 V44" fill="none" stroke="#94A3B8" strokeWidth="8" />
        <rect x="24" y="42" width="52" height="44" rx="8" fill={O} stroke={S} strokeWidth="2.5" />
        <circle cx="50" cy="60" r="6" fill={S} />
        <rect x="47" y="62" width="6" height="12" rx="2" fill={S} />
      </>
    ),
  },
  shelves: {
    bg: "bg-amber-50",
    svg: (
      <>
        <rect x="10" y="30" width="80" height="7" rx="2" fill={C} stroke={S} strokeWidth="2" />
        <rect x="10" y="64" width="80" height="7" rx="2" fill={C} stroke={S} strokeWidth="2" />
        <rect x="18" y="12" width="8" height="18" fill={B} />
        <rect x="28" y="16" width="8" height="14" fill={R} />
        <rect x="38" y="10" width="8" height="20" fill={E} />
        <circle cx="72" cy="22" r="8" fill="#86EFAC" stroke={S} strokeWidth="2" />
        <rect x="22" y="50" width="16" height="14" rx="2" fill="#E0E7FF" stroke={S} strokeWidth="2" />
        <path d="M60 64 v-12 h14 v12" fill="#FDE68A" stroke={S} strokeWidth="2" />
        <path d="M18 71 v12 M82 71 v12" stroke={S} strokeWidth="3" />
      </>
    ),
  },

  // ---------- Умный дом ----------
  intercom: {
    bg: "bg-violet-50",
    svg: (
      <>
        <rect x="26" y="8" width="48" height="84" rx="8" fill="#1E293B" stroke={S} strokeWidth="2.5" />
        <rect x="32" y="16" width="36" height="30" rx="3" fill="#A5B4FC" />
        <circle cx="50" cy="28" r="6" fill="#E0E7FF" />
        <path d="M40 44 a10 8 0 0 1 20 0z" fill="#E0E7FF" />
        <circle cx="50" cy="58" r="3" fill="#64748B" />
        {[36, 50, 64].map((x) => (
          <rect key={x} x={x - 5} y="68" width="10" height="7" rx="2" fill="#475569" />
        ))}
        <circle cx="50" cy="84" r="4" fill={E} />
      </>
    ),
  },
  smartLock: {
    bg: "bg-violet-50",
    svg: (
      <>
        <rect x="30" y="8" width="40" height="84" rx="10" fill="#1E293B" stroke={S} strokeWidth="2.5" />
        <rect x="36" y="16" width="28" height="36" rx="4" fill="#312E81" />
        {[0, 1, 2].map((r) =>
          [0, 1, 2].map((c) => <circle key={`${r}${c}`} cx={42 + c * 8} cy={24 + r * 10} r="2.5" fill="#A5B4FC" />),
        )}
        <rect x="40" y="62" width="30" height="8" rx="4" fill="#94A3B8" />
        <circle cx="50" cy="82" r="4" fill={E} />
      </>
    ),
  },
  sensor: {
    bg: "bg-violet-50",
    svg: (
      <>
        <rect x="30" y="30" width="40" height="46" rx="10" fill={W} stroke={S} strokeWidth="2.5" />
        <circle cx="50" cy="50" r="10" fill="#E0E7FF" stroke={S} strokeWidth="2" />
        <circle cx="50" cy="66" r="2.5" fill={E} />
        <path d="M22 22 a40 40 0 0 1 56 0" fill="none" stroke="#A78BFA" strokeWidth="3" strokeLinecap="round" />
        <path d="M30 14 a30 30 0 0 1 40 0" fill="none" stroke="#C4B5FD" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  smartBulb: {
    bg: "bg-yellow-50",
    svg: (
      <>
        <path d="M50 10 a24 24 0 0 1 14 43 v10 h-28 v-10 a24 24 0 0 1 14 -43z" fill="#FDE68A" stroke={S} strokeWidth="2.5" />
        <rect x="38" y="66" width="24" height="6" rx="2" fill="#CBD5E1" stroke={S} strokeWidth="2" />
        <rect x="40" y="74" width="20" height="6" rx="2" fill="#CBD5E1" stroke={S} strokeWidth="2" />
        <path d="M44 84 h12" stroke={S} strokeWidth="3" strokeLinecap="round" />
        <path d="M76 20 a10 10 0 0 1 8 8 M76 12 a18 18 0 0 1 14 14" fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  smartHub: {
    bg: "bg-violet-50",
    svg: (
      <>
        <path d="M14 48 L50 18 L86 48 V88 H14z" fill={W} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        <rect x="40" y="60" width="20" height="28" fill="#C4B5FD" stroke={S} strokeWidth="2" />
        <path d="M36 44 a20 20 0 0 1 28 0 M42 50 a10 10 0 0 1 16 0" fill="none" stroke="#8B5CF6" strokeWidth="3" strokeLinecap="round" />
        <circle cx="50" cy="55" r="2.5" fill="#8B5CF6" />
      </>
    ),
  },

  // ---------- Видеонаблюдение ----------
  camera: {
    bg: "bg-indigo-50",
    svg: (
      <>
        <rect x="10" y="14" width="10" height="30" rx="2" fill="#94A3B8" stroke={S} strokeWidth="2" />
        <path d="M20 28 h10 l6 10" fill="none" stroke={S} strokeWidth="4" />
        <rect x="30" y="30" width="52" height="26" rx="8" fill={W} stroke={S} strokeWidth="2.5" transform="rotate(12 56 43)" />
        <circle cx="78" cy="52" r="8" fill="#1E293B" />
        <circle cx="78" cy="52" r="3.5" fill="#60A5FA" />
        <circle cx="44" cy="36" r="2.5" fill={R} />
      </>
    ),
  },
  dvr: {
    bg: "bg-indigo-50",
    svg: (
      <>
        <rect x="10" y="40" width="80" height="28" rx="4" fill="#1E293B" stroke={S} strokeWidth="2.5" />
        {[20, 28, 36].map((x) => (
          <circle key={x} cx={x} cy="54" r="2.5" fill={E} />
        ))}
        <rect x="50" y="49" width="32" height="10" rx="2" fill="#334155" />
        <text x="66" y="57" textAnchor="middle" fontSize="7" fontWeight="700" fill="#34D399" fontFamily="monospace">REC</text>
        <rect x="18" y="68" width="6" height="4" fill={S} />
        <rect x="76" y="68" width="6" height="4" fill={S} />
        <path d="M30 40 v-16 h-10 M70 40 v-16 h10" fill="none" stroke="#94A3B8" strokeWidth="3" />
      </>
    ),
  },
  cameraCable: {
    bg: "bg-indigo-50",
    svg: (
      <>
        <circle cx="50" cy="56" r="26" fill="none" stroke="#475569" strokeWidth="9" />
        <circle cx="50" cy="56" r="14" fill="none" stroke="#64748B" strokeWidth="7" />
        <path d="M76 56 C88 56, 88 20, 70 16" fill="none" stroke="#475569" strokeWidth="6" />
        <rect x="56" y="10" width="16" height="10" rx="2" fill={B} stroke={S} strokeWidth="2" />
      </>
    ),
  },
  remote: {
    bg: "bg-indigo-50",
    svg: (
      <>
        <rect x="30" y="8" width="40" height="84" rx="8" fill="#1E293B" stroke={S} strokeWidth="2.5" />
        <rect x="35" y="16" width="30" height="64" rx="3" fill="#C7D2FE" />
        <rect x="38" y="22" width="11" height="12" rx="1" fill="#6366F1" />
        <rect x="51" y="22" width="11" height="12" rx="1" fill="#818CF8" />
        <rect x="38" y="37" width="11" height="12" rx="1" fill="#818CF8" />
        <rect x="51" y="37" width="11" height="12" rx="1" fill="#6366F1" />
        <circle cx="50" cy="66" r="7" fill={E} />
        <path d="M47 66 l2 2 4 -4" stroke={W} strokeWidth="2" fill="none" strokeLinecap="round" />
      </>
    ),
  },

  // ---------- Уборка ----------
  broom: {
    bg: "bg-teal-50",
    svg: (
      <>
        <rect x="56" y="6" width="7" height="50" rx="3" fill={C} stroke={S} strokeWidth="2" transform="rotate(20 60 30)" />
        <path d="M38 52 h30 l6 34 h-42z" fill="#FDE68A" stroke={S} strokeWidth="2.5" transform="rotate(20 52 70)" />
        <path d="M12 72 h26 l-3 20 h-20z" fill={B} stroke={S} strokeWidth="2.5" />
        <path d="M12 72 q13 -8 26 0" fill="none" stroke={S} strokeWidth="2" />
        <circle cx="78" cy="22" r="3" fill="#99F6E4" />
        <circle cx="86" cy="32" r="2" fill="#99F6E4" />
      </>
    ),
  },
  bucket: {
    bg: "bg-teal-50",
    svg: (
      <>
        <path d="M24 38 h52 l-6 50 h-40z" fill={B} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M24 38 a26 22 0 0 1 52 0" fill="none" stroke={S} strokeWidth="2.5" />
        <ellipse cx="50" cy="38" rx="26" ry="5" fill="#BFDBFE" stroke={S} strokeWidth="2" />
        <circle cx="42" cy="30" r="6" fill={W} stroke="#CBD5E1" />
        <circle cx="54" cy="27" r="5" fill={W} stroke="#CBD5E1" />
        <rect x="60" y="8" width="6" height="36" rx="3" fill={O} stroke={S} strokeWidth="2" />
      </>
    ),
  },
  windowClean: {
    bg: "bg-cyan-50",
    svg: (
      <>
        <rect x="12" y="10" width="62" height="78" rx="3" fill="#E0F2FE" stroke={S} strokeWidth="2.5" />
        <line x1="43" y1="10" x2="43" y2="88" stroke={S} strokeWidth="2.5" />
        <path d="M20 22 l12 -6 M20 34 l16 -10" stroke={W} strokeWidth="3" strokeLinecap="round" />
        <rect x="58" y="44" width="32" height="8" rx="2" fill={E} stroke={S} strokeWidth="2" />
        <rect x="71" y="52" width="6" height="30" rx="3" fill="#94A3B8" stroke={S} strokeWidth="2" />
        <circle cx="30" cy="62" r="3" fill="#7DD3FC" />
        <circle cx="24" cy="72" r="2" fill="#7DD3FC" />
      </>
    ),
  },
  sofa: {
    bg: "bg-rose-50",
    svg: (
      <>
        <rect x="18" y="30" width="64" height="30" rx="8" fill="#FDA4AF" stroke={S} strokeWidth="2.5" />
        <rect x="8" y="46" width="18" height="30" rx="6" fill="#FB7185" stroke={S} strokeWidth="2.5" />
        <rect x="74" y="46" width="18" height="30" rx="6" fill="#FB7185" stroke={S} strokeWidth="2.5" />
        <rect x="24" y="56" width="52" height="20" rx="4" fill="#FECDD3" stroke={S} strokeWidth="2.5" />
        <path d="M44 22 l3 -6 3 6 6 3 -6 3 -3 6 -3 -6 -6 -3z" fill="#FCD34D" />
        <rect x="16" y="76" width="5" height="8" fill={S} />
        <rect x="79" y="76" width="5" height="8" fill={S} />
      </>
    ),
  },
  office: {
    bg: "bg-teal-50",
    svg: (
      <>
        <rect x="10" y="50" width="80" height="6" rx="2" fill={C} stroke={S} strokeWidth="2" />
        <rect x="16" y="56" width="5" height="32" fill={S} />
        <rect x="79" y="56" width="5" height="32" fill={S} />
        <rect x="30" y="18" width="40" height="28" rx="3" fill="#1E293B" stroke={S} strokeWidth="2" />
        <rect x="34" y="22" width="32" height="20" rx="1" fill="#99F6E4" />
        <rect x="46" y="46" width="8" height="4" fill={S} />
        <path d="M74 20 l2 -4 2 4 4 2 -4 2 -2 4 -2 -4 -4 -2z" fill="#FCD34D" />
      </>
    ),
  },
  kitchenClean: {
    bg: "bg-teal-50",
    svg: (
      <>
        <rect x="12" y="48" width="76" height="40" rx="3" fill={W} stroke={S} strokeWidth="2.5" />
        <circle cx="32" cy="60" r="6" fill="#1E293B" />
        <circle cx="56" cy="60" r="6" fill="#1E293B" />
        <rect x="22" y="72" width="56" height="10" rx="2" fill="#E2E8F0" stroke={S} strokeWidth="2" />
        <rect x="62" y="14" width="16" height="28" rx="4" fill={E} stroke={S} strokeWidth="2.5" />
        <path d="M66 14 v-6 h14" fill="none" stroke={S} strokeWidth="2.5" />
        <circle cx="84" cy="8" r="2" fill="#99F6E4" />
      </>
    ),
  },

  // ---------- Кондиционеры ----------
  ac: {
    bg: "bg-cyan-50",
    svg: (
      <>
        <rect x="8" y="24" width="84" height="34" rx="8" fill={W} stroke={S} strokeWidth="2.5" />
        <rect x="14" y="46" width="72" height="4" rx="2" fill="#CBD5E1" />
        <circle cx="80" cy="34" r="2.5" fill={E} />
        <path d="M26 66 q4 8 0 16 M44 66 q4 8 0 16 M62 66 q4 8 0 16" fill="none" stroke="#67E8F9" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  acClean: {
    bg: "bg-cyan-50",
    svg: (
      <>
        <rect x="8" y="18" width="84" height="34" rx="8" fill={W} stroke={S} strokeWidth="2.5" />
        <rect x="14" y="40" width="72" height="4" rx="2" fill="#CBD5E1" />
        <rect x="26" y="60" width="36" height="24" rx="3" fill="#E0F2FE" stroke={S} strokeWidth="2" />
        {[32, 38, 44, 50, 56].map((x) => (
          <line key={x} x1={x} y1="62" x2={x} y2="82" stroke="#7DD3FC" strokeWidth="2" />
        ))}
        <path d="M72 58 l4 -8 4 8 8 4 -8 4 -4 8 -4 -8 -8 -4z" fill="#FCD34D" />
      </>
    ),
  },
  freon: {
    bg: "bg-sky-50",
    svg: (
      <>
        <rect x="30" y="24" width="40" height="66" rx="14" fill="#38BDF8" stroke={S} strokeWidth="2.5" />
        <rect x="42" y="12" width="16" height="14" rx="3" fill="#94A3B8" stroke={S} strokeWidth="2" />
        <rect x="46" y="6" width="8" height="8" rx="2" fill={S} />
        <rect x="36" y="46" width="28" height="18" rx="3" fill={W} />
        <text x="50" y="58.5" textAnchor="middle" fontSize="8" fontWeight="800" fill="#0369A1" fontFamily="sans-serif">R410</text>
      </>
    ),
  },
  acRepair: {
    bg: "bg-cyan-50",
    svg: (
      <>
        <rect x="8" y="18" width="84" height="34" rx="8" fill={W} stroke={S} strokeWidth="2.5" />
        <rect x="14" y="40" width="72" height="4" rx="2" fill="#CBD5E1" />
        <path d="M40 62 l28 28" stroke="#94A3B8" strokeWidth="8" strokeLinecap="round" />
        <circle cx="36" cy="60" r="10" fill="none" stroke="#94A3B8" strokeWidth="7" />
        <rect x="30" y="50" width="8" height="10" fill="#ECFEFF" transform="rotate(-45 34 55)" />
      </>
    ),
  },
  acRemove: {
    bg: "bg-cyan-50",
    svg: (
      <>
        <rect x="8" y="30" width="84" height="34" rx="8" fill={W} stroke={S} strokeWidth="2.5" transform="rotate(-8 50 47)" />
        <path d="M50 76 v16 m-8 -8 l8 8 8 -8" fill="none" stroke={R} strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
        <path d="M20 16 l8 8 m0 -8 l-8 8" stroke={S} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },

  // ---------- Отопление ----------
  radiator: {
    bg: "bg-red-50",
    svg: (
      <>
        {[18, 30, 42, 54, 66].map((x) => (
          <rect key={x} x={x} y="26" width="10" height="56" rx="5" fill={W} stroke={S} strokeWidth="2.5" />
        ))}
        <rect x="12" y="34" width="68" height="5" fill="#CBD5E1" />
        <rect x="12" y="70" width="68" height="5" fill="#CBD5E1" />
        <path d="M84 72 h8" stroke={S} strokeWidth="4" />
        <path d="M30 18 q3 -5 0 -10 M46 18 q3 -5 0 -10 M62 18 q3 -5 0 -10" fill="none" stroke={R} strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
  },
  flush: {
    bg: "bg-red-50",
    svg: (
      <>
        {[18, 30, 42, 54].map((x) => (
          <rect key={x} x={x} y="30" width="10" height="50" rx="5" fill={W} stroke={S} strokeWidth="2.5" />
        ))}
        <path d="M66 70 h14 v-40" fill="none" stroke="#94A3B8" strokeWidth="5" />
        <path d="M80 26 q6 -10 0 -18 q-6 8 0 18" fill={B} />
        <path d="M20 90 q10 -6 20 0 t20 0 t20 0" fill="none" stroke="#60A5FA" strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  gasBoiler: {
    bg: "bg-orange-50",
    svg: (
      <>
        <rect x="24" y="8" width="52" height="68" rx="6" fill={W} stroke={S} strokeWidth="2.5" />
        <rect x="32" y="16" width="36" height="14" rx="2" fill="#0F172A" />
        <text x="50" y="26.5" textAnchor="middle" fontSize="8" fontWeight="700" fill="#FB923C" fontFamily="monospace">60°C</text>
        <path d="M50 38 c8 8 6 18 0 22 c-6 -4 -8 -14 0 -22z" fill={O} />
        <path d="M50 48 c3 3 3 8 0 10 c-3 -2 -3 -7 0 -10z" fill={R} />
        {[34, 44, 56, 66].map((x) => (
          <rect key={x} x={x - 2} y="76" width="4" height="16" fill="#94A3B8" />
        ))}
      </>
    ),
  },
  floorHeat: {
    bg: "bg-orange-50",
    svg: (
      <>
        <path d="M10 70 L40 50 H90 L60 70z" fill="#FDE68A" stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M22 64 L46 54 h8 L30 64 h8 L62 54 h8 L46 64 h8 L78 54" fill="none" stroke={R} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M10 70 v8 h50 v-8" fill="#FCD34D" stroke={S} strokeWidth="2.5" />
        <path d="M36 38 q3 -5 0 -10 M50 36 q3 -5 0 -10 M64 38 q3 -5 0 -10" fill="none" stroke={O} strokeWidth="2.5" strokeLinecap="round" />
      </>
    ),
  },

  // ---------- Малярные ----------
  roller: {
    bg: "bg-fuchsia-50",
    svg: (
      <>
        <rect x="10" y="10" width="80" height="34" fill="#F5D0FE" />
        <rect x="18" y="16" width="56" height="18" rx="6" fill="#E879F9" stroke={S} strokeWidth="2.5" />
        <path d="M74 25 h8 v18 h-32 v10" fill="none" stroke={S} strokeWidth="3" />
        <rect x="45" y="53" width="10" height="36" rx="4" fill={O} stroke={S} strokeWidth="2.5" />
      </>
    ),
  },
  ceilingPaint: {
    bg: "bg-fuchsia-50",
    svg: (
      <>
        <rect x="6" y="6" width="88" height="14" fill="#F5D0FE" />
        <rect x="22" y="20" width="56" height="16" rx="6" fill="#E879F9" stroke={S} strokeWidth="2.5" />
        <path d="M50 36 v58" stroke={O} strokeWidth="6" strokeLinecap="round" />
        <path d="M78 28 h6 v14 h-34" fill="none" stroke={S} strokeWidth="3" />
      </>
    ),
  },
  facade: {
    bg: "bg-fuchsia-50",
    svg: (
      <>
        <rect x="14" y="20" width="72" height="72" fill="#FDE68A" stroke={S} strokeWidth="2.5" />
        <rect x="14" y="20" width="36" height="72" fill="#F0ABFC" stroke={S} strokeWidth="2.5" />
        {[30, 56].map((y) => (
          <g key={y}>
            <rect x="22" y={y} width="16" height="16" fill="#BFDBFE" stroke={S} strokeWidth="2" />
            <rect x="60" y={y} width="16" height="16" fill="#BFDBFE" stroke={S} strokeWidth="2" />
          </g>
        ))}
        <path d="M8 20 L50 4 L92 20z" fill={R} stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
      </>
    ),
  },
  paintPipe: {
    bg: "bg-fuchsia-50",
    svg: (
      <>
        {[16, 28, 40].map((x) => (
          <rect key={x} x={x} y="30" width="10" height="54" rx="5" fill={x === 16 ? "#F0ABFC" : W} stroke={S} strokeWidth="2.5" />
        ))}
        <rect x="58" y="14" width="22" height="16" rx="3" fill="#E879F9" stroke={S} strokeWidth="2.5" />
        <rect x="64" y="30" width="10" height="8" fill="#94A3B8" />
        <rect x="66" y="38" width="6" height="40" rx="3" fill={O} stroke={S} strokeWidth="2" />
      </>
    ),
  },
  decor: {
    bg: "bg-fuchsia-50",
    svg: (
      <>
        <rect x="10" y="10" width="80" height="80" rx="6" fill="#FAE8FF" stroke={S} strokeWidth="2.5" />
        <path d="M10 60 q20 -30 40 0 t40 0 V90 H10z" fill="#E879F9" />
        <path d="M10 44 q20 -20 40 0 t40 0" fill="none" stroke="#C026D3" strokeWidth="3" />
        <circle cx="28" cy="26" r="6" fill="#FCD34D" />
      </>
    ),
  },

  // ---------- Полы ----------
  laminate: {
    bg: "bg-amber-50",
    svg: (
      <>
        {[0, 1, 2, 3].map((r) => (
          <g key={r}>
            <rect x={r % 2 ? 10 : -10} y={14 + r * 18} width="50" height="16" fill={r % 2 ? "#D97706" : "#F59E0B"} stroke={S} strokeWidth="2" />
            <rect x={r % 2 ? 60 : 40} y={14 + r * 18} width="50" height="16" fill={r % 2 ? "#F59E0B" : "#D97706"} stroke={S} strokeWidth="2" />
          </g>
        ))}
      </>
    ),
  },
  linoleum: {
    bg: "bg-amber-50",
    svg: (
      <>
        <rect x="10" y="46" width="60" height="40" fill="#A7F3D0" stroke={S} strokeWidth="2.5" />
        <path d="M10 56 h60 M10 66 h60 M10 76 h60" stroke="#6EE7B7" strokeWidth="2" />
        <rect x="56" y="20" width="30" height="66" rx="15" fill="#6EE7B7" stroke={S} strokeWidth="2.5" />
        <ellipse cx="71" cy="26" rx="15" ry="6" fill="#A7F3D0" stroke={S} strokeWidth="2.5" />
      </>
    ),
  },
  screed: {
    bg: "bg-stone-100",
    svg: (
      <>
        <path d="M6 70 L36 52 H94 L64 70z" fill="#D6D3D1" stroke={S} strokeWidth="2.5" strokeLinejoin="round" />
        <path d="M6 70 v10 h58 v-10" fill="#A8A29E" stroke={S} strokeWidth="2.5" />
        <rect x="40" y="34" width="44" height="8" rx="2" fill="#CBD5E1" stroke={S} strokeWidth="2" transform="rotate(-10 62 38)" />
        <rect x="58" y="14" width="6" height="22" rx="3" fill={C} stroke={S} strokeWidth="2" />
      </>
    ),
  },
  parquet: {
    bg: "bg-amber-50",
    svg: (
      <>
        {[0, 1, 2, 3].map((r) =>
          [0, 1, 2, 3].map((c) => {
            const x = 10 + c * 20;
            const y = 10 + r * 20;
            const vertical = (r + c) % 2 === 0;
            return (
              <g key={`${r}${c}`}>
                <rect x={x} y={y} width="20" height="20" fill={vertical ? "#D97706" : "#F59E0B"} stroke={S} strokeWidth="1.5" />
                {vertical ? <line x1={x + 10} y1={y} x2={x + 10} y2={y + 20} stroke={S} strokeWidth="1" /> : <line x1={x} y1={y + 10} x2={x + 20} y2={y + 10} stroke={S} strokeWidth="1" />}
              </g>
            );
          }),
        )}
      </>
    ),
  },

  // ---------- Другие ----------
  hammer: {
    bg: "bg-slate-100",
    svg: (
      <>
        <rect x="46" y="30" width="10" height="60" rx="4" fill={C} stroke={S} strokeWidth="2.5" transform="rotate(-30 51 60)" />
        <path d="M24 26 h40 l8 6 v8 h-48z" fill="#94A3B8" stroke={S} strokeWidth="2.5" transform="rotate(-30 48 33)" />
        <path d="M70 70 l8 8 m-4 -12 l10 10" stroke={O} strokeWidth="3" strokeLinecap="round" />
      </>
    ),
  },
  curtain: {
    bg: "bg-rose-50",
    svg: (
      <>
        <rect x="8" y="14" width="84" height="5" rx="2.5" fill="#94A3B8" stroke={S} strokeWidth="2" />
        <circle cx="8" cy="16.5" r="4" fill={S} />
        <circle cx="92" cy="16.5" r="4" fill={S} />
        <path d="M14 19 h28 v70 q-14 -6 -28 0z" fill="#FDA4AF" stroke={S} strokeWidth="2" />
        <path d="M58 19 h28 v70 q-14 -6 -28 0z" fill="#FDA4AF" stroke={S} strokeWidth="2" />
        <path d="M22 22 v60 M34 22 v60 M66 22 v60 M78 22 v60" stroke="#FB7185" strokeWidth="1.5" />
      </>
    ),
  },
  mirror: {
    bg: "bg-sky-50",
    svg: (
      <>
        <ellipse cx="50" cy="50" rx="30" ry="40" fill="#E0F2FE" stroke={C} strokeWidth="6" />
        <path d="M36 32 l14 -10 M36 46 l22 -16" stroke={W} strokeWidth="4" strokeLinecap="round" />
      </>
    ),
  },
  tv: {
    bg: "bg-slate-100",
    svg: (
      <>
        <rect x="8" y="18" width="84" height="52" rx="4" fill="#1E293B" stroke={S} strokeWidth="2.5" />
        <rect x="13" y="23" width="74" height="42" rx="2" fill="#38BDF8" />
        <path d="M13 55 q20 -18 37 -6 t37 -8 V65 H13z" fill="#0EA5E9" />
        <rect x="40" y="70" width="20" height="4" fill="#475569" />
        <rect x="30" y="74" width="40" height="4" rx="2" fill="#475569" />
      </>
    ),
  },
  accessories: {
    bg: "bg-slate-100",
    svg: (
      <>
        <rect x="14" y="20" width="36" height="60" rx="3" fill="#E2E8F0" stroke={S} strokeWidth="2.5" />
        <circle cx="32" cy="36" r="6" fill={W} stroke={S} strokeWidth="2" />
        <rect x="24" y="52" width="16" height="4" rx="2" fill={S} />
        <path d="M58 30 h28 M58 30 v8 M86 30 v8" stroke={S} strokeWidth="3" strokeLinecap="round" />
        <rect x="60" y="50" width="24" height="30" rx="4" fill={W} stroke={S} strokeWidth="2.5" />
        <rect x="66" y="44" width="12" height="6" rx="2" fill="#94A3B8" />
      </>
    ),
  },
};

// Порядок важен: сначала самые точные совпадения.
const RULES: Array<[RegExp, string]> = [
  [/сч[её]тчик[а-я]*\s+вод/i, "waterMeter"],
  [/сч[её]тчик/i, "elMeter"],
  [/щит/i, "panel"],
  [/автомат/i, "breaker"],
  [/диагност/i, "multimeter"],
  [/кабел[а-я]*\s+для\s+камер/i, "cameraCable"],
  [/розет/i, "socket"],
  [/умн[а-я]*\s+освещ/i, "smartBulb"],
  [/выключ/i, "switch"],
  [/люстр|светил|освещ/i, "chandelier"],
  [/провод/i, "wiring"],
  [/покрас[а-я]*\s+труб|батаре[йя]/i, "paintPipe"],
  [/смесит/i, "faucet"],
  [/унитаз/i, "toilet"],
  [/канализ|прочист|засор/i, "plunger"],
  [/раковин/i, "sink"],
  [/бойлер|водонагрев/i, "boiler"],
  [/душ/i, "shower"],
  [/труб/i, "pipe"],
  [/шпакл/i, "spatula"],
  [/штукатур/i, "trowel"],
  [/обо[ияев]/i, "wallpaper"],
  [/плитк/i, "tiles"],
  [/гипсокартон/i, "drywall"],
  [/откос|про[её]м/i, "window"],
  [/уборк[а-я]*\s+кухн/i, "kitchenClean"],
  [/шкаф/i, "wardrobe"],
  [/кухн/i, "kitchen"],
  [/умн[а-я]*\s+зам/i, "smartLock"],
  [/зам[оак]/i, "lock"],
  [/двер/i, "door"],
  [/полк|полок/i, "shelves"],
  [/домофон/i, "intercom"],
  [/датчик/i, "sensor"],
  [/умн[а-я]*\s+дом/i, "smartHub"],
  [/регистратор/i, "dvr"],
  [/удал[её]нн/i, "remote"],
  [/камер|cctv|видеонаблюд/i, "camera"],
  [/окон|окна/i, "windowClean"],
  [/химчист/i, "sofa"],
  [/после\s+ремонт/i, "bucket"],
  [/офис/i, "office"],
  [/уборк|клининг/i, "broom"],
  [/фреон/i, "freon"],
  [/демонтаж[а-я]*\s+кондиц/i, "acRemove"],
  [/чистк[а-я]*\s+кондиц/i, "acClean"],
  [/ремонт[а-я]*\s+кондиц/i, "acRepair"],
  [/кондиц/i, "ac"],
  [/промывк/i, "flush"],
  [/радиатор/i, "radiator"],
  [/котл|кот[её]л/i, "gasBoiler"],
  [/т[её]пл[а-я]*\s+пол/i, "floorHeat"],
  [/фасад/i, "facade"],
  [/потол/i, "ceilingPaint"],
  [/декор/i, "decor"],
  [/покрас|малян/i, "roller"],
  [/ламинат/i, "laminate"],
  [/линолеум/i, "linoleum"],
  [/стяжк|наливн/i, "screed"],
  [/паркет/i, "parquet"],
  [/(^|\s)пол[аыу]?(\s|$)/i, "laminate"],
  [/карниз|штор/i, "curtain"],
  [/зеркал/i, "mirror"],
  [/телевиз/i, "tv"],
  [/аксессуар/i, "accessories"],
  [/мелк|ремонт/i, "hammer"],
];

export const pickServiceArtKey = (text: string) => RULES.find(([re]) => re.test(text))?.[1];

export function ServiceIllustration({
  name,
  fallbackIcon,
  className = "h-24 w-24 sm:h-28 sm:w-28",
}: {
  name: string;
  fallbackIcon?: ReactNode;
  className?: string;
}) {
  const key = pickServiceArtKey(name);
  const art = key ? ART[key] : undefined;

  return (
    <div className={`flex shrink-0 items-center justify-center overflow-hidden rounded-2xl ${art?.bg || "bg-slate-100"} ${className}`}>
      {art?.img ? (
        <img src={art.img} alt="" loading="lazy" className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
      ) : art?.svg ? (
        <svg viewBox="0 0 100 100" className="h-[78%] w-[78%] transition-transform duration-300 group-hover:scale-105" aria-hidden="true">
          {art.svg}
        </svg>
      ) : (
        fallbackIcon
      )}
    </div>
  );
}

export default ServiceIllustration;
