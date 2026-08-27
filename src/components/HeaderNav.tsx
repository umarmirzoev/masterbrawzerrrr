import { useCallback, useLayoutEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { useLanguage } from "@/contexts/LanguageContext";

interface HeaderNavProps {
  items: { path: string; labelKey: string }[];
}

/** Сколько копий списка рендерим, чтобы прокрутка была бесшовно бесконечной. */
const COPIES = 5;
/** С какой копии стартуем — остаётся запас в обе стороны. */
const START_COPY = 2;
/** Сколько пунктов видно одновременно. */
const VISIBLE_ITEMS = 5;

/** Классы, определяющие натуральную ширину пункта (нужны и для скрытого измерителя). */
const ITEM_METRIC_CLASS = "px-1 py-2 text-sm font-bold whitespace-nowrap";

/**
 * Горизонтальное бесконечное меню шапки — карусель со snap по одному пункту.
 *
 * Все пункты приводятся к одной ширине (по самому широкому), поэтому в окне
 * всегда помещается ровно VISIBLE_ITEMS целых пунктов: ширина окна =
 * VISIBLE_ITEMS * ширина пункта + промежутки. scroll-snap-align: start на каждом
 * пункте + scroll-snap-type: x mandatory дают шаг ровно в один элемент —
 * «1 2 3 4» превращается в «2 3 4 5», обрезанных пунктов не бывает.
 *
 * Список продублирован COPIES раз; при выходе за безопасную полосу scrollLeft
 * переносится на длину цикла (содержимое там идентичное, поэтому скачок не виден),
 * так что после «Контакты» снова идёт «Главная» и наоборот — бесконечно.
 */
export default function HeaderNav({ items }: HeaderNavProps) {
  const { t } = useLanguage();
  const location = useLocation();
  const isActive = (path: string) => location.pathname === path;

  const viewportRef = useRef<HTMLElement>(null);
  const trackRef = useRef<HTMLDivElement>(null);
  const sizerRef = useRef<HTMLDivElement>(null);

  const [metrics, setMetrics] = useState({ item: 0, window: 0 });
  const loopRef = useRef(0);
  const positionedRef = useRef(false);

  // Ширина пункта = самый широкий из натуральных (текст никогда не обрезается),
  // ширина окна = ровно VISIBLE_ITEMS таких пунктов вместе с промежутками.
  const measure = useCallback(() => {
    const track = trackRef.current;
    const sizer = sizerRef.current;
    if (!track || !sizer) return;

    const gap = parseFloat(getComputedStyle(track).columnGap || "0") || 0;
    const widths = Array.from(sizer.children).map((child) => child.getBoundingClientRect().width);
    if (!widths.length) return;

    const item = Math.ceil(Math.max(...widths));
    if (!item) return;

    const visible = Math.min(VISIBLE_ITEMS, items.length);
    const windowWidth = visible * item + (visible - 1) * gap;
    loopRef.current = items.length * (item + gap);

    setMetrics((prev) =>
      Math.abs(prev.item - item) < 0.5 && Math.abs(prev.window - windowWidth) < 0.5
        ? prev
        : { item, window: windowWidth },
    );
  }, [items.length]);

  useLayoutEffect(() => {
    measure();
    const sizer = sizerRef.current;
    if (!sizer || typeof ResizeObserver === "undefined") return;
    const observer = new ResizeObserver(() => measure());
    observer.observe(sizer);
    return () => observer.disconnect();
  }, [measure]);

  // Стартовая позиция — середина копий, ставится уже после применения ширины.
  useLayoutEffect(() => {
    const viewport = viewportRef.current;
    if (!viewport || positionedRef.current) return;
    if (!metrics.window || loopRef.current <= 0) return;
    viewport.scrollLeft = loopRef.current * START_COPY;
    positionedRef.current = true;
  }, [metrics.window]);

  // Бесшовный перенос: держим scrollLeft внутри безопасной полосы.
  // Перенос всегда кратен шагу пункта, поэтому позиция остаётся snap-точкой.
  const normalize = useCallback(() => {
    const viewport = viewportRef.current;
    const loop = loopRef.current;
    if (!viewport || loop <= 0) return;
    const x = viewport.scrollLeft;
    if (x >= loop && x < loop * (COPIES - 2)) return;
    viewport.scrollLeft = loop + ((((x - loop) % loop) + loop) % loop);
  }, []);

  // Перетаскивание мышью (на тач-устройствах работает нативная прокрутка).
  const dragRef = useRef<{ startX: number; startScroll: number; moved: boolean; pointerId: number } | null>(null);
  const suppressClickRef = useRef(false);

  const handlePointerDown = (e: React.PointerEvent<HTMLElement>) => {
    suppressClickRef.current = false;
    if (e.pointerType === "touch" || e.button !== 0) return;
    const viewport = viewportRef.current;
    if (!viewport) return;
    dragRef.current = {
      startX: e.clientX,
      startScroll: viewport.scrollLeft,
      moved: false,
      pointerId: e.pointerId,
    };
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLElement>) => {
    const drag = dragRef.current;
    const viewport = viewportRef.current;
    if (!drag || !viewport) return;
    const dx = e.clientX - drag.startX;
    if (!drag.moved) {
      if (Math.abs(dx) < 4) return;
      drag.moved = true;
      suppressClickRef.current = true;
      try {
        viewport.setPointerCapture(drag.pointerId);
      } catch {
        /* noop */
      }
    }
    viewport.scrollLeft = drag.startScroll - dx;
  };

  const endDrag = () => {
    const drag = dragRef.current;
    const viewport = viewportRef.current;
    if (!drag) return;
    if (drag.moved && viewport) {
      try {
        viewport.releasePointerCapture(drag.pointerId);
      } catch {
        /* noop */
      }
    }
    dragRef.current = null;
  };

  // После перетаскивания гасим клик, чтобы не сработал переход по ссылке.
  const handleLinkClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (suppressClickRef.current) {
      e.preventDefault();
      e.stopPropagation();
      suppressClickRef.current = false;
    }
  };

  const itemStyle = metrics.item ? { width: `${metrics.item}px` } : undefined;

  return (
    <nav
      ref={viewportRef}
      className="hidden xl:flex items-center overflow-x-auto overscroll-x-contain scroll-auto snap-x snap-mandatory scrollbar-hide select-none"
      style={{ width: metrics.window ? `${metrics.window}px` : undefined }}
      onScroll={normalize}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={endDrag}
      onPointerCancel={endDrag}
    >
      {/* Невидимый измеритель натуральной ширины пунктов (вне потока, на прокрутку не влияет). */}
      <div
        ref={sizerRef}
        aria-hidden
        className="pointer-events-none flex items-center"
        style={{ position: "fixed", left: -9999, top: 0, visibility: "hidden" }}
      >
        {items.map((item) => (
          <span key={item.path} className={ITEM_METRIC_CLASS}>
            {t(item.labelKey)}
          </span>
        ))}
      </div>

      <div ref={trackRef} className="flex items-center gap-0.5 w-max shrink-0">
        {Array.from({ length: COPIES }).map((_, copy) => (
          <div
            key={copy}
            className="flex items-center gap-0.5 shrink-0"
            aria-hidden={copy !== START_COPY}
          >
            {items.map((item) => (
              <Link
                key={`${copy}-${item.path}`}
                to={item.path}
                draggable={false}
                tabIndex={copy === START_COPY ? undefined : -1}
                onClick={handleLinkClick}
                style={itemStyle}
                className={`snap-start snap-always shrink-0 flex items-center justify-center px-1 py-2 rounded-xl text-sm font-bold transition-all duration-300 group whitespace-nowrap ${
                  isActive(item.path)
                    ? "text-emerald-500"
                    : "text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
                }`}
              >
                <span className="relative">
                  {t(item.labelKey)}
                  <span className={`absolute -bottom-1 left-0 right-0 h-0.5 bg-emerald-500 rounded-full transition-all duration-300 transform origin-left ${isActive(item.path) ? "scale-x-100" : "scale-x-0 group-hover:scale-x-100"}`} />
                </span>
              </Link>
            ))}
          </div>
        ))}
      </div>
    </nav>
  );
}
