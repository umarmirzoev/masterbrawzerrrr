import { useId } from "react";

type FlagCode = "ru" | "tj" | "en";

// SVG-флаги: эмодзи-флаги 🇷🇺🇹🇯🇬🇧 в Windows не рисуются (там видны буквы RU/TJ/GB).
export function FlagIcon({ code, className = "h-4 w-6" }: { code: FlagCode; className?: string }) {
  const uid = useId().replace(/:/g, "");
  const frame = `${className} shrink-0 overflow-hidden rounded-[3px] shadow-[0_0_0_1px_rgba(15,23,42,0.12)]`;

  if (code === "ru") {
    return (
      <svg viewBox="0 0 9 6" className={frame} aria-hidden="true" preserveAspectRatio="none">
        <rect width="9" height="2" fill="#fff" />
        <rect y="2" width="9" height="2" fill="#0039A6" />
        <rect y="4" width="9" height="2" fill="#D52B1E" />
      </svg>
    );
  }

  if (code === "tj") {
    const stars = [-3, -2, -1, 0, 1, 2, 3].map((i) => {
      const angle = (i * 22 * Math.PI) / 180;
      return { x: 14 + Math.sin(angle) * 3.1, y: 7.9 - Math.cos(angle) * 3.1 };
    });
    return (
      <svg viewBox="0 0 28 14" className={frame} aria-hidden="true" preserveAspectRatio="none">
        <rect width="28" height="4" fill="#CC0000" />
        <rect y="4" width="28" height="6" fill="#fff" />
        <rect y="10" width="28" height="4" fill="#006600" />
        <path d="M12.3 8.4h3.4l.35-1.5-1 .6-.55-1-.5.9-.5-.9-.55 1-1-.6z" fill="#F8C300" />
        {stars.map((s, i) => (
          <circle key={i} cx={s.x} cy={s.y} r="0.38" fill="#F8C300" />
        ))}
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 60 30" className={frame} aria-hidden="true" preserveAspectRatio="none">
      <defs>
        <clipPath id={`s${uid}`}>
          <path d="M0,0 v30 h60 v-30 z" />
        </clipPath>
        <clipPath id={`t${uid}`}>
          <path d="M30,15 h30 v15 z v15 h-30 z h-30 v-15 z v-15 h30 z" />
        </clipPath>
      </defs>
      <g clipPath={`url(#s${uid})`}>
        <path d="M0,0 v30 h60 v-30 z" fill="#012169" />
        <path d="M0,0 L60,30 M60,0 L0,30" stroke="#fff" strokeWidth="6" />
        <path d="M0,0 L60,30 M60,0 L0,30" clipPath={`url(#t${uid})`} stroke="#C8102E" strokeWidth="4" />
        <path d="M30,0 v30 M0,15 h60" stroke="#fff" strokeWidth="10" />
        <path d="M30,0 v30 M0,15 h60" stroke="#C8102E" strokeWidth="6" />
      </g>
    </svg>
  );
}

export default FlagIcon;
