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
  socket: { bg: "bg-sky-50", img: "/images/services/el-socket.png" },
  switch: { bg: "bg-sky-50", img: "/images/services/el-switch.png" },
  chandelier: { bg: "bg-sky-50", img: "/images/services/el-chandelier.png" },
  wiring: { bg: "bg-sky-50", img: "/images/services/el-wiring.png" },

  // ---------- Электрика ----------
  panel: { bg: "bg-sky-50", img: "/images/services/el-panel.png" },
  breaker: { bg: "bg-sky-50", img: "/images/services/el-breaker.png" },
  elMeter: { bg: "bg-sky-50", img: "/images/services/el-meter.png" },
  multimeter: { bg: "bg-sky-50", img: "/images/services/el-multimeter.png" },

  // ---------- Сантехника ----------
  faucet: { bg: "bg-sky-50", img: "/images/services/faucet.png" },
  toilet: { bg: "bg-sky-50", img: "/images/services/toilet.png" },
  plunger: { bg: "bg-sky-50", img: "/images/services/drain.png" },
  sink: { bg: "bg-sky-50", img: "/images/services/sink.png" },
  pipe: { bg: "bg-sky-50", img: "/images/services/pipes.png" },
  boiler: { bg: "bg-sky-50", img: "/images/services/boiler.png" },
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
  waterMeter: { bg: "bg-sky-50", img: "/images/services/water-meter.png" },

  // ---------- Отделка ----------
  spatula: { bg: "bg-emerald-50", img: "/images/services/spatula.png" },
  trowel: { bg: "bg-emerald-50", img: "/images/services/trowel.png" },
  wallpaper: { bg: "bg-emerald-50", img: "/images/services/wallpaper.png" },
  tiles: { bg: "bg-emerald-50", img: "/images/services/tiles.png" },
  drywall: { bg: "bg-emerald-50", img: "/images/services/drywall.png" },
  window: { bg: "bg-emerald-50", img: "/images/services/window.png" },

  // ---------- Мебель и двери ----------
  wardrobe: { bg: "bg-emerald-50", img: "/images/services/wardrobe.png" },
  kitchen: { bg: "bg-emerald-50", img: "/images/services/kitchen.png" },
  doorAdjust: { bg: "bg-emerald-50", img: "/images/services/door-adjust.png" },
  door: { bg: "bg-emerald-50", img: "/images/services/door.png" },
  lock: { bg: "bg-emerald-50", img: "/images/services/door-lock.png" },
  shelves: { bg: "bg-emerald-50", img: "/images/services/shelves.png" },

  // ---------- Умный дом ----------
  intercom: { bg: "bg-emerald-50", img: "/images/services/intercom.png" },
  smartLock: { bg: "bg-emerald-50", img: "/images/services/smart-lock.png" },
  sensor: { bg: "bg-emerald-50", img: "/images/services/sensor.png" },
  smartBulb: { bg: "bg-emerald-50", img: "/images/services/smart-bulb.png" },
  smartHub: { bg: "bg-emerald-50", img: "/images/services/smart-hub.png" },

  // ---------- Видеонаблюдение ----------
  cctvService: { bg: "bg-emerald-50", img: "/images/services/cctv-service.png" },
  camera: { bg: "bg-sky-50", img: "/images/services/cctv-camera.png" },
  dvr: { bg: "bg-sky-50", img: "/images/services/dvr.png" },
  cameraCable: { bg: "bg-sky-50", img: "/images/services/camera-cable.png" },
  remote: { bg: "bg-sky-50", img: "/images/services/remote-access.png" },

  // ---------- Уборка ----------
  broom: { bg: "bg-emerald-50", img: "/images/services/clean-general.png" },
  bucket: { bg: "bg-emerald-50", img: "/images/services/clean-after-repair.png" },
  windowClean: { bg: "bg-emerald-50", img: "/images/services/clean-windows.png" },
  sofa: { bg: "bg-emerald-50", img: "/images/services/clean-sofa.png" },
  office: { bg: "bg-emerald-50", img: "/images/services/clean-office.png" },
  kitchenClean: { bg: "bg-emerald-50", img: "/images/services/clean-kitchen.png" },

  // ---------- Кондиционеры ----------
  ac: { bg: "bg-cyan-50", img: "/images/services/ac-install.png" },
  acClean: { bg: "bg-cyan-50", img: "/images/services/ac-clean.png" },
  freon: { bg: "bg-cyan-50", img: "/images/services/ac-freon.png" },
  acRepair: { bg: "bg-cyan-50", img: "/images/services/ac-repair.png" },
  acRemove: { bg: "bg-cyan-50", img: "/images/services/ac-remove.png" },

  // ---------- Отопление ----------
  radiatorReplace: { bg: "bg-orange-50", img: "/images/services/heat-radiator-replace.png" },
  gasBoilerRepair: { bg: "bg-orange-50", img: "/images/services/heat-boiler-repair.png" },
  radiator: { bg: "bg-orange-50", img: "/images/services/heat-radiator.png" },
  flush: { bg: "bg-orange-50", img: "/images/services/heat-flush.png" },
  gasBoiler: { bg: "bg-orange-50", img: "/images/services/heat-boiler.png" },
  floorHeat: { bg: "bg-orange-50", img: "/images/services/heat-floor.png" },

  // ---------- Малярные ----------
  roller: { bg: "bg-emerald-50", img: "/images/services/paint-walls.png" },
  ceilingPaint: { bg: "bg-emerald-50", img: "/images/services/paint-ceiling.png" },
  facade: { bg: "bg-emerald-50", img: "/images/services/paint-facade.png" },
  paintPipe: { bg: "bg-emerald-50", img: "/images/services/paint-pipes.png" },
  decor: { bg: "bg-emerald-50", img: "/images/services/paint-decor.png" },

  // ---------- Полы ----------
  floorRepair: { bg: "bg-emerald-50", img: "/images/services/floor-repair.png" },
  selfLevel: { bg: "bg-emerald-50", img: "/images/services/floor-self-level.png" },
  laminate: { bg: "bg-emerald-50", img: "/images/services/floor-laminate.png" },
  linoleum: { bg: "bg-emerald-50", img: "/images/services/floor-linoleum.png" },
  screed: { bg: "bg-emerald-50", img: "/images/services/floor-screed.png" },
  parquet: { bg: "bg-emerald-50", img: "/images/services/floor-parquet.png" },

  // ---------- Другие ----------
  hammer: { bg: "bg-violet-50", img: "/images/services/other-small-repair.png" },
  curtain: { bg: "bg-violet-50", img: "/images/services/other-curtain.png" },
  mirror: { bg: "bg-violet-50", img: "/images/services/other-mirror.png" },
  tv: { bg: "bg-violet-50", img: "/images/services/other-tv.png" },
  accessories: { bg: "bg-violet-50", img: "/images/services/other-accessories.png" },
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
  [/регулиров[а-я]*\s+двер|петл/i, "doorAdjust"],
  [/двер/i, "door"],
  [/полк|полок/i, "shelves"],
  [/домофон/i, "intercom"],
  [/датчик/i, "sensor"],
  [/умн[а-я]*\s+дом/i, "smartHub"],
  [/регистратор/i, "dvr"],
  [/удал[её]нн/i, "remote"],
  [/обслуживан[а-я]*\s+(cctv|камер|видео)/i, "cctvService"],
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
  [/замен[а-я]*\s+радиатор/i, "radiatorReplace"],
  [/радиатор/i, "radiator"],
  [/ремонт[а-я]*\s+(котл|кот[её]л)/i, "gasBoilerRepair"],
  [/котл|кот[её]л/i, "gasBoiler"],
  [/т[её]пл[а-я]*\s+пол/i, "floorHeat"],
  [/фасад/i, "facade"],
  [/потол/i, "ceilingPaint"],
  [/декор/i, "decor"],
  [/покрас|малян/i, "roller"],
  [/ламинат/i, "laminate"],
  [/линолеум/i, "linoleum"],
  [/наливн/i, "selfLevel"],
  [/стяжк/i, "screed"],
  [/паркет/i, "parquet"],
  [/ремонт[а-я]*\s+пол[аыу]?(\s|$)/i, "floorRepair"],
  [/(^|\s)пол[аыу]?(\s|$)/i, "laminate"],
  [/карниз|штор/i, "curtain"],
  [/зеркал/i, "mirror"],
  [/телевиз/i, "tv"],
  [/аксессуар/i, "accessories"],
  [/сантехник/i, "faucet"],
  [/электрик/i, "panel"],
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
