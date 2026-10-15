"use client";

/**
 * ColorPicker, saturation/value canvas + hue/alpha rails + HEX/RGB/HSL fields.
 *
 * HSV is the internal source of truth so dragging through pure black or pure
 * white does not discard hue/saturation the way a hex round-trip would.
 * Chrome is token-driven; only the color surfaces themselves carry live values.
 */

import * as React from "react";
import { Pipette, ChevronsUpDown, Check } from "lucide-react";
import { Popover as PopoverPrimitive } from "radix-ui";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/* ─── color math ────────────────────────────────────────────── */

export interface Hsva {
  h: number;
  s: number;
  v: number;
  a: number;
}

export interface Rgba {
  r: number;
  g: number;
  b: number;
  a: number;
}

const clamp = (n: number, min = 0, max = 100) =>
  Math.min(max, Math.max(min, n));

const round = (n: number, digits = 0) => {
  const p = 10 ** digits;
  return Math.round(n * p) / p;
};

function hsvaToRgba({ h, s, v, a }: Hsva): Rgba {
  const hh = (((h % 360) + 360) % 360) / 60;
  const ss = s / 100;
  const vv = v / 100;
  const c = vv * ss;
  const x = c * (1 - Math.abs((hh % 2) - 1));
  const m = vv - c;
  const seg = Math.floor(hh) % 6;
  const segments: readonly (readonly [number, number, number])[] = [
    [c, x, 0],
    [x, c, 0],
    [0, c, x],
    [0, x, c],
    [x, 0, c],
    [c, 0, x],
  ];
  const [r, g, b] = segments[seg] ?? segments[0]!;
  return {
    r: Math.round((r + m) * 255),
    g: Math.round((g + m) * 255),
    b: Math.round((b + m) * 255),
    a,
  };
}

function rgbaToHsva({ r, g, b, a }: Rgba): Hsva {
  const rr = r / 255;
  const gg = g / 255;
  const bb = b / 255;
  const max = Math.max(rr, gg, bb);
  const min = Math.min(rr, gg, bb);
  const d = max - min;
  let h = 0;
  if (d !== 0) {
    if (max === rr) h = 60 * (((gg - bb) / d) % 6);
    else if (max === gg) h = 60 * ((bb - rr) / d + 2);
    else h = 60 * ((rr - gg) / d + 4);
  }
  if (h < 0) h += 360;
  return {
    h: round(h, 1),
    s: max === 0 ? 0 : round((d / max) * 100, 1),
    v: round(max * 100, 1),
    a,
  };
}

function hsvaToHsl({ h, s, v }: Hsva) {
  const vv = v / 100;
  const ss = s / 100;
  const l = vv * (1 - ss / 2);
  const sl = l === 0 || l === 1 ? 0 : (vv - l) / Math.min(l, 1 - l);
  return { h: Math.round(h), s: Math.round(sl * 100), l: Math.round(l * 100) };
}

function hslToHsva(h: number, s: number, l: number, a: number): Hsva {
  const ll = l / 100;
  const ss = s / 100;
  const v = ll + ss * Math.min(ll, 1 - ll);
  return {
    h: ((h % 360) + 360) % 360,
    s: v === 0 ? 0 : (2 * (1 - ll / v)) * 100,
    v: v * 100,
    a,
  };
}

const hex2 = (n: number) =>
  Math.round(clamp(n, 0, 255))
    .toString(16)
    .padStart(2, "0");

export function rgbaToHex({ r, g, b, a }: Rgba, withAlpha = false): string {
  const base = `#${hex2(r)}${hex2(g)}${hex2(b)}`.toUpperCase();
  if (!withAlpha || a >= 1) return base;
  return `${base}${hex2(a * 255).toUpperCase()}`;
}

/** Parses `#rgb`, `#rgba`, `#rrggbb`, `#rrggbbaa` (with or without `#`). */
export function parseHex(input: string): Rgba | null {
  const raw = input.trim().replace(/^#/, "");
  if (!/^([0-9a-f]{3,4}|[0-9a-f]{6}|[0-9a-f]{8})$/i.test(raw)) return null;
  const full =
    raw.length <= 4
      ? raw
          .split("")
          .map((c) => c + c)
          .join("")
      : raw;
  return {
    r: parseInt(full.slice(0, 2), 16),
    g: parseInt(full.slice(2, 4), 16),
    b: parseInt(full.slice(4, 6), 16),
    a: full.length === 8 ? parseInt(full.slice(6, 8), 16) / 255 : 1,
  };
}

/** WCAG relative luminance, used to pick a readable mark over a swatch. */
function isLightColor({ r, g, b }: Rgba) {
  const channel = (c: number) => {
    const v = c / 255;
    return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b) > 0.45;
}

function hsvaToCss(hsva: Hsva, withAlpha: boolean) {
  const { r, g, b, a } = hsvaToRgba(hsva);
  return withAlpha
    ? `rgba(${r}, ${g}, ${b}, ${round(a, 2)})`
    : `rgb(${r}, ${g}, ${b})`;
}

/* ─── shared chrome ─────────────────────────────────────────── */

export type ColorFormat = "hex" | "rgb" | "hsl";

const FORMAT_ORDER: ColorFormat[] = ["hex", "rgb", "hsl"];

const CHECKERBOARD_LAYER =
  "repeating-conic-gradient(color-mix(in srgb, var(--foreground) 26%, transparent) 0% 25%, transparent 0% 50%) 50% / 8px 8px";
const CHECKERBOARD_BASE = "var(--background)";
const CHECKERBOARD = `${CHECKERBOARD_LAYER}, ${CHECKERBOARD_BASE}`;

const thumbRingClass = cn(
  "pointer-events-none absolute block rounded-full",
  "border-2 border-white",
  "shadow-[0_0_0_1px_rgba(0,0,0,0.35),0_1px_4px_rgba(0,0,0,0.4)]",
);

const focusRing = cn(
  "outline-none",
  "focus-visible:ring-2 focus-visible:ring-[var(--accent)]",
  "focus-visible:ring-offset-1 focus-visible:ring-offset-[var(--surface)]",
);

/** Maps a pointer event to 0..1 coordinates inside `el`. */
function pointerRatio(
  el: HTMLElement,
  event: { clientX: number; clientY: number },
) {
  const rect = el.getBoundingClientRect();
  return {
    x:
      rect.width === 0
        ? 0
        : clamp((event.clientX - rect.left) / rect.width, 0, 1),
    y:
      rect.height === 0
        ? 0
        : clamp((event.clientY - rect.top) / rect.height, 0, 1),
  };
}

function useDrag(
  onMove: (el: HTMLElement, event: { clientX: number; clientY: number }) => void,
  disabled?: boolean,
) {
  const [dragging, setDragging] = React.useState(false);

  const onPointerDown = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (disabled || event.button !== 0) return;
      const el = event.currentTarget;
      el.setPointerCapture(event.pointerId);
      setDragging(true);
      el.focus();
      onMove(el, event);
    },
    [disabled, onMove],
  );

  const onPointerMove = React.useCallback(
    (event: React.PointerEvent<HTMLDivElement>) => {
      if (!dragging) return;
      event.preventDefault();
      onMove(event.currentTarget, event);
    },
    [dragging, onMove],
  );

  const stop = React.useCallback((event: React.PointerEvent<HTMLDivElement>) => {
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDragging(false);
  }, []);

  return {
    dragging,
    handlers: {
      onPointerDown,
      onPointerMove,
      onPointerUp: stop,
      onPointerCancel: stop,
    },
  };
}

/** Arrow/Home/End stepping shared by the canvas and both rails. */
function arrowStep(
  key: string,
  step: number,
  big: number,
): { dx: number; dy: number } | null {
  switch (key) {
    case "ArrowLeft":
      return { dx: -step, dy: 0 };
    case "ArrowRight":
      return { dx: step, dy: 0 };
    case "ArrowUp":
      return { dx: 0, dy: step };
    case "ArrowDown":
      return { dx: 0, dy: -step };
    case "PageUp":
      return { dx: big, dy: big };
    case "PageDown":
      return { dx: -big, dy: -big };
    default:
      return null;
  }
}

/* ─── saturation / value canvas ─────────────────────────────── */

function SaturationCanvas({
  hsva,
  onChange,
  disabled,
  className,
}: {
  hsva: Hsva;
  onChange: (next: { s: number; v: number }) => void;
  disabled?: boolean;
  className?: string;
}) {
  const apply = React.useCallback(
    (el: HTMLElement, event: { clientX: number; clientY: number }) => {
      const { x, y } = pointerRatio(el, event);
      onChange({ s: round(x * 100, 1), v: round((1 - y) * 100, 1) });
    },
    [onChange],
  );

  const { dragging, handlers } = useDrag(apply, disabled);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      onChange(event.key === "Home" ? { s: 0, v: 100 } : { s: 100, v: 100 });
      return;
    }
    const delta = arrowStep(event.key, event.shiftKey ? 10 : 1, 10);
    if (!delta) return;
    event.preventDefault();
    onChange({
      s: clamp(hsva.s + delta.dx),
      v: clamp(hsva.v + delta.dy),
    });
  };

  return (
    <div
      role="slider"
      aria-label="Độ bão hòa và độ sáng"
      aria-valuetext={`Độ bão hòa ${Math.round(hsva.s)}%, độ sáng ${Math.round(hsva.v)}%`}
      aria-disabled={disabled || undefined}
      data-dragging={dragging || undefined}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={onKeyDown}
      {...handlers}
      className={cn(
        "relative isolate w-full touch-none select-none",
        disabled
          ? "cursor-not-allowed"
          : dragging
            ? "cursor-grabbing"
            : "cursor-crosshair",
        focusRing,
        "focus-visible:ring-inset focus-visible:ring-offset-0",
        className,
      )}
      style={{ backgroundColor: `hsl(${hsva.h} 100% 50%)` }}
    >
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#fff,transparent)]" />
      <div className="absolute inset-0 bg-[linear-gradient(to_top,#000,transparent)]" />
      <span
        className={cn(
          thumbRingClass,
          "size-4 -translate-x-1/2 -translate-y-1/2",
        )}
        data-dragging={dragging || undefined}
        style={{
          left: `clamp(8px, ${hsva.s}%, calc(100% - 8px))`,
          top: `clamp(8px, ${100 - hsva.v}%, calc(100% - 8px))`,
          backgroundColor: hsvaToCss({ ...hsva, a: 1 }, false),
        }}
      />
    </div>
  );
}

/* ─── rails ─────────────────────────────────────────────────── */

function Rail({
  label,
  value,
  max,
  step = 1,
  valueText,
  trackStyle,
  thumbColor,
  onChange,
  disabled,
}: {
  label: string;
  value: number;
  max: number;
  step?: number;
  valueText: string;
  trackStyle: React.CSSProperties;
  thumbColor: string;
  onChange: (next: number) => void;
  disabled?: boolean;
}) {
  const apply = React.useCallback(
    (el: HTMLElement, event: { clientX: number; clientY: number }) => {
      onChange(round(pointerRatio(el, event).x * max, 2));
    },
    [max, onChange],
  );

  const { dragging, handlers } = useDrag(apply, disabled);

  const onKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    if (disabled) return;
    if (event.key === "Home" || event.key === "End") {
      event.preventDefault();
      onChange(event.key === "Home" ? 0 : max);
      return;
    }
    const unit = step * (event.shiftKey ? 10 : 1);
    const delta = arrowStep(event.key, unit, step * 10);
    if (!delta) return;
    event.preventDefault();
    onChange(round(clamp(value + (delta.dx || delta.dy), 0, max), 2));
  };

  return (
    <div
      role="slider"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={max}
      aria-valuenow={round(value, 1)}
      aria-valuetext={valueText}
      aria-disabled={disabled || undefined}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={onKeyDown}
      {...handlers}
      className={cn(
        "relative h-3 w-full touch-none select-none rounded-full",
        "shadow-[inset_0_0_0_1px_color-mix(in_srgb,var(--foreground)_14%,transparent)]",
        disabled
          ? "cursor-not-allowed"
          : dragging
            ? "cursor-grabbing"
            : "cursor-pointer",
        focusRing,
      )}
      style={trackStyle}
    >
      <span
        className={cn(
          thumbRingClass,
          "top-1/2 size-[18px] -translate-x-1/2 -translate-y-1/2",
        )}
        data-dragging={dragging || undefined}
        style={{
          left: `calc(9px + ${value / max} * (100% - 18px))`,
          background: thumbColor,
        }}
      />
    </div>
  );
}

/* ─── numeric + hex fields ──────────────────────────────────── */

const fieldShellClass = cn(
  "flex h-8 w-full items-center rounded-[var(--radius)]",
  "border border-[var(--border)] bg-[var(--bg)]",
  "transition-colors duration-150",
  "focus-within:border-[var(--accent)]",
);

const fieldInputClass = cn(
  "h-full w-full bg-transparent text-center font-mono text-xs font-medium tabular-nums",
  "text-[var(--text)] outline-none",
  "[appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none",
  "disabled:cursor-not-allowed",
);

function ChannelField({
  label,
  value,
  min,
  max,
  onCommit,
  disabled,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onCommit: (next: number) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = React.useState<string | null>(null);
  const shown = draft ?? String(Math.round(value));

  const commit = (raw: string) => {
    const parsed = Number.parseFloat(raw);
    setDraft(null);
    if (Number.isNaN(parsed)) return;
    onCommit(clamp(Math.round(parsed), min, max));
  };

  return (
    <label className="flex min-w-0 flex-1 flex-col items-center gap-1">
      <span className={fieldShellClass}>
        <input
          type="text"
          inputMode="numeric"
          value={shown}
          disabled={disabled}
          aria-label={label}
          onChange={(event) => setDraft(event.target.value)}
          onBlur={(event) => commit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit(event.currentTarget.value);
            }
            if (event.key === "ArrowUp" || event.key === "ArrowDown") {
              event.preventDefault();
              const step =
                (event.shiftKey ? 10 : 1) * (event.key === "ArrowUp" ? 1 : -1);
              setDraft(null);
              onCommit(clamp(Math.round(value) + step, min, max));
            }
          }}
          className={fieldInputClass}
        />
      </span>
      <span className="font-mono text-[10px] font-medium tracking-[0.08em] text-[var(--muted)]">
        {label}
      </span>
    </label>
  );
}

function HexField({
  hex,
  onCommit,
  disabled,
}: {
  hex: string;
  onCommit: (next: string) => void;
  disabled?: boolean;
}) {
  const [draft, setDraft] = React.useState<string | null>(null);
  const shown = (draft ?? hex).replace(/^#/, "").toUpperCase();

  const commit = (raw: string) => {
    setDraft(null);
    if (parseHex(raw)) onCommit((raw.startsWith("#") ? raw : `#${raw}`).toUpperCase());
  };

  return (
    <label className="flex min-w-0 flex-1 flex-col items-center gap-1">
      <span className={fieldShellClass}>
        <span className="pl-2.5 font-mono text-xs text-[var(--muted)]">#</span>
        <input
          type="text"
          spellCheck={false}
          autoComplete="off"
          value={shown}
          disabled={disabled}
          aria-label="Mã màu HEX"
          onChange={(event) => setDraft(event.target.value)}
          onBlur={(event) => commit(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") {
              event.preventDefault();
              commit(event.currentTarget.value);
            }
          }}
          className={cn(
            fieldInputClass,
            "pl-1 pr-2.5 text-left uppercase tracking-[0.06em]",
          )}
        />
      </span>
      <span className="font-mono text-[10px] font-medium tracking-[0.08em] text-[var(--muted)]">
        HEX
      </span>
    </label>
  );
}

/* ─── eyedropper ────────────────────────────────────────────── */

type EyeDropperCtor = new () => { open: () => Promise<{ sRGBHex: string }> };

const subscribeToNothing = () => () => {};

function useEyeDropper() {
  const supported = React.useSyncExternalStore(
    subscribeToNothing,
    () => typeof window !== "undefined" && "EyeDropper" in window,
    () => false,
  );

  const pick = React.useCallback(async () => {
    const Ctor = (window as unknown as { EyeDropper?: EyeDropperCtor })
      .EyeDropper;
    if (!Ctor) return null;
    try {
      const result = await new Ctor().open();
      return result.sRGBHex;
    } catch {
      return null;
    }
  }, []);

  return { supported, pick };
}

/* ─── panel ─────────────────────────────────────────────────── */

export interface ColorPickerPanelProps {
  /** Controlled color as a hex string (`#rrggbb` or `#rrggbbaa`). */
  value?: string;
  /** Initial color when uncontrolled. */
  defaultValue?: string;
  /** Fires on every committed change with a hex string. */
  onChange?: (hex: string) => void;
  /** Initial format shown in the fields row. */
  format?: ColorFormat;
  /** Adds the alpha rail and emits 8-digit hex below full opacity. */
  alpha?: boolean;
  /** Shows the eyedropper button where the browser supports it. */
  eyedropper?: boolean;
  /** Preset hex swatches rendered under the fields. */
  swatches?: string[];
  /** Disables every control. */
  disabled?: boolean;
  className?: string;
}

const DEFAULT_COLOR = "#059669";

function useColorState({
  value,
  defaultValue,
  onChange,
  alpha,
}: Pick<
  ColorPickerPanelProps,
  "value" | "defaultValue" | "onChange" | "alpha"
>) {
  const withAlpha = Boolean(alpha);

  const [hsva, setHsvaState] = React.useState<Hsva>(() => {
    const parsed =
      parseHex(value ?? defaultValue ?? DEFAULT_COLOR) ??
      parseHex(DEFAULT_COLOR)!;
    return rgbaToHsva(parsed);
  });

  const rgba = React.useMemo(() => hsvaToRgba(hsva), [hsva]);
  const hex = React.useMemo(
    () => rgbaToHex(rgba, withAlpha),
    [rgba, withAlpha],
  );

  const externalRgba = value === undefined ? null : parseHex(value);
  if (
    externalRgba &&
    rgbaToHex(externalRgba, withAlpha).toLowerCase() !== hex.toLowerCase()
  ) {
    setHsvaState((prev) => {
      const next = rgbaToHsva(externalRgba);
      return { ...next, h: next.s === 0 || next.v === 0 ? prev.h : next.h };
    });
  }

  const commit = (next: Hsva) => {
    setHsvaState(next);
    onChange?.(rgbaToHex(hsvaToRgba(next), withAlpha));
  };

  const setHsva = (patch: Partial<Hsva>) => commit({ ...hsva, ...patch });

  const setFromRgba = (next: Rgba) => {
    const converted = rgbaToHsva(next);
    commit({
      ...converted,
      h: converted.s === 0 || converted.v === 0 ? hsva.h : converted.h,
    });
  };

  return { hsva, rgba, hex, withAlpha, setHsva, setFromRgba };
}

export function ColorPickerPanel({
  value,
  defaultValue,
  onChange,
  format = "hex",
  alpha = false,
  eyedropper = true,
  swatches,
  disabled,
  className,
}: ColorPickerPanelProps) {
  const { hsva, rgba, hex, withAlpha, setHsva, setFromRgba } = useColorState({
    value,
    defaultValue,
    onChange,
    alpha,
  });

  const [activeFormat, setActiveFormat] = React.useState<ColorFormat>(format);
  const { supported: dropperSupported, pick } = useEyeDropper();
  const hsl = hsvaToHsl(hsva);
  const solid = hsvaToCss({ ...hsva, a: 1 }, false);
  const current = hsvaToCss(hsva, withAlpha);

  const cycleFormat = () =>
    setActiveFormat(
      (prev) =>
        FORMAT_ORDER[(FORMAT_ORDER.indexOf(prev) + 1) % FORMAT_ORDER.length] ??
        "hex",
    );

  const onEyedropper = async () => {
    const picked = await pick();
    const parsed = picked ? parseHex(picked) : null;
    if (parsed) setFromRgba({ ...parsed, a: hsva.a });
  };

  const showDropper = eyedropper && dropperSupported;

  return (
    <div
      data-slot="color-picker-panel"
      className={cn(
        "w-[272px] overflow-hidden select-none",
        "rounded-[var(--radius)] border border-[var(--border)]",
        "bg-[var(--surface)] text-[var(--text)]",
        disabled && "pointer-events-none opacity-45",
        className,
      )}
    >
      <SaturationCanvas
        hsva={hsva}
        disabled={disabled}
        onChange={(next) => setHsva(next)}
        className="h-[156px]"
      />

      <div className="flex flex-col gap-3 p-3">
        <div className="flex items-center gap-2.5">
          {showDropper && (
            <button
              type="button"
              onClick={onEyedropper}
              disabled={disabled}
              title="Chấm màu từ màn hình (EyeDropper)"
              aria-label="Chấm màu từ màn hình"
              className={cn(
                "grid size-8 shrink-0 place-items-center rounded-[var(--radius)] cursor-pointer",
                "border border-[var(--border)] bg-[var(--bg)]",
                "text-[var(--muted)] hover:bg-[var(--active-bg)] hover:text-[var(--text)]",
                "transition-colors duration-150 disabled:cursor-not-allowed",
                focusRing,
              )}
            >
              <Pipette className="size-3.5" strokeWidth={1.5} aria-hidden />
            </button>
          )}

          <span
            aria-hidden
            className="size-8 shrink-0 rounded-full border border-[var(--border)] overflow-hidden"
            style={{ background: CHECKERBOARD }}
          >
            <span
              className="block size-full rounded-full"
              style={{ backgroundColor: current }}
            />
          </span>

          <div className="flex min-w-0 flex-1 flex-col gap-2.5">
            <Rail
              label="Tông màu (Hue)"
              value={hsva.h}
              max={360}
              valueText={`${Math.round(hsva.h)}°`}
              disabled={disabled}
              onChange={(h) => setHsva({ h })}
              thumbColor={`hsl(${hsva.h} 100% 50%)`}
              trackStyle={{
                backgroundImage:
                  "linear-gradient(to right, #f00 0%, #ff0 17%, #0f0 33%, #0ff 50%, #00f 67%, #f0f 83%, #f00 100%)",
              }}
            />
            {withAlpha && (
              <Rail
                label="Độ đậm đặc (Alpha)"
                value={hsva.a * 100}
                max={100}
                valueText={`${Math.round(hsva.a * 100)}%`}
                disabled={disabled}
                onChange={(a) => setHsva({ a: clamp(a, 0, 100) / 100 })}
                thumbColor={current}
                trackStyle={{
                  background: `linear-gradient(to right, transparent, ${solid}), ${CHECKERBOARD}`,
                }}
              />
            )}
          </div>
        </div>

        <div className="flex items-start gap-2">
          {activeFormat === "hex" && (
            <HexField
              hex={hex}
              disabled={disabled}
              onCommit={(next) => {
                const parsed = parseHex(next);
                if (parsed)
                  setFromRgba(withAlpha ? parsed : { ...parsed, a: hsva.a });
              }}
            />
          )}

          {activeFormat === "rgb" && (
            <>
              <ChannelField
                label="R"
                value={rgba.r}
                min={0}
                max={255}
                disabled={disabled}
                onCommit={(r) => setFromRgba({ ...rgba, r })}
              />
              <ChannelField
                label="G"
                value={rgba.g}
                min={0}
                max={255}
                disabled={disabled}
                onCommit={(g) => setFromRgba({ ...rgba, g })}
              />
              <ChannelField
                label="B"
                value={rgba.b}
                min={0}
                max={255}
                disabled={disabled}
                onCommit={(b) => setFromRgba({ ...rgba, b })}
              />
            </>
          )}

          {activeFormat === "hsl" && (
            <>
              <ChannelField
                label="H"
                value={hsl.h}
                min={0}
                max={360}
                disabled={disabled}
                onCommit={(h) => setHsva(hslToHsva(h, hsl.s, hsl.l, hsva.a))}
              />
              <ChannelField
                label="S"
                value={hsl.s}
                min={0}
                max={100}
                disabled={disabled}
                onCommit={(s) => setHsva(hslToHsva(hsl.h, s, hsl.l, hsva.a))}
              />
              <ChannelField
                label="L"
                value={hsl.l}
                min={0}
                max={100}
                disabled={disabled}
                onCommit={(l) => setHsva(hslToHsva(hsl.h, hsl.s, l, hsva.a))}
              />
            </>
          )}

          {withAlpha && activeFormat !== "hex" && (
            <ChannelField
              label="A"
              value={hsva.a * 100}
              min={0}
              max={100}
              disabled={disabled}
              onCommit={(a) => setHsva({ a: a / 100 })}
            />
          )}

          <button
            type="button"
            onClick={cycleFormat}
            disabled={disabled}
            title={`Định dạng màu: ${activeFormat.toUpperCase()} (Bấm để chuyển HEX / RGB / HSL)`}
            aria-label={`Định dạng màu: ${activeFormat.toUpperCase()}. Chuyển đổi định dạng`}
            className={cn(
              "grid size-8 shrink-0 place-items-center rounded-[var(--radius)] cursor-pointer",
              "border border-[var(--border)] bg-[var(--bg)] text-[var(--muted)]",
              "transition-colors duration-150 hover:bg-[var(--active-bg)] hover:text-[var(--text)]",
              "disabled:cursor-not-allowed",
              focusRing,
            )}
          >
            <ChevronsUpDown className="size-3.5" strokeWidth={1.5} aria-hidden />
          </button>
        </div>

        {swatches && swatches.length > 0 && (
          <div className="flex flex-wrap items-center justify-between gap-1.5 border-t border-[var(--border)] pt-2.5">
            {swatches.map((swatch) => {
              const selected =
                swatch.toLowerCase() === hex.slice(0, 7).toLowerCase();
              const parsedSwatch = parseHex(swatch);
              const darkMark = parsedSwatch ? isLightColor(parsedSwatch) : false;
              return (
                <button
                  key={swatch}
                  type="button"
                  disabled={disabled}
                  title={`Chọn mẫu màu ${swatch}`}
                  aria-label={swatch}
                  aria-pressed={selected}
                  onClick={() => {
                    const parsed = parseHex(swatch);
                    if (parsed) setFromRgba({ ...parsed, a: hsva.a });
                  }}
                  className={cn(
                    "size-6 rounded-full cursor-pointer flex items-center justify-center",
                    "border border-black/15 transition-colors duration-150",
                    selected && "ring-2 ring-[var(--accent)] ring-offset-1 ring-offset-[var(--surface)]",
                    focusRing,
                  )}
                  style={{ backgroundColor: swatch }}
                >
                  <Check
                    className={cn(
                      "size-3",
                      selected ? "opacity-100" : "opacity-0",
                      darkMark ? "text-black/80" : "text-white",
                    )}
                    strokeWidth={2}
                    aria-hidden
                  />
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

/* ─── trigger + popover ─────────────────────────────────────── */

export interface ColorPickerProps extends ColorPickerPanelProps {
  /** Controlled open state of the popover. */
  open?: boolean;
  /** Initial open state when uncontrolled. */
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean) => void;
  /** Which side the panel opens on. */
  side?: "top" | "right" | "bottom" | "left";
  align?: "start" | "center" | "end";
  /** Hides the hex label inside the trigger. */
  showValue?: boolean;
  /** Optional custom label inside the default trigger. */
  triggerLabel?: string;
  /** Replaces the default trigger. */
  children?: React.ReactNode;
}

export function ColorPicker({
  open,
  defaultOpen,
  onOpenChange,
  side = "bottom",
  align = "start",
  showValue = true,
  triggerLabel,
  children,
  className,
  ...panelProps
}: ColorPickerProps) {
  const { value, defaultValue, alpha } = panelProps;
  const [internalHex, setInternalHex] = React.useState(
    () => value ?? defaultValue ?? DEFAULT_COLOR,
  );
  const hex = value ?? internalHex;
  const displayHex = React.useMemo(() => {
    const parsed = parseHex(hex);
    return parsed ? rgbaToHex(parsed, Boolean(alpha)) : hex;
  }, [hex, alpha]);

  return (
    <PopoverPrimitive.Root
      open={open}
      defaultOpen={defaultOpen}
      onOpenChange={onOpenChange}
    >
      <PopoverPrimitive.Trigger asChild disabled={panelProps.disabled}>
        {children ? (
          children
        ) : (
          <button
            type="button"
            className={cn(
              "inline-flex h-8 items-center gap-2 cursor-pointer",
              "rounded-[var(--radius)] border border-[var(--border)]",
              "bg-[var(--surface)] px-2.5 text-xs text-[var(--text)]",
              "transition-colors duration-150 hover:bg-[var(--active-bg)] hover:border-[var(--accent)]",
              "disabled:cursor-not-allowed disabled:opacity-45",
              focusRing,
              className,
            )}
          >
            <span
              aria-hidden
              className="size-4 shrink-0 rounded-full border border-black/15 overflow-hidden"
              style={{ background: CHECKERBOARD }}
            >
              <span
                className="block size-full rounded-full"
                style={{ backgroundColor: displayHex }}
              />
            </span>
            {triggerLabel && (
              <span className="font-semibold text-[var(--text)]">
                {triggerLabel}
              </span>
            )}
            {showValue && (
              <span className="font-mono font-medium uppercase tabular-nums text-[var(--muted)]">
                {displayHex}
              </span>
            )}
          </button>
        )}
      </PopoverPrimitive.Trigger>
      <PopoverPrimitive.Portal>
        <PopoverPrimitive.Content
          side={side}
          align={align}
          sideOffset={8}
          collisionPadding={12}
          className="z-[99999] outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 duration-150"
        >
          <ColorPickerPanel
            {...panelProps}
            onChange={(next) => {
              setInternalHex(next);
              panelProps.onChange?.(next);
            }}
          />
        </PopoverPrimitive.Content>
      </PopoverPrimitive.Portal>
    </PopoverPrimitive.Root>
  );
}
